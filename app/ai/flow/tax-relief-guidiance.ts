"use server";
/**
 * @fileOverview A Genkit flow that analyzes a user's tax situation and provides personalized tax relief recommendations.
 *
 * - taxReliefGuidance - A function that handles the tax relief guidance process.
 * - TaxReliefGuidanceInput - The input type for the taxReliefGuidance function.
 * - TaxReliefGuidanceOutput - The return type for the taxReliefGuidance function.
 */

import { ai } from "@/app/ai/genkit";
import { z } from "genkit";

const TaxReliefGuidanceInputSchema = z.object({
  annualIncome: z
    .number()
    .describe("The user's annual taxable income in Naira."),
  monthlyPAYE: z
    .number()
    .describe(
      "The user's estimated monthly Pay As You Earn (PAYE) tax in Naira.",
    ),
  effectiveTaxRate: z
    .number()
    .describe("The user's calculated effective tax rate as a percentage."),
  taxBracket: z
    .string()
    .describe('The identified tax bracket for the user (e.g., "above ₦3.2M").'),
  financeActDetails: z
    .string()
    .describe(
      "Key relevant details from the 2024 Finance Act regarding tax rules and allowances.",
    ),
});
export type TaxReliefGuidanceInput = z.infer<
  typeof TaxReliefGuidanceInputSchema
>;

const TaxReliefRecommendationSchema = z.object({
  allowanceType: z
    .string()
    .describe(
      'The type of tax relief allowance (e.g., "NHF", "Pension", "Life Assurance").',
    ),
  description: z
    .string()
    .describe("A brief explanation of the allowance and its purpose."),
  eligibilityCriteria: z
    .string()
    .describe(
      "The criteria a user must meet to be eligible for this allowance.",
    ),
  potentialSavings: z
    .string()
    .describe(
      "An estimate of the potential tax savings or impact on tax liability.",
    ),
  actionSteps: z
    .string()
    .describe(
      "Concrete steps the user can take to benefit from this allowance.",
    ),
});

const TaxReliefGuidanceOutputSchema = z.object({
  recommendations: z
    .array(TaxReliefRecommendationSchema)
    .describe("A list of personalized tax relief recommendations."),
  disclaimer: z
    .string()
    .describe(
      "A general disclaimer stating that the recommendations are advisory and not a substitute for professional tax consultation.",
    ),
});
export type TaxReliefGuidanceOutput = z.infer<
  typeof TaxReliefGuidanceOutputSchema
>;

export async function taxReliefGuidance(
  input: TaxReliefGuidanceInput,
): Promise<TaxReliefGuidanceOutput> {
  return taxReliefGuidanceFlow(input);
}

const taxReliefGuidancePrompt = ai.definePrompt({
  name: "taxReliefGuidancePrompt",
  input: { schema: TaxReliefGuidanceInputSchema },
  output: { schema: TaxReliefGuidanceOutputSchema },
  prompt: `You are an expert Nigerian tax advisor specializing in personal income tax, guided by the 2024 Finance Act and Personal Income Tax Act (PITA) rules.\nThe user has provided their tax computation details and is seeking personalized, actionable recommendations for tax relief allowances.\nFocus your recommendations on National Housing Fund (NHF), Pension contributions, and Life Assurance policies, as these are common tax reliefs for Nigerian taxpayers.\n\nHere are the user's tax computation details:\n- Annual Taxable Income: ₦{{{annualIncome}}}\n- Estimated Monthly PAYE: ₦{{{monthlyPAYE}}}\n- Effective Tax Rate: {{{effectiveTaxRate}}}%\n- Identified Tax Bracket: {{{taxBracket}}}\n\nKey details from the 2024 Finance Act for your consideration:\n{{{financeActDetails}}}\n\nBased on this information, provide comprehensive and actionable recommendations for tax relief allowances.\nFor each recommendation, include:\n1. The type of allowance (e.g., "NHF", "Pension", "Life Assurance").\n2. A brief description of the allowance and its purpose.\n3. The eligibility criteria for claiming this allowance, referencing relevant sections of the Finance Act or PITA where applicable.\n4. The potential tax savings or impact on their tax liability, providing specific percentages or examples if possible.\n5. Concrete action steps the user can take to benefit from this allowance.\n\nEnsure the output is strictly in the JSON format defined by the output schema, with all fields populated accurately based on the tax laws and user input.\nConclude with a disclaimer that clearly states these recommendations are advisory and not a substitute for professional tax consultation.`,
});

const taxReliefGuidanceFlow = ai.defineFlow(
  {
    name: "taxReliefGuidanceFlow",
    inputSchema: TaxReliefGuidanceInputSchema,
    outputSchema: TaxReliefGuidanceOutputSchema,
  },
  async (input: TaxReliefGuidanceInput) => {
    const { output } = await taxReliefGuidancePrompt(input);
    if (!output) {
      throw new Error("Failed to get tax relief guidance from AI.");
    }
    return output;
  },
);
