"use server";
/**
 * @fileOverview A GenAI flow for calculating a user's estimated tax bracket, effective rate, and monthly PAYE breakdown in Nigeria.
 *
 * - taxBracketComputation - A function that handles the tax bracket computation process.
 * - TaxBracketComputationInput - The input type for the taxBracketComputation function.
 * - TaxBracketComputationOutput - The return type for the taxBracketComputation function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const TaxBracketComputationInputSchema = z.object({
  annualIncome: z
    .number()
    .describe("The user's total annual income in Nigerian Naira."),
  hasNHF: z
    .boolean()
    .default(false)
    .describe(
      "Whether the user contributes to the National Housing Fund (NHF).",
    ),
  hasPension: z
    .boolean()
    .default(false)
    .describe("Whether the user contributes to a pension scheme."),
});
export type TaxBracketComputationInput = z.infer<
  typeof TaxBracketComputationInputSchema
>;

const TaxBracketComputationOutputSchema = z.object({
  annualIncome: z
    .number()
    .describe("The user's total annual income in Nigerian Naira."),
  taxableIncome: z
    .number()
    .describe(
      "The calculated annual taxable income after all applicable reliefs and deductions.",
    ),
  personalReliefAllowance: z
    .number()
    .describe(
      "The calculated Personal Relief Allowance (₦200,000 + 20% of earned income).",
    ),
  nhfDeduction: z
    .number()
    .describe(
      "The calculated National Housing Fund (NHF) deduction (2.5% of annual income if applicable).",
    ),
  pensionRelief: z
    .number()
    .describe(
      "The calculated Pension Relief (8% of annual income if applicable).",
    ),
  totalDeductionsAndReliefs: z
    .number()
    .describe("The sum of all applicable deductions and reliefs."),
  estimatedTaxBracket: z
    .string()
    .describe(
      "A descriptive string of the annual taxable income range the user falls into, based on FIRS PAYE bands.",
    ),
  effectiveTaxRate: z
    .number()
    .describe("The effective tax rate as a decimal (e.g., 0.07 for 7%)."),
  annualPAYE: z
    .number()
    .describe("The calculated annual Pay As You Earn (PAYE) tax."),
  monthlyPAYEBreakdown: z
    .number()
    .describe("The calculated monthly Pay As You Earn (PAYE) tax."),
  explanation: z
    .string()
    .describe(
      "A detailed step-by-step explanation of the tax calculation, referencing the 2024 Finance Act and PITA rules, including how each deduction, relief, and tax band was applied to arrive at the final figures.",
    ),
});
export type TaxBracketComputationOutput = z.infer<
  typeof TaxBracketComputationOutputSchema
>;

export async function taxBracketComputation(
  input: TaxBracketComputationInput,
): Promise<TaxBracketComputationOutput> {
  return taxBracketComputationFlow(input);
}

const prompt = ai.definePrompt({
  name: "taxBracketComputationPrompt",
  input: { schema: TaxBracketComputationInputSchema },
  output: { schema: TaxBracketComputationOutputSchema },
  prompt: `You are an expert Nigerian tax consultant specializing in the 2024 Finance Act and Personal Income Tax Act (PITA) rules.\nYour task is to accurately calculate a user's estimated tax bracket, effective tax rate, and monthly PAYE breakdown based on their annual income and specific contributions.\n\nHere are the key rules and steps you MUST follow for the calculation:\n\n1.  **Input Data:**\n    *   Annual Income: {{{annualIncome}}} NGN\n    *   Contributes to NHF: {{{hasNHF}}}\n    *   Contributes to Pension: {{{hasPension}}}\n\n2.  **Calculate Deductions and Reliefs:**\n    *   **Personal Relief Allowance (PRA):** This is ₦200,000 + 20% of the Annual Income.\n    *   **National Housing Fund (NHF) Deduction:** If the user contributes to NHF (hasNHF is true), deduct 2.5% of the Annual Income. Otherwise, this deduction is 0.\n    *   **Pension Relief:** If the user contributes to a pension scheme (hasPension is true), deduct 8% of the Annual Income. Otherwise, this relief is 0.\n\n3.  **Calculate Total Deductions and Taxable Income:**\n    *   \`totalDeductionsAndReliefs\` = PRA + NHF Deduction + Pension Relief.\n    *   \`taxableIncome\` = Annual Income - \`totalDeductionsAndReliefs\`. Ensure \`taxableIncome\` is not negative; if deductions exceed income, \`taxableIncome\` is 0.\n\n4.  **Calculate Annual PAYE Tax using 2024-2025 FIRS PAYE Bands:**\n    *   The tax is calculated progressively based on the \`taxableIncome\`.\n    *   First ₦300,000 of taxable income: 7%\n    *   Next ₦300,000 of taxable income: 11%\n    *   Next ₦500,000 of taxable income: 15%\n    *   Next ₦500,000 of taxable income: 19%\n    *   Next ₦1,600,000 of taxable income: 21%\n    *   Any amount above ₦3,200,000 of taxable income: 24% (This is the top marginal rate for income above ₦3.2M, as per the 2024 Finance Act.)\n\n5.  **Determine Estimated Tax Bracket:**\n    *   Based on the final \`taxableIncome\` value, identify which FIRS PAYE band it falls into.\n\n6.  **Calculate Effective Tax Rate:**\n    *   \`effectiveTaxRate\` = \`annualPAYE\` / Annual Income.\n\n7.  **Calculate Monthly PAYE Breakdown:**\n    *   \`monthlyPAYEBreakdown\` = \`annualPAYE\` / 12.\n\n8.  **Output Requirements:**\n    *   Provide all calculated values as per the output schema.\n    *   Ensure the \`explanation\` field provides a detailed, step-by-step breakdown of how each value was derived, explicitly mentioning the application of the 2024 Finance Act and PITA rules, and showing the calculation for each tax band.\n    *   All monetary values should be rounded to two decimal places.\n\nPerform the calculation meticulously and provide the results in the specified JSON format.\n`,
});

const taxBracketComputationFlow = ai.defineFlow(
  {
    name: "taxBracketComputationFlow",
    inputSchema: TaxBracketComputationInputSchema,
    outputSchema: TaxBracketComputationOutputSchema,
  },
  async (input: TaxBracketComputationInput) => {
    const { output } = await prompt(input);
    return output!;
  },
);
