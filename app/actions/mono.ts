"use server";

/**
 * Exchange the temporary code (from Mono Connect widget) for a permanent account ID.
 * Call this after your frontend completes the Mono Connect flow and passes back the code.
 */
export async function exchangeMonoToken(code: string) {
  const res = await fetch("https://api.withmono.com/v2/accounts/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "mono-sec-key": process.env.MONO_SECRET_KEY!,
    },
    body: JSON.stringify({ code }),
  });

  return res.json(); // returns { id: "<account_id>" } — save this to your DB
}

/**
 * Fetch transactions for a linked account using the permanent account ID.
 */
export async function fetchTransactions(account_id: string) {
  const res = await fetch(
    `https://api.withmono.com/v2/accounts/${account_id}/transactions`,
    {
      method: "GET",
      headers: {
        "mono-sec-key": process.env.MONO_SECRET_KEY!,
        accept: "application/json",
      },
    },
  );

  return res.json();
}
