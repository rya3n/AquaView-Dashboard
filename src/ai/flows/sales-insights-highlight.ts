'use server';

/**
 * @fileOverview A flow to highlight key sales insights and anomalies by comparing current sales data with historical data and forecasts.
 *
 * - salesInsightsHighlight - A function that handles the sales insights highlighting process.
 * - SalesInsightsHighlightInput - The input type for the salesInsightsHighlight function.
 * - SalesInsightsHighlightOutput - The return type for the salesInsightsHighlight function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SalesInsightsHighlightInputSchema = z.object({
  currentSalesData: z
    .string()
    .describe('The current sales data, including total revenue and sales by product category.'),
  historicalSalesData: z
    .string()
    .describe('Historical sales data for comparison.'),
  salesForecast: z.string().describe('The sales forecast data.'),
});
export type SalesInsightsHighlightInput = z.infer<typeof SalesInsightsHighlightInputSchema>;

const SalesInsightsHighlightOutputSchema = z.object({
  highlightedInsights: z
    .string()
    .describe('Key sales insights and anomalies identified by comparing current sales data with historical data and forecasts.'),
});
export type SalesInsightsHighlightOutput = z.infer<typeof SalesInsightsHighlightOutputSchema>;

export async function salesInsightsHighlight(input: SalesInsightsHighlightInput): Promise<SalesInsightsHighlightOutput> {
  return salesInsightsHighlightFlow(input);
}

const prompt = ai.definePrompt({
  name: 'salesInsightsHighlightPrompt',
  input: {schema: SalesInsightsHighlightInputSchema},
  output: {schema: SalesInsightsHighlightOutputSchema},
  prompt: `You are a business analyst specializing in sales data analysis.

You will analyze the current sales data, historical sales data, and sales forecasts to identify key insights and anomalies.

Based on your analysis, you will highlight the most important insights that the business owner should pay attention to. Mention concrete numbers whenever possible.

Current Sales Data: {{{currentSalesData}}}
Historical Sales Data: {{{historicalSalesData}}}
Sales Forecast: {{{salesForecast}}}`,
});

const salesInsightsHighlightFlow = ai.defineFlow(
  {
    name: 'salesInsightsHighlightFlow',
    inputSchema: SalesInsightsHighlightInputSchema,
    outputSchema: SalesInsightsHighlightOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
