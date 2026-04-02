"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Loader2,
  ArrowRight,
  ShieldCheck,
  PieChart,
  Landmark,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const CalculatorDialog = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: input, 2: results
  const [income, setIncome] = useState("");
  const [hasNHF, setHasNHF] = useState(false);
  const [hasPension, setHasPension] = useState(false);

  const [results, setResults] = useState<TaxBracketComputationOutput | null>(
    null,
  );
  const [guidance, setGuidance] = useState<TaxReliefGuidanceOutput | null>(
    null,
  );

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
    } finally {
      setLoading(false);
    }
  };

  const formatNaira = (val: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(val);

  const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) setStep(1);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl bg-brand-black border-white/10 text-white p-0 overflow-hidden">
        <div className="grid md:grid-cols-[300px_1fr] min-h-[600px]">
          <div className="bg-brand-dark p-8 border-r border-white/5 flex flex-col gap-6">
            <div className="space-y-2">
              <span className="text-[0.65rem] font-bold text-brand-green tracking-[0.2em] uppercase">
                Security Standard
              </span>
              <div className="flex items-center gap-2 text-white/40 text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>NIBSS Read-Only Encryption</span>
              </div>
            </div>

            <div className="mt-auto space-y-4">
              <div
                className={cn(
                  "p-4 border border-white/5 transition-all",
                  step === 1 ? "bg-white/5" : "opacity-30",
                )}
              >
                <p className="text-[0.7rem] font-bold uppercase tracking-wider mb-1">
                  Step 01
                </p>
                <p className="text-xs text-white/60">Input Income Details</p>
              </div>
              <div
                className={cn(
                  "p-4 border border-white/5 transition-all",
                  step === 2 ? "bg-white/5" : "opacity-30",
                )}
              >
                <p className="text-[0.7rem] font-bold uppercase tracking-wider mb-1">
                  Step 02
                </p>
                <p className="text-xs text-white/60">Review Analysis</p>
              </div>
            </div>
          </div>

          <div className="p-10 bg-[#070707] overflow-y-auto max-h-[85vh]">
            {step === 1 ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                  <h2 className="text-3xl font-headline font-bold uppercase tracking-tight">
                    Tax{" "}
                    <span className="font-serif italic text-brand-green">
                      Calculator
                    </span>
                  </h2>
                  <p className="text-white/40 text-sm max-w-md">
                    Enter your gross annual income to see your FIRS tax
                    breakdown under the 2024 Finance Act.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="income"
                      className="uppercase text-[0.7rem] font-bold tracking-widest text-white/50"
                    >
                      Total Annual Income (NGN)
                    </Label>
                    <Input
                      id="income"
                      placeholder="e.g. 12,000,000"
                      className="h-16 bg-white/5 border-white/10 rounded-none text-2xl font-headline focus:ring-brand-green"
                      value={income}
                      onChange={(e) => setIncome(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-white/5 flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="uppercase text-[0.65rem] font-bold tracking-widest">
                          Pension (8%)
                        </Label>
                        <p className="text-[0.6rem] text-white/40">
                          Statutory Relief
                        </p>
                      </div>
                      <Switch
                        checked={hasPension}
                        onCheckedChange={setHasPension}
                      />
                    </div>
                    <div className="p-4 border border-white/5 flex items-center justify-between">
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

                  <Button
                    onClick={handleCompute}
                    disabled={!income || loading}
                    className="w-full h-16 rounded-none bg-brand-green text-white hover:bg-white hover:text-black font-bold uppercase tracking-widest text-[0.8rem]"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Compute Tax Breakdown →"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div>
                    <span className="text-[0.65rem] font-bold text-brand-green tracking-[0.2em] uppercase">
                      Your Estimated Monthly PAYE
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
                      {(results?.effectiveTaxRate || 0 * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-white/40">
                      Calculation Summary
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
                        <span className="text-green-500">
                          -{formatNaira(results?.personalReliefAllowance || 0)}
                        </span>
                      </div>
                      {hasPension && (
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Pension Relief</span>
                          <span className="text-green-500">
                            -{formatNaira(results?.pensionRelief || 0)}
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
                      Tax Relief Opportunities
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
                  <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-white/40">
                    Expert Breakdown
                  </h4>
                  <div className="p-6 border border-white/5 text-[0.75rem] leading-relaxed text-white/70 bg-brand-dark/50">
                    {results?.explanation}
                  </div>
                </div>

                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="w-full h-12 rounded-none border-white/20 hover:bg-white hover:text-black uppercase text-[0.7rem] font-bold tracking-widest"
                >
                  New Calculation
                </Button>

                <p className="text-[0.6rem] text-white/30 italic text-center">
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
