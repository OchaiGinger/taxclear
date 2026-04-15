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
import { Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { exchangeMonoToken, fetchTransactions } from "@/app/actions/mono";

// ── TAX LOGIC ─────────────────────────────────────────────────────

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

  return {
    annualIncome,
    taxableIncome,
    pensionRelief,
    nhfRelief,
    personalReliefAllowance: consolidatedRelief,
    annualPAYE: tax,
    monthlyPAYE: tax / 12,
    effectiveTaxRate: annualIncome > 0 ? tax / annualIncome : 0,
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

  // ── MONO CONNECT ───────────────────────────────────────────────

  const handleConnectBank = async () => {
    setFetching(true);

    try {
      const MonoConnect = (await import("@mono.co/connect.js")).default;

      const connect = new MonoConnect({
        key: process.env.NEXT_PUBLIC_MONO_PUBLIC_KEY!,
        scope: "auth",
        data: {
          customer: {
            name: "Tax User",
          },
        },
        onSuccess: async ({ code }: { code: string }) => {
          try {
            const { data: account } = await exchangeMonoToken(code);
            const accountId = account.id;

            const txData = await fetchTransactions(accountId);
            const transactions: any[] = txData.data ?? [];

            const incomeEstimate = transactions
              .filter((tx) => tx.type === "credit")
              .reduce((sum, tx) => sum + tx.amount / 100, 0);

            setIncome(new Intl.NumberFormat("en-NG").format(incomeEstimate));
            setUserName("Connected Bank User");
            setIsVerified(true);

            toast.success("Bank Connected Successfully");
          } catch (err: any) {
            toast.error("Failed to fetch transactions", {
              description: err.message,
            });
          } finally {
            setFetching(false);
          }
        },
        onClose: () => setFetching(false),
      });

      connect.setup();
      connect.open();
    } catch (error: any) {
      toast.error("Mono Connection Failed", { description: error.message });
      setFetching(false);
    }
  };
  // ── COMPUTE ────────────────────────────────────────────────────

  const handleCompute = async () => {
    setLoading(true);
    try {
      const annualIncome = parseFloat(income.replace(/,/g, ""));
      if (isNaN(annualIncome)) throw new Error("Invalid income");

      setResults(computeTax(annualIncome, hasPension, hasNHF));
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

  // ── UI ─────────────────────────────────────────────────────────

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) resetModal();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="w-screen h-screen max-w-none! p-0 bg-brand-black text-white overflow-hidden border-none rounded-none translate-x-0! translate-y-0! top-0! left-0! right-0! bottom-0! fixed!">
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
                <div className="space-y-2">
                  <Label>BVN</Label>
                  <Input
                    value={bvn}
                    maxLength={11}
                    placeholder="Enter your BVN"
                    onChange={(e) => setBvn(e.target.value.replace(/\D/g, ""))}
                  />
                </div>

                <Button
                  onClick={handleConnectBank}
                  disabled={fetching || isVerified}
                  className="w-full"
                >
                  {fetching ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />{" "}
                      Connecting...
                    </>
                  ) : isVerified ? (
                    "Bank Connected ✓"
                  ) : (
                    "Connect Bank"
                  )}
                </Button>

                {isVerified && (
                  <p className="text-sm text-white/60">
                    {userName} —{" "}
                    <span className="text-white">
                      {formatNaira(parseFloat(income.replace(/,/g, "")))}
                    </span>{" "}
                    estimated annual income
                  </p>
                )}

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={hasPension}
                      onCheckedChange={setHasPension}
                    />
                    <Label>Pension</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={hasNHF} onCheckedChange={setHasNHF} />
                    <Label>NHF</Label>
                  </div>
                </div>

                <Button
                  onClick={handleCompute}
                  disabled={loading || !isVerified}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />{" "}
                      Computing...
                    </>
                  ) : (
                    "Compute Tax"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-white/40 uppercase tracking-widest mb-1">
                    Monthly PAYE
                  </p>
                  <h2 className="text-4xl font-bold">
                    {formatNaira(results.monthlyPAYE)}
                  </h2>
                </div>

                <div className="space-y-3 border border-white/10 p-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Annual Income</span>
                    <span>{formatNaira(results.annualIncome)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Taxable Income</span>
                    <span>{formatNaira(results.taxableIncome)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Consolidated Relief</span>
                    <span>{formatNaira(results.personalReliefAllowance)}</span>
                  </div>
                  {results.pensionRelief > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Pension Relief</span>
                      <span>{formatNaira(results.pensionRelief)}</span>
                    </div>
                  )}
                  {results.nhfRelief > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">NHF Relief</span>
                      <span>{formatNaira(results.nhfRelief)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm border-t border-white/10 pt-3">
                    <span className="text-white/50">Annual PAYE</span>
                    <span className="font-semibold">
                      {formatNaira(results.annualPAYE)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Effective Rate</span>
                    <span className="font-semibold text-brand-green">
                      {(results.effectiveTaxRate * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>

                <Button
                  onClick={resetModal}
                  variant="outline"
                  className="w-full"
                >
                  Reset
                </Button>
              </div>
            )}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
};
