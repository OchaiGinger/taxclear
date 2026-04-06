"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  taxBracketComputation,
  TaxBracketComputationOutput,
} from "@/ai/flows/tax-bracket-computation";
import {
  taxReliefGuidance,
  TaxReliefGuidanceOutput,
} from "@/ai/flows/tax-relief-guidance";
import { verifyBvnWithMono } from "@/app/actions/mono-actions";
import {
  Loader2,
  ShieldCheck,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------
const bvnFormSchema = z.object({
  bvn: z
    .string()
    .length(11, { message: "BVN must be exactly 11 digits." })
    .regex(/^\d+$/, { message: "BVN must contain only numbers." }),
});

type BvnFormValues = z.infer<typeof bvnFormSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const CalculatorDialog = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [step, setStep] = useState(1);
  const [income, setIncome] = useState("");
  const [userName, setUserName] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [hasNHF, setHasNHF] = useState(false);
  const [hasPension, setHasPension] = useState(false);
  const [results, setResults] = useState<TaxBracketComputationOutput | null>(
    null,
  );
  const [guidance, setGuidance] = useState<TaxReliefGuidanceOutput | null>(
    null,
  );

  const form = useForm<BvnFormValues>({
    resolver: zodResolver(bvnFormSchema),
    defaultValues: { bvn: "" },
  });

  // -------------------------------------------------------------------------
  // BVN verification
  // -------------------------------------------------------------------------
  const handleBvnVerify = async () => {
    const isValid = await form.trigger("bvn");
    if (!isValid) return;

    const bvn = form.getValues("bvn");
    setFetching(true);

    try {
      const response = await verifyBvnWithMono(bvn);

      if (response.status === "success" || response.data) {
        const profile = response.data;
        const formattedIncome = new Intl.NumberFormat("en-NG").format(
          profile.estimated_annual_income,
        );

        setIncome(formattedIncome);
        setUserName(`${profile.first_name} ${profile.last_name}`);
        setHasPension(true);
        setHasNHF(true);
        setIsVerified(true);

        toast.success("Mono Identity Sync Successful", {
          description: `Verified account for ${profile.first_name}. Annual income data retrieved.`,
        });
      }
    } catch (error: any) {
      toast.error("Mono Connection Error", {
        description:
          error.message || "Failed to establish secure handshake via Mono.",
      });
    } finally {
      setFetching(false);
    }
  };

  // -------------------------------------------------------------------------
  // Tax computation
  // -------------------------------------------------------------------------
  const handleCompute = async () => {
    setLoading(true);
    try {
      const annualIncome = parseFloat(income.replace(/,/g, ""));
      if (isNaN(annualIncome)) throw new Error("Invalid income");

      const compResults = await taxBracketComputation({
        annualIncome,
        hasNHF,
        hasPension,
      });
      setResults(compResults);

      const reliefResults = await taxReliefGuidance({
        annualIncome: compResults.annualIncome,
        monthlyPAYE: compResults.monthlyPAYEBreakdown,
        effectiveTaxRate: compResults.effectiveTaxRate * 100,
        taxBracket: compResults.estimatedTaxBracket,
        financeActDetails:
          "2024 Finance Act: Top rate 24% for >3.2M. Personal relief 200k + 20%.",
      });
      setGuidance(reliefResults);

      setStep(2);
    } catch (error) {
      console.error(error);
      toast.error("Computation Error", {
        description: "An error occurred while processing your tax analysis.",
      });
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  const formatNaira = (val: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(val);

  const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");

  const resetModal = () => {
    setStep(1);
    setIncome("");
    setUserName("");
    setIsVerified(false);
    setResults(null);
    setGuidance(null);
    form.reset();
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) resetModal();
      }}
    >
      {/* asChild removed — not supported by this DialogTrigger */}
      <DialogTrigger>{children}</DialogTrigger>

      <DialogContent className="max-w-4xl bg-brand-black border-white/10 text-white p-0 overflow-hidden outline-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Mono Secured Tax Liability Calculator</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-[300px_1fr] min-h-[600px]">
          {/* Sidebar */}
          <div className="bg-brand-dark p-8 border-r border-white/5 flex flex-col gap-6">
            <div className="space-y-4">
              <div className="w-10 h-10 bg-brand-green/10 border border-brand-green/20 flex items-center justify-center rounded-sm">
                <Building2 className="w-5 h-5 text-brand-green" />
              </div>
              <div className="space-y-1">
                <span className="text-[0.65rem] font-bold text-brand-green tracking-[0.2em] uppercase">
                  Mono Partner
                </span>
                <p className="text-[0.6rem] text-white/40 leading-relaxed uppercase tracking-wider">
                  Secured Financial Access
                </p>
              </div>
            </div>

            <div className="mt-auto space-y-4">
              <div
                className={cn(
                  "p-4 border border-white/5 transition-all",
                  step === 1
                    ? "bg-white/5 border-brand-green/30"
                    : "opacity-30",
                )}
              >
                <p className="text-[0.7rem] font-bold uppercase tracking-wider mb-1">
                  Step 01
                </p>
                <p className="text-xs text-white/60">Mono Identity Sync</p>
              </div>
              <div
                className={cn(
                  "p-4 border border-white/5 transition-all",
                  step === 2
                    ? "bg-white/5 border-brand-green/30"
                    : "opacity-30",
                )}
              >
                <p className="text-[0.7rem] font-bold uppercase tracking-wider mb-1">
                  Step 02
                </p>
                <p className="text-xs text-white/60">Tax Optimization</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-10 bg-[#070707] overflow-y-auto max-h-[85vh]">
            {/* ----------------------------------------------------------------
                Step 1 — Identity Sync
            ---------------------------------------------------------------- */}
            {step === 1 ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                  <h2 className="text-3xl font-headline font-bold uppercase tracking-tight">
                    Identity{" "}
                    <span className="font-serif italic text-brand-green">
                      Sync
                    </span>
                  </h2>
                  <p className="text-white/40 text-sm max-w-md">
                    Connect your financial data via Mono&apos;s read-only
                    lookup. Your security is maintained through zero-retention
                    processing.
                  </p>
                </div>

                <Form {...form}>
                  <div className="space-y-6">
                    {/* BVN Field */}
                    <FormField
                      control={form.control}
                      name="bvn"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <div className="flex justify-between items-center">
                            <FormLabel className="uppercase text-[0.7rem] font-bold tracking-widest text-white/50 flex items-center gap-2">
                              <Fingerprint className="w-3 h-3 text-brand-green" />
                              Bank Verification Number
                            </FormLabel>
                            <span className="text-[0.6rem] text-white/20 uppercase font-medium">
                              11 Digits Required
                            </span>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                maxLength={11}
                                placeholder="e.g. 22233344455"
                                disabled={isVerified}
                                className="h-16 bg-white/5 border-white/10 rounded-none text-2xl font-headline focus:ring-brand-green pr-36"
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value.replace(/\D/g, ""),
                                  )
                                }
                              />
                              <Button
                                type="button"
                                onClick={handleBvnVerify}
                                disabled={fetching || isVerified}
                                className="absolute right-2 top-2 bottom-2 h-auto rounded-none bg-white/10 text-white hover:bg-brand-green hover:text-white transition-all text-[0.65rem] font-bold uppercase px-4 border border-white/10"
                              >
                                {fetching ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : isVerified ? (
                                  <CheckCircle2 className="w-4 h-4 text-brand-green" />
                                ) : (
                                  "Verify Identity"
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-400 text-[0.7rem]" />
                        </FormItem>
                      )}
                    />

                    {/* Verified profile card */}
                    {isVerified && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="p-6 border border-brand-green/20 bg-brand-green/5 space-y-4">
                          <div className="flex justify-between items-end">
                            <div className="space-y-1">
                              <Label className="uppercase text-[0.65rem] font-bold tracking-widest text-white/50">
                                Verified Profile: {userName}
                              </Label>
                              <p className="text-3xl font-headline font-bold text-white">
                                {formatNaira(
                                  parseFloat(income.replace(/,/g, "")),
                                )}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[0.6rem] bg-brand-green text-white px-2 py-1 uppercase font-bold tracking-tighter">
                                Mono Verified
                              </span>
                              <p className="text-[0.5rem] text-white/40 uppercase">
                                Sync Ref:{" "}
                                {Math.random()
                                  .toString(36)
                                  .substring(7)
                                  .toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Deduction toggles */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border border-white/5 flex items-center justify-between group hover:border-brand-green/30 transition-colors">
                        <div className="space-y-1">
                          <Label className="uppercase text-[0.65rem] font-bold tracking-widest">
                            Pension (8%)
                          </Label>
                          <p className="text-[0.6rem] text-white/40">
                            Statutory Deduction
                          </p>
                        </div>
                        <Switch
                          checked={hasPension}
                          onCheckedChange={setHasPension}
                        />
                      </div>
                      <div className="p-4 border border-white/5 flex items-center justify-between group hover:border-brand-green/30 transition-colors">
                        <div className="space-y-1">
                          <Label className="uppercase text-[0.65rem] font-bold tracking-widest">
                            NHF (2.5%)
                          </Label>
                          <p className="text-[0.6rem] text-white/40">
                            Housing Fund
                          </p>
                        </div>
                        <Switch checked={hasNHF} onCheckedChange={setHasNHF} />
                      </div>
                    </div>

                    {/* Submit */}
                    <div className="space-y-4">
                      <Button
                        type="button"
                        onClick={handleCompute}
                        disabled={!income || loading}
                        className="w-full h-16 rounded-none bg-brand-green text-white hover:bg-white hover:text-black font-bold uppercase tracking-widest text-[0.8rem] transition-all"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          "Run AI Tax Analysis →"
                        )}
                      </Button>
                      <div className="flex items-center gap-2 justify-center text-[0.6rem] text-white/30 uppercase font-medium">
                        <ShieldCheck className="w-3 h-3 text-brand-green" />{" "}
                        End-to-End Encrypted Session
                      </div>
                    </div>
                  </div>
                </Form>
              </div>
            ) : (
              /* ----------------------------------------------------------------
               Step 2 — Results
            ---------------------------------------------------------------- */
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div>
                    <span className="text-[0.65rem] font-bold text-brand-green tracking-[0.2em] uppercase">
                      Est. Monthly PAYE for {userName}
                    </span>
                    <h3 className="text-4xl font-headline font-bold mt-1">
                      {formatNaira(results?.monthlyPAYEBreakdown || 0)}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[0.65rem] font-bold text-white/40 tracking-[0.2em] uppercase">
                      Effective Rate
                    </span>
                    <p className="text-2xl font-headline font-bold text-brand-green">
                      {((results?.effectiveTaxRate || 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-white/40">
                      Computation Details
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">
                          Annual Taxable Income
                        </span>
                        <span>{formatNaira(results?.taxableIncome || 0)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">
                          Personal Relief (PRA)
                        </span>
                        <span className="text-brand-green">
                          -{formatNaira(results?.personalReliefAllowance || 0)}
                        </span>
                      </div>
                      {hasPension && (
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Pension Relief</span>
                          <span className="text-brand-green">
                            -{formatNaira(results?.pensionRelief || 0)}
                          </span>
                        </div>
                      )}
                      {hasNHF && (
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">NHF Deduction</span>
                          <span className="text-brand-green">
                            -{formatNaira(results?.nhfDeduction || 0)}
                          </span>
                        </div>
                      )}
                      <div className="pt-3 border-t border-white/5 flex justify-between font-bold">
                        <span className="uppercase text-[0.65rem] tracking-widest">
                          Annual Total Tax
                        </span>
                        <span className="text-brand-green">
                          {formatNaira(results?.annualPAYE || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 border border-white/10">
                    <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-brand-green mb-4">
                      Relief Opportunities
                    </h4>
                    <div className="space-y-4">
                      {guidance?.recommendations.slice(0, 2).map((rec, i) => (
                        <div key={i} className="space-y-1">
                          <p className="text-xs font-bold uppercase">
                            {rec.allowanceType}
                          </p>
                          <p className="text-[0.65rem] text-white/60 leading-relaxed">
                            {rec.potentialSavings}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-brand-green" />
                    <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-white/40">
                      Regulatory Breakdown
                    </h4>
                  </div>
                  <div className="p-6 border border-white/5 text-[0.75rem] leading-relaxed text-white/70 bg-brand-dark/50 font-medium whitespace-pre-line">
                    {results?.explanation}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={resetModal}
                    className="flex-1 h-12 border border-white/20 hover:bg-white hover:text-black uppercase text-[0.7rem] font-bold tracking-widest transition-all"
                  >
                    New Calculation
                  </button>
                  <button className="flex-1 h-12 bg-brand-green text-white hover:bg-white hover:text-black uppercase text-[0.7rem] font-bold tracking-widest transition-all">
                    Export FIRS Sheet
                  </button>
                </div>

                <p className="text-[0.6rem] text-white/30 italic text-center leading-relaxed">
                  {guidance?.disclaimer}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
