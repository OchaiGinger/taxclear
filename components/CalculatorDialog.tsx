"use client";

import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, ShieldCheck } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface TaxResults {
  annualIncome: number;
  taxableIncome: number;
  personalReliefAllowance: number;
  pensionRelief: number;
  annualPAYE: number;
  monthlyPAYE: number;
  effectiveTaxRate: number;
  bracket: string;
  explanation: string;
}

// ── Tax Computation (2024 Finance Act) ───────────────────────────────────────

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
): TaxResults {
  const pensionRelief = hasPension ? annualIncome * 0.08 : 0;
  const nhfRelief = hasNHF ? annualIncome * 0.025 : 0;
  const consolidatedRelief = Math.max(200_000, annualIncome * 0.2);
  const personalReliefAllowance = consolidatedRelief;

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
  const bracket =
    taxableIncome <= 300_000
      ? "7%"
      : taxableIncome <= 600_000
        ? "11%"
        : taxableIncome <= 1_100_000
          ? "15%"
          : taxableIncome <= 1_600_000
            ? "19%"
            : taxableIncome <= 3_200_000
              ? "21%"
              : "24%";

  const explanation =
    `Your gross annual income of ${fmt(annualIncome)} qualifies for a ` +
    `consolidated relief of ${fmt(consolidatedRelief)}` +
    (hasPension ? `, pension deduction of ${fmt(pensionRelief)}` : "") +
    (hasNHF ? `, NHF deduction of ${fmt(nhfRelief)}` : "") +
    `. This brings your taxable income to ${fmt(taxableIncome)}, ` +
    `attracting an annual PAYE of ${fmt(tax)} at an effective rate of ` +
    `${(effectiveTaxRate * 100).toFixed(2)}% under the 2024 Finance Act.`;

  return {
    annualIncome,
    taxableIncome,
    personalReliefAllowance,
    pensionRelief,
    annualPAYE: tax,
    monthlyPAYE: tax / 12,
    effectiveTaxRate,
    bracket,
    explanation,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (val: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    val,
  );

const cn = (...cls: (string | false | undefined)[]) =>
  cls.filter(Boolean).join(" ");

// ── Component ────────────────────────────────────────────────────────────────

export const CalculatorDialog = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [income, setIncome] = useState("");
  const [hasPension, setHasPension] = useState(false);
  const [hasNHF, setHasNHF] = useState(false);
  const [results, setResults] = useState<TaxResults | null>(null);

  const handleCompute = async () => {
    const annualIncome = parseFloat(income.replace(/,/g, ""));
    if (isNaN(annualIncome)) return;

    setLoading(true);
    // Small async tick so the spinner renders before heavy compute
    await new Promise((r) => setTimeout(r, 0));
    setResults(computeTax(annualIncome, hasPension, hasNHF));
    setLoading(false);
    setStep(2);
  };

  const reset = () => {
    setOpen(false);
    setStep(1);
    setIncome("");
    setHasPension(false);
    setHasNHF(false);
    setResults(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        setOpen(o);
      }}
    >
      {/* Wrap in div to avoid nested <button> hydration error */}
      <div onClick={() => setOpen(true)} className="contents">
        {children}
      </div>

      <DialogContent className="max-w-4xl bg-brand-black border-white/10 text-white p-0 overflow-hidden">
        <div className="grid md:grid-cols-[300px_1fr] min-h-150">
          {/* ── Sidebar ── */}
          <aside className="bg-brand-dark p-8 border-r border-white/5 flex flex-col gap-6">
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
              {(
                [
                  [1, "Input Income Details"],
                  [2, "Review Analysis"],
                ] as const
              ).map(([s, label]) => (
                <div
                  key={s}
                  className={cn(
                    "p-4 border border-white/5 transition-all",
                    step === s ? "bg-white/5" : "opacity-30",
                  )}
                >
                  <p className="text-[0.7rem] font-bold uppercase tracking-wider mb-1">
                    Step 0{s}
                  </p>
                  <p className="text-xs text-white/60">{label}</p>
                </div>
              ))}
            </div>
          </aside>

          {/* ── Main ── */}
          <main className="p-10 bg-[#070707] overflow-y-auto max-h-[85vh]">
            {/* Step 1 – Input */}
            {step === 1 && (
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
                    {(
                      [
                        [
                          "Pension (8%)",
                          "Statutory Relief",
                          hasPension,
                          setHasPension,
                        ],
                        ["NHF (2.5%)", "Housing Fund", hasNHF, setHasNHF],
                      ] as const
                    ).map(([title, sub, checked, onChange]) => (
                      <div
                        key={title}
                        className="p-4 border border-white/5 flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <Label className="uppercase text-[0.65rem] font-bold tracking-widest">
                            {title}
                          </Label>
                          <p className="text-[0.6rem] text-white/40">{sub}</p>
                        </div>
                        <Switch checked={checked} onCheckedChange={onChange} />
                      </div>
                    ))}
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
            )}

            {/* Step 2 – Results */}
            {step === 2 && results && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div>
                    <span className="text-[0.65rem] font-bold text-brand-green tracking-[0.2em] uppercase">
                      Your Estimated Monthly PAYE
                    </span>
                    <h3 className="text-4xl font-headline font-bold mt-1">
                      {fmt(results.monthlyPAYE)}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[0.65rem] font-bold text-white/40 tracking-[0.2em] uppercase">
                      Effective Rate
                    </span>
                    <p className="text-2xl font-headline font-bold text-brand-green">
                      {(results.effectiveTaxRate * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Summary + Bracket */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-white/40">
                      Calculation Summary
                    </h4>
                    <div className="space-y-3">
                      {[
                        [
                          "Annual Taxable Income",
                          fmt(results.taxableIncome),
                          "",
                        ],
                        [
                          "Personal Relief (PRA)",
                          `-${fmt(results.personalReliefAllowance)}`,
                          "text-green-500",
                        ],
                        ...(hasPension
                          ? [
                              [
                                "Pension Relief",
                                `-${fmt(results.pensionRelief)}`,
                                "text-green-500",
                              ],
                            ]
                          : []),
                      ].map(([label, value, cls]) => (
                        <div
                          key={label}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-white/60">{label}</span>
                          <span className={cls}>{value}</span>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-white/5 flex justify-between font-bold">
                        <span className="uppercase text-[0.65rem] tracking-widest">
                          Annual Total Tax
                        </span>
                        <span className="text-brand-green">
                          {fmt(results.annualPAYE)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 border border-white/10">
                    <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-brand-green mb-4">
                      Tax Bracket
                    </h4>
                    <p className="text-4xl font-headline font-bold">
                      {results.bracket}
                    </p>
                    <p className="text-[0.65rem] text-white/50 mt-2 leading-relaxed">
                      Marginal rate applied to the top portion of your taxable
                      income under the 2024 Finance Act.
                    </p>
                  </div>
                </div>

                {/* Explanation */}
                <div className="space-y-4">
                  <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-white/40">
                    Breakdown Explanation
                  </h4>
                  <div className="p-6 border border-white/5 text-[0.75rem] leading-relaxed text-white/70 bg-brand-dark/50">
                    {results.explanation}
                  </div>
                </div>

                <Button
                  onClick={reset}
                  variant="outline"
                  className="w-full h-12 rounded-none border-white/20 hover:bg-white hover:text-black uppercase text-[0.7rem] font-bold tracking-widest"
                >
                  New Calculation
                </Button>

                <p className="text-[0.6rem] text-white/30 italic text-center">
                  This is an estimate only. Consult a certified tax professional
                  for personalised advice. Figures based on the 2024 Finance Act
                  (FIRS).
                </p>
              </div>
            )}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
};
