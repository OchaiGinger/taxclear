"use server";

export async function generateOkraToken() {
  const res = await fetch("https://api.okra.ng/v2/sandbox/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OKRA_SECRET_KEY}`,
    },
    body: JSON.stringify({
      customer: {
        name: "Tax User",
      },
    }),
  });

  return res.json();
}

export async function fetchTransactions(account_id: string) {
  const res = await fetch("https://api.okra.ng/v2/transactions/get", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OKRA_SECRET_KEY}`,
    },
    body: JSON.stringify({ account_id }),
  });

  return res.json();
}
