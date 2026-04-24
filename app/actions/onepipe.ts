"use server";

/**
 * OnePipe v2 Server Actions
 * ─────────────────────────────────────────────────────────────────
 * All secrets stay server-side. BVN/OTP are encrypted with
 * Triple DES before leaving this module. Every request is
 * HMAC-MD5 signed per OnePipe spec.
 *
 * Required env vars:
 *   ONEPIPE_APP_ID        – your OnePipe app ID
 *   ONEPIPE_APP_SECRET    – your OnePipe app secret (also the 3DES key)
 *   ONEPIPE_AUTH_PROVIDER – the bank/provider slug from your dashboard
 *                           e.g. "Polaris" | "SunTrust" | "Demoprovider"
 */

import crypto from "crypto";

// ── Constants ──────────────────────────────────────────────────────────────

const BASE_URL = "https://api.onepipe.io/v2";
const APP_ID = process.env.ONEPIPE_APP_ID!;
const APP_SECRET = process.env.ONEPIPE_APP_SECRET!;
const AUTH_PROVIDER = process.env.ONEPIPE_AUTH_PROVIDER ?? "Demoprovider";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Unique request reference — 12 digit timestamp + 4 random digits */
function makeRef(): string {
  return `${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
}

/**
 * Triple-DES (EDE) encryption — OnePipe spec.
 * Key must be 24 bytes. If APP_SECRET is shorter it is padded/truncated.
 */
function tripleDesEncrypt(plainText: string): string {
  const keyBuffer = Buffer.alloc(24);
  const secretBuf = Buffer.from(APP_SECRET, "utf8");
  secretBuf.copy(keyBuffer, 0, 0, Math.min(secretBuf.length, 24));

  const iv = Buffer.alloc(8, 0); // zero IV — OnePipe default
  const cipher = crypto.createCipheriv("des-ede3-cbc", keyBuffer, iv);
  cipher.setAutoPadding(true);

  return Buffer.concat([
    cipher.update(Buffer.from(plainText, "utf8")),
    cipher.final(),
  ]).toString("base64");
}

/**
 * HMAC-MD5 signature of the JSON request body.
 * Header name: Signature
 */
function sign(body: object): string {
  return crypto
    .createHmac("md5", APP_SECRET)
    .update(JSON.stringify(body))
    .digest("hex");
}

/** POST to OnePipe /transact or /transact/validate */
async function onepipePost(
  path: "/transact" | "/transact/validate",
  body: object,
): Promise<OnePipeResponse> {
  const signature = sign(body);

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${APP_ID}_${APP_SECRET}`,
      Signature: signature,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OnePipe HTTP ${res.status}: ${text}`);
  }

  return res.json() as Promise<OnePipeResponse>;
}

// ── Types ──────────────────────────────────────────────────────────────────

export type OnePipeStatus =
  | "Successful"
  | "Failed"
  | "WaitingForOTP"
  | "PendingValidation";

export interface OnePipeResponse {
  status: OnePipeStatus;
  message: string;
  data: {
    provider_response_code: string;
    provider: string;
    errors: unknown;
    error: unknown;
    provider_response: Record<string, unknown> | null;
  };
}

export interface OnePipeAccount {
  account_number: string;
  account_name: string;
  bank_name?: string;
  account_type?: string;
}

export interface OnePipeTransaction {
  transaction_reference: string;
  transaction_amount: number; // kobo
  balance: number;
  transaction_type: "C" | "D"; // Credit | Debit
  transaction_date: string;
  description: string;
}

export interface StatementResult {
  account_number: string;
  opening_balance: number;
  closing_balance: number;
  statement_list: OnePipeTransaction[];
}

// ── Action 1: Verify BVN (sends OTP to BVN-linked phone) ──────────────────

export async function verifyBvn(payload: {
  bvn: string;
  firstname: string;
  surname: string;
  dob: string; // yyyy-MM-dd
  email: string;
  mobile_no: string; // 2348012345678
}): Promise<{
  requestRef: string;
  transactionRef: string;
  response: OnePipeResponse;
}> {
  const requestRef = makeRef();
  const transactionRef = makeRef();

  const body = {
    request_ref: requestRef,
    request_type: "lookup_bvn_min",
    auth: {
      type: "bvn",
      secure: tripleDesEncrypt(payload.bvn),
      auth_provider: AUTH_PROVIDER,
      route_mode: null,
    },
    transaction: {
      mock_mode: "live",
      transaction_ref: transactionRef,
      transaction_desc: "BVN verification for tax calculator",
      transaction_ref_parent: null,
      amount: 0,
      customer: {
        customer_ref: `TC_${payload.mobile_no}`,
        firstname: payload.firstname,
        surname: payload.surname,
        email: payload.email,
        mobile_no: payload.mobile_no,
      },
      meta: { source: "tax_calculator" },
      details: {
        dob: payload.dob,
      },
    },
  };

  const response = await onepipePost("/transact", body);
  return { requestRef, transactionRef, response };
}

// ── Action 2: Submit OTP (for BVN verify or statement fetch) ──────────────

export async function submitOtp(payload: {
  requestRef: string;
  transactionRef: string;
  otp: string;
}): Promise<OnePipeResponse> {
  const body = {
    request_ref: payload.requestRef,
    request_type: "lookup_bvn_min", // same type as original request
    auth: {
      secure: tripleDesEncrypt(payload.otp),
      auth_provider: AUTH_PROVIDER,
    },
    transaction: {
      transaction_ref: payload.transactionRef,
    },
  };

  return onepipePost("/transact/validate", body);
}

// ── Action 3: Get accounts linked to BVN ─────────────────────────────────

export async function getAccounts(payload: {
  bvn: string;
  firstname: string;
  surname: string;
  email: string;
  mobile_no: string;
}): Promise<{
  requestRef: string;
  transactionRef: string;
  response: OnePipeResponse;
}> {
  const requestRef = makeRef();
  const transactionRef = makeRef();

  const body = {
    request_ref: requestRef,
    request_type: "get_accounts_min",
    auth: {
      type: "bvn",
      secure: tripleDesEncrypt(payload.bvn),
      auth_provider: AUTH_PROVIDER,
      route_mode: null,
    },
    transaction: {
      mock_mode: "live",
      transaction_ref: transactionRef,
      transaction_desc: "Get accounts for tax calculator",
      transaction_ref_parent: null,
      amount: 0,
      customer: {
        customer_ref: `TC_${payload.mobile_no}`,
        firstname: payload.firstname,
        surname: payload.surname,
        email: payload.email,
        mobile_no: payload.mobile_no,
      },
      meta: { source: "tax_calculator" },
      details: {},
    },
  };

  const response = await onepipePost("/transact", body);
  return { requestRef, transactionRef, response };
}

// ── Action 4: Submit OTP for get_accounts ─────────────────────────────────

export async function submitAccountsOtp(payload: {
  requestRef: string;
  transactionRef: string;
  otp: string;
}): Promise<OnePipeResponse> {
  const body = {
    request_ref: payload.requestRef,
    request_type: "get_accounts_min",
    auth: {
      secure: tripleDesEncrypt(payload.otp),
      auth_provider: AUTH_PROVIDER,
    },
    transaction: {
      transaction_ref: payload.transactionRef,
    },
  };

  return onepipePost("/transact/validate", body);
}

// ── Action 5: Fetch bank statement for a selected account ─────────────────

export async function getStatement(payload: {
  accountNumber: string;
  firstname: string;
  surname: string;
  email: string;
  mobile_no: string;
  startDate: string; // yyyy-MM-dd  (12 months back)
  endDate: string; // yyyy-MM-dd  (today)
}): Promise<{
  requestRef: string;
  transactionRef: string;
  response: OnePipeResponse;
}> {
  const requestRef = makeRef();
  const transactionRef = makeRef();

  const body = {
    request_ref: requestRef,
    request_type: "get_statement",
    auth: {
      type: "bank.account",
      secure: tripleDesEncrypt(payload.accountNumber),
      auth_provider: AUTH_PROVIDER,
      route_mode: null,
    },
    transaction: {
      mock_mode: "live",
      transaction_ref: transactionRef,
      transaction_desc: "Statement fetch for tax calculator",
      transaction_ref_parent: null,
      amount: 0,
      customer: {
        customer_ref: payload.accountNumber,
        firstname: payload.firstname,
        surname: payload.surname,
        email: payload.email,
        mobile_no: payload.mobile_no,
      },
      meta: { source: "tax_calculator" },
      details: {
        start_date: payload.startDate,
        end_date: payload.endDate,
      },
    },
  };

  const response = await onepipePost("/transact", body);
  return { requestRef, transactionRef, response };
}

// ── Action 6: Submit OTP for statement fetch ─────────────────────────────

export async function submitStatementOtp(payload: {
  requestRef: string;
  transactionRef: string;
  otp: string;
}): Promise<OnePipeResponse> {
  const body = {
    request_ref: payload.requestRef,
    request_type: "get_statement",
    auth: {
      secure: tripleDesEncrypt(payload.otp),
      auth_provider: AUTH_PROVIDER,
    },
    transaction: {
      transaction_ref: payload.transactionRef,
    },
  };

  return onepipePost("/transact/validate", body);
}
