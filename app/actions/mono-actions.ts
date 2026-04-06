"use server";

/**
 * @fileOverview Server actions for interacting with the Mono API.
 */

export async function verifyBvnWithMono(bvn: string) {
  const MONO_SEC_KEY = process.env.MONO_SECRET_KEY;

  // For the sake of the prototype and testing, if the key is missing,
  // we simulate a successful lookup with realistic latency.
  if (!MONO_SEC_KEY) {
    console.warn(
      "MONO_SECRET_KEY is not set in .env. Falling back to simulated verification.",
    );
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate a successful Mono response for testing
    return {
      status: "success",
      data: {
        bvn,
        first_name: "Adeola",
        last_name: "Bakare",
        phone: "08012345678",
        dob: "1990-05-15",
        // Mocking estimated income based on standard professional profiles for this prototype
        estimated_annual_income: Math.floor(
          Math.random() * (22000000 - 4500000) + 4500000,
        ),
      },
    };
  }

  try {
    const response = await fetch("https://api.withmono.com/lookup/bvn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "mono-sec-key": MONO_SEC_KEY,
      },
      body: JSON.stringify({ bvn }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to verify BVN with Mono");
    }

    const result = await response.json();

    // In a real scenario, we might chain this with an income analysis API.
    // Here we append a randomized estimated income to the real identity data for the tax computation.
    return {
      ...result,
      data: {
        ...result.data,
        estimated_annual_income: Math.floor(
          Math.random() * (25000000 - 5000000) + 5000000,
        ),
      },
    };
  } catch (error: any) {
    console.error("Mono API Error:", error);
    throw new Error(
      error.message || "An error occurred during Mono verification.",
    );
  }
}
