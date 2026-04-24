"use client";

/**
 * CalculatorDialog — OnePipe edition
 * ────────────────────────────────────────────────────────────────────────────
 * Flow:
 *  Step 1 → Enter BVN + personal details → BVN verify → OTP sent
 *  Step 2 → Enter OTP → accounts fetched → account OTP if needed
 *  Step 3 → Select bank account → statement fetched → OTP if needed
 *  Step 4 → Tax computed & displayed
 * ────────────────────────────────────────────────────────────────────────────
 */

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
import { Loader2, Building2, CheckCircle2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import {
  verifyBvn,
  submitOtp,
  getAccounts,
  submitAccountsOtp,
  getStatement,
  submitStatementOtp,
  type OnePipeAccount,
  type OnePipeTransaction,
} from "@/app/actions/onepipe";

import { getLast12MonthsRange } from "@/lib/date-utils";
// ── Tax brackets (NTP 2024) ───────────────────────────────────────────────

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
    consolidatedRelief,
    annualPAYE: tax,
    monthlyPAYE: tax / 12,
    effectiveTaxRate: annualIncome > 0 ? tax / annualIncome : 0,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────

const formatNaira = (val: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    val,
  );

const cn = (...c: (string | boolean | undefined)[]) =>
  c.filter(Boolean).join(" ");

type DialogStep =
  | "details" // enter BVN + name + DOB + phone
  | "bvn_otp" // OTP for BVN verification
  | "accounts" // display accounts list / OTP for accounts
  | "accounts_otp" // OTP after get_accounts
  | "statement_otp" // OTP after get_statement
  | "results"; // tax result

// ── Component ─────────────────────────────────────────────────────────────

export const CalculatorDialog = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loading, setLoading] = useState(false);

  // Wizard step
  const [step, setStep] = useState<DialogStep>("details");

  // User details
  const [bvn, setBvn] = useState("");
  const [firstname, setFirstname] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [dob, setDob] = useState(""); // yyyy-MM-dd

  // OTP state — reused across multiple steps
  const [otp, setOtp] = useState("");
  const [pendingRef, setPendingRef] = useState<{
    requestRef: string;
    transactionRef: string;
    purpose: "bvn" | "accounts" | "statement";
  } | null>(null);

  // Accounts
  const [accounts, setAccounts] = useState<OnePipeAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<OnePipeAccount | null>(
    null,
  );

  // After statement
  const [transactions, setTransactions] = useState<OnePipeTransaction[]>([]);
  const [annualIncome, setAnnualIncome] = useState(0);
  const [hasNHF, setHasNHF] = useState(false);
  const [hasPension, setHasPension] = useState(false);
  const [results, setResults] = useState<ReturnType<typeof computeTax> | null>(
    null,
  );

  // OTP message from API
  const [otpMessage, setOtpMessage] = useState("");

  // ── Step 1: Verify BVN ─────────────────────────────────────────────────

  const handleVerifyBvn = async () => {
    if (bvn.length !== 11) return toast.error("BVN must be 11 digits");
    if (!firstname || !surname || !mobile || !dob)
      return toast.error("All fields are required");

    setLoading(true);
    try {
      const { requestRef, transactionRef, response } = await verifyBvn({
        bvn,
        firstname,
        surname,
        dob,
        email: email || "noreply@taxcalc.ng",
        mobile_no: mobile.startsWith("234")
          ? mobile
          : `234${mobile.replace(/^0/, "")}`,
      });

      if (response.status === "WaitingForOTP") {
        setOtpMessage(response.message);
        setPendingRef({ requestRef, transactionRef, purpose: "bvn" });
        setStep("bvn_otp");
        toast.success("OTP sent to your BVN-linked phone");
      } else if (response.status === "Successful") {
        // otp_override=true path — go straight to accounts
        await triggerGetAccounts();
      } else {
        toast.error("BVN verification failed", {
          description: response.message,
        });
      }
    } catch (err: any) {
      toast.error("Verification error", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Submit BVN OTP ────────────────────────────────────────────

  const handleBvnOtp = async () => {
    if (!otp || !pendingRef) return;
    setLoading(true);
    try {
      const response = await submitOtp({
        requestRef: pendingRef.requestRef,
        transactionRef: pendingRef.transactionRef,
        otp,
      });

      if (response.status === "Successful") {
        toast.success("BVN verified ✓");
        setOtp("");
        await triggerGetAccounts();
      } else {
        toast.error("Invalid OTP", { description: response.message });
      }
    } catch (err: any) {
      toast.error("OTP error", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── Internal: fetch accounts after BVN verify ─────────────────────────

  const triggerGetAccounts = async () => {
    const { requestRef, transactionRef, response } = await getAccounts({
      bvn,
      firstname,
      surname,
      email: email || "noreply@taxcalc.ng",
      mobile_no: mobile.startsWith("234")
        ? mobile
        : `234${mobile.replace(/^0/, "")}`,
    });

    if (response.status === "WaitingForOTP") {
      setOtpMessage(response.message);
      setPendingRef({ requestRef, transactionRef, purpose: "accounts" });
      setOtp("");
      setStep("accounts_otp");
    } else if (response.status === "Successful") {
      const raw = response.data.provider_response as any;
      const accs: OnePipeAccount[] = raw?.accounts ?? raw?.account_list ?? [];
      setAccounts(accs);
      setStep("accounts");
    } else {
      toast.error("Could not fetch accounts", {
        description: response.message,
      });
    }
  };

  // ── Step: Submit OTP for accounts ────────────────────────────────────

  const handleAccountsOtp = async () => {
    if (!otp || !pendingRef) return;
    setLoading(true);
    try {
      const response = await submitAccountsOtp({
        requestRef: pendingRef.requestRef,
        transactionRef: pendingRef.transactionRef,
        otp,
      });

      if (response.status === "Successful") {
        const raw = response.data.provider_response as any;
        const accs: OnePipeAccount[] = raw?.accounts ?? raw?.account_list ?? [];
        setAccounts(accs);
        setOtp("");
        setStep("accounts");
        toast.success("Accounts fetched ✓");
      } else {
        toast.error("Invalid OTP", { description: response.message });
      }
    } catch (err: any) {
      toast.error("OTP error", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Fetch statement for selected account ──────────────────────

  const handleFetchStatement = async (account: OnePipeAccount) => {
    setSelectedAccount(account);
    setLoading(true);
    const { startDate, endDate } = getLast12MonthsRange();

    try {
      const { requestRef, transactionRef, response } = await getStatement({
        accountNumber: account.account_number,
        firstname,
        surname,
        email: email || "noreply@taxcalc.ng",
        mobile_no: mobile.startsWith("234")
          ? mobile
          : `234${mobile.replace(/^0/, "")}`,
        startDate,
        endDate,
      });

      if (response.status === "WaitingForOTP") {
        setOtpMessage(response.message);
        setPendingRef({ requestRef, transactionRef, purpose: "statement" });
        setOtp("");
        setStep("statement_otp");
      } else if (response.status === "Successful") {
        processStatement(response.data.provider_response as any);
      } else {
        toast.error("Could not fetch statement", {
          description: response.message,
        });
      }
    } catch (err: any) {
      toast.error("Statement error", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── Step: Submit OTP for statement ───────────────────────────────────

  const handleStatementOtp = async () => {
    if (!otp || !pendingRef) return;
    setLoading(true);
    try {
      const response = await submitStatementOtp({
        requestRef: pendingRef.requestRef,
        transactionRef: pendingRef.transactionRef,
        otp,
      });

      if (response.status === "Successful") {
        processStatement(response.data.provider_response as any);
        setOtp("");
      } else {
        toast.error("Invalid OTP", { description: response.message });
      }
    } catch (err: any) {
      toast.error("OTP error", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  // ── Process statement → compute income ───────────────────────────────

  const processStatement = (raw: any) => {
    const txList: OnePipeTransaction[] = raw?.statement_list ?? [];
    setTransactions(txList);

    // Sum credits (kobo → naira)
    const totalCredits = txList
      .filter((t) => t.transaction_type === "C")
      .reduce((s, t) => s + t.transaction_amount / 100, 0);

    setAnnualIncome(totalCredits);
    toast.success("Statement fetched ✓ — income estimated from credits");
    setStep("results");
  };

  // ── Step 4: Compute & display tax ────────────────────────────────────

  const handleCompute = () => {
    if (annualIncome <= 0)
      return toast.error("No income detected from statement");
    setResults(computeTax(annualIncome, hasPension, hasNHF));
  };

  // ── Reset ─────────────────────────────────────────────────────────────

  const resetModal = () => {
    setStep("details");
    setBvn("");
    setFirstname("");
    setSurname("");
    setEmail("");
    setMobile("");
    setDob("");
    setOtp("");
    setPendingRef(null);
    setOtpMessage("");
    setAccounts([]);
    setSelectedAccount(null);
    setTransactions([]);
    setAnnualIncome(0);
    setHasNHF(false);
    setHasPension(false);
    setResults(null);
  };

  // ── Step indicator ────────────────────────────────────────────────────

  const STEPS = [
    { key: "details", label: "Verify BVN" },
    { key: "bvn_otp", label: "OTP" },
    { key: "accounts", label: "Select Bank" },
    { key: "results", label: "Tax Result" },
  ] as const;

  const stepIndex = {
    details: 0,
    bvn_otp: 1,
    accounts_otp: 1,
    accounts: 2,
    statement_otp: 2,
    results: 3,
  }[step];

  // ── OTP Panel — shared across bvn_otp / accounts_otp / statement_otp

  const OtpPanel = ({
    onSubmit,
    label,
  }: {
    onSubmit: () => void;
    label: string;
  }) => (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-white/50 mb-1">{otpMessage || label}</p>
        <p className="text-[11px] text-white/30 uppercase tracking-widest">
          Enter the OTP sent to your phone
        </p>
      </div>
      <div className="space-y-2">
        <Label>OTP</Label>
        <Input
          value={otp}
          maxLength={6}
          placeholder="••••••"
          className="tracking-[0.5em] text-center text-lg"
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
        />
      </div>
      <Button
        onClick={onSubmit}
        disabled={loading || otp.length < 4}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            Verifying...
          </>
        ) : (
          "Submit OTP"
        )}
      </Button>
    </div>
  );

  // ── UI ────────────────────────────────────────────────────────────────

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

        <div className="grid md:grid-cols-[280px_1fr] h-full">
          {/* ── Sidebar ────────────────────────────────────────────── */}
          <aside className="bg-brand-dark p-8 border-r border-white/5 flex flex-col gap-6">
            <Building2 className="w-6 h-6 text-brand-green" />

            <div className="mt-2 space-y-1">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/30 font-bold mb-4">
                Progress
              </p>
              {STEPS.map((s, i) => (
                <div
                  key={s.key}
                  className={cn(
                    "flex items-center gap-3 p-3 border border-white/5 text-sm transition-all duration-300",
                    i === stepIndex
                      ? "bg-white/5 text-white border-brand-green/30"
                      : i < stepIndex
                        ? "opacity-60 text-brand-green"
                        : "opacity-20 text-white/40",
                  )}
                >
                  {i < stepIndex ? (
                    <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
                  ) : (
                    <span
                      className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0",
                        i === stepIndex
                          ? "border-brand-green text-brand-green"
                          : "border-white/20",
                      )}
                    >
                      {i + 1}
                    </span>
                  )}
                  {s.label}
                </div>
              ))}
            </div>

            {/* Selected account pill */}
            {selectedAccount && (
              <div className="mt-auto p-3 border border-white/10 rounded text-xs space-y-1">
                <p className="text-white/30 uppercase tracking-widest text-[10px]">
                  Selected Account
                </p>
                <p className="font-bold text-brand-green">
                  {selectedAccount.account_number}
                </p>
                <p className="text-white/50">{selectedAccount.account_name}</p>
                {selectedAccount.bank_name && (
                  <p className="text-white/30">{selectedAccount.bank_name}</p>
                )}
              </div>
            )}
          </aside>

          {/* ── Main panel ─────────────────────────────────────────── */}
          <main className="p-10 overflow-y-auto h-full w-full bg-[#070707]">
            {/* ── Step: details ──────────────────────────────────── */}
            {step === "details" && (
              <div className="space-y-6 max-w-md">
                <div>
                  <h2 className="text-xl font-bold mb-1">
                    Verify your identity
                  </h2>
                  <p className="text-white/40 text-sm">
                    We use your BVN to securely pull your transaction history.
                    Nothing is stored.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input
                      value={firstname}
                      placeholder="Ade"
                      onChange={(e) => setFirstname(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Surname</Label>
                    <Input
                      value={surname}
                      placeholder="Okonkwo"
                      onChange={(e) => setSurname(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>BVN</Label>
                  <Input
                    value={bvn}
                    maxLength={11}
                    placeholder="22345678901"
                    onChange={(e) => setBvn(e.target.value.replace(/\D/g, ""))}
                  />
                  <p className="text-[11px] text-white/25">
                    Your BVN is encrypted — never stored on our servers.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone (BVN-linked)</Label>
                  <Input
                    value={mobile}
                    placeholder="08012345678"
                    onChange={(e) =>
                      setMobile(e.target.value.replace(/\D/g, ""))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email (optional)</Label>
                  <Input
                    type="email"
                    value={email}
                    placeholder="you@email.com"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleVerifyBvn}
                  disabled={loading || bvn.length !== 11}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Verifying BVN...
                    </>
                  ) : (
                    <>
                      Verify BVN <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* ── Step: bvn_otp ──────────────────────────────────── */}
            {step === "bvn_otp" && (
              <div className="max-w-md">
                <h2 className="text-xl font-bold mb-6">Enter OTP</h2>
                <OtpPanel
                  label="OTP sent to your BVN-linked number"
                  onSubmit={handleBvnOtp}
                />
              </div>
            )}

            {/* ── Step: accounts_otp ─────────────────────────────── */}
            {step === "accounts_otp" && (
              <div className="max-w-md">
                <h2 className="text-xl font-bold mb-6">
                  Confirm Account Access
                </h2>
                <OtpPanel
                  label="OTP to authorise account listing"
                  onSubmit={handleAccountsOtp}
                />
              </div>
            )}

            {/* ── Step: accounts ─────────────────────────────────── */}
            {step === "accounts" && (
              <div className="space-y-6 max-w-lg">
                <div>
                  <h2 className="text-xl font-bold mb-1">
                    Select Bank Account
                  </h2>
                  <p className="text-white/40 text-sm">
                    Choose the account whose transactions represent your income.
                  </p>
                </div>

                {accounts.length === 0 ? (
                  <p className="text-white/40 text-sm">
                    No accounts returned by your provider. Contact OnePipe
                    support or try a different provider.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {accounts.map((acc) => (
                      <button
                        key={acc.account_number}
                        disabled={loading}
                        onClick={() => handleFetchStatement(acc)}
                        className="w-full text-left p-4 border border-white/10 hover:border-brand-green/50 hover:bg-white/5 transition-all duration-200 flex items-center justify-between group"
                      >
                        <div>
                          <p className="font-bold text-white">
                            {acc.account_number}
                          </p>
                          <p className="text-sm text-white/50">
                            {acc.account_name}
                          </p>
                          {acc.bank_name && (
                            <p className="text-[11px] text-white/30 uppercase tracking-widest mt-0.5">
                              {acc.bank_name}
                            </p>
                          )}
                        </div>
                        {loading &&
                        selectedAccount?.account_number ===
                          acc.account_number ? (
                          <Loader2 className="animate-spin h-4 w-4 text-brand-green" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-brand-green transition-colors" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Step: statement_otp ────────────────────────────── */}
            {step === "statement_otp" && (
              <div className="max-w-md">
                <h2 className="text-xl font-bold mb-6">
                  Authorise Statement Access
                </h2>
                <OtpPanel
                  label="OTP to authorise fetching your bank statement"
                  onSubmit={handleStatementOtp}
                />
              </div>
            )}

            {/* ── Step: results ──────────────────────────────────── */}
            {step === "results" && (
              <div className="space-y-6 max-w-lg">
                {/* Income summary */}
                <div className="p-5 border border-white/10 space-y-2">
                  <p className="text-[11px] text-white/30 uppercase tracking-widest">
                    Detected from{" "}
                    {
                      transactions.filter((t) => t.transaction_type === "C")
                        .length
                    }{" "}
                    credits
                  </p>
                  <div className="flex items-end justify-between">
                    <p className="text-white/50 text-sm">
                      Estimated Annual Income
                    </p>
                    <p className="text-2xl font-bold text-brand-green">
                      {formatNaira(annualIncome)}
                    </p>
                  </div>
                  <p className="text-[11px] text-white/25">
                    You can adjust if this includes non-income credits.
                  </p>
                </div>

                {/* Reliefs */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={hasPension}
                      onCheckedChange={setHasPension}
                    />
                    <Label>Pension (8%)</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={hasNHF} onCheckedChange={setHasNHF} />
                    <Label>NHF (2.5%)</Label>
                  </div>
                </div>

                <Button onClick={handleCompute} className="w-full">
                  Compute PAYE Tax
                </Button>

                {/* Tax breakdown */}
                {results && (
                  <>
                    <div>
                      <p className="text-sm text-white/40 uppercase tracking-widest mb-1">
                        Monthly PAYE
                      </p>
                      <h2 className="text-4xl font-bold text-brand-green">
                        {formatNaira(results.monthlyPAYE)}
                      </h2>
                    </div>

                    <div className="space-y-3 border border-white/10 p-6">
                      {[
                        ["Annual Income", results.annualIncome],
                        ["Taxable Income", results.taxableIncome],
                        ["Consolidated Relief", results.consolidatedRelief],
                        ...(results.pensionRelief > 0
                          ? [
                              ["Pension Relief", results.pensionRelief] as [
                                string,
                                number,
                              ],
                            ]
                          : []),
                        ...(results.nhfRelief > 0
                          ? [
                              ["NHF Relief", results.nhfRelief] as [
                                string,
                                number,
                              ],
                            ]
                          : []),
                      ].map(([label, val]) => (
                        <div
                          key={label}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-white/50">{label}</span>
                          <span>{formatNaira(val as number)}</span>
                        </div>
                      ))}

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
                      Start Over
                    </Button>
                  </>
                )}
              </div>
            )}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
};
