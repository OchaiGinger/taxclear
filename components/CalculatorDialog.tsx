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

// ── TAX LOGIC (YOUR ORIGINAL) ─────────────────────────────────────

const BRACKETS = [
  { limit: 300_000, rate: 0.07 },
  { limit: 300_000, rate: 0.11 },
  { limit: 500_000, rate: 0.15 },
  { limit: 500_000, rate: 0.19 },
  { limit: 1_600_000, rate: 0.21 },
  { limit: Infinity, rate: 0.24 },
];

function computeTax(
  annualIncome: number,
  hasPension: boolean,
  hasNHF: boolean,
) {
  const pensionRelief = hasPension ? annualIncome * 0.08 : 0;
  const nhfRelief = hasNHF ? annualIncome * 0.025 : 0;

  const consolidatedRelief = Math.max(200_000, annualIncome * 0.2);

  const taxableIncome = Math.max(
    0,
    annualIncome - consolidatedRelief - pensionRelief - nhfRelief,
  );

  let tax = 0;
  let remaining = taxableIncome;

  for (const { limit, rate } of BRACKETS) {
    if (remaining <= 0) break;
    const slice = Math.min(remaining, limit);
    tax += slice * rate;
    remaining -= slice;
  }

  const effectiveTaxRate = annualIncome > 0 ? tax / annualIncome : 0;

  return {
    annualIncome,
    taxableIncome,
    pensionRelief,
    nhfRelief,
    personalReliefAllowance: consolidatedRelief,
    annualPAYE: tax,
    monthlyPAYE: tax / 12,
    effectiveTaxRate,
  };
}

// ── COMPONENT ─────────────────────────────────────────────────────

export const CalculatorDialog = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [step, setStep] = useState(1);

  const [bvn, setBvn] = useState("");
  const [income, setIncome] = useState("");
  const [userName, setUserName] = useState("");

  const [isVerified, setIsVerified] = useState(false);
  const [hasNHF, setHasNHF] = useState(false);
  const [hasPension, setHasPension] = useState(false);

  const [results, setResults] = useState<any>(null);

  const formatNaira = (val: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(val);

  const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");

  // ── BVN VERIFY ─────────────────────────────────

  const handleBvnVerify = async () => {
    if (bvn.length < 11) return;
    setFetching(true);

    try {
      const response = await verifyBvnWithMono(bvn);

      if (response.status === "success" || response.data) {
        const profile = response.data;

        setIncome(
          new Intl.NumberFormat("en-NG").format(
            profile.estimated_annual_income,
          ),
        );

        setUserName(`${profile.first_name} ${profile.last_name}`);
        setHasPension(true);
        setHasNHF(true);
        setIsVerified(true);

        toast.success("Mono Identity Sync Successful", {
          description: `Verified account for ${profile.first_name}`,
        });
      }
    } catch (error: any) {
      toast.error("Mono Connection Error", {
        description: error.message,
      });
    } finally {
      setFetching(false);
    }
  };

  // ── COMPUTE ─────────────────────────────────

  const handleCompute = async () => {
    setLoading(true);

    try {
      const annualIncome = parseFloat(income.replace(/,/g, ""));
      if (isNaN(annualIncome)) throw new Error("Invalid income");

      const local = computeTax(annualIncome, hasPension, hasNHF);

      setResults(local);
      setStep(2);

      toast.success("Tax analysis completed");
    } catch (error: any) {
      toast.error(error.message || "Computation failed");
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setBvn("");
    setIncome("");
    setUserName("");
    setIsVerified(false);
    setResults(null);
  };

  // ── UI ─────────────────────────────────

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) resetModal();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="w-screen h-screen  max-w-none! p-0 bg-brand-black text-white overflow-hidden border-none rounded-none translate-x-0! translate-y-0! top-0! left-0! right-0! bottom-0! fixed!">
        <DialogHeader className="sr-only">
          <DialogTitle>Tax Calculator</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-[300px_1fr] h-full">
          {/* Sidebar */}
          <aside className="bg-brand-dark p-8 border-r border-white/5 flex flex-col gap-6">
            <Building2 className="w-6 h-6 text-brand-green" />

            <div className="mt-auto space-y-4">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "p-4 border border-white/5",
                    step === s ? "bg-white/5" : "opacity-30",
                  )}
                >
                  Step 0{s}
                </div>
              ))}
            </div>
          </aside>

          {/* Main */}
          <main className="p-10 overflow-y-auto h-full w-full bg-[#070707]">
            {step === 1 ? (
              <div className="space-y-6">
                <Label>BVN</Label>
                <Input
                  value={bvn}
                  maxLength={11}
                  onChange={(e) => setBvn(e.target.value.replace(/\D/g, ""))}
                />

                <Button onClick={handleBvnVerify}>
                  {fetching ? <Loader2 className="animate-spin" /> : "Verify"}
                </Button>

                {isVerified && (
                  <p>
                    {userName} — {formatNaira(parseFloat(income))}
                  </p>
                )}

                <div className="flex gap-4">
                  <Switch
                    checked={hasPension}
                    onCheckedChange={setHasPension}
                  />
                  Pension
                  <Switch checked={hasNHF} onCheckedChange={setHasNHF} />
                  NHF
                </div>

                <Button onClick={handleCompute} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : "Compute"}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <h2>{formatNaira(results.monthlyPAYE)}</h2>
                <p>Annual: {formatNaira(results.annualPAYE)}</p>
                <p>
                  Effective Rate: {(results.effectiveTaxRate * 100).toFixed(2)}%
                </p>

                <Button onClick={resetModal}>Reset</Button>
              </div>
            )}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
};
