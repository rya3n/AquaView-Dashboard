"use server";

import { salesInsightsHighlight, type SalesInsightsHighlightInput } from "@/ai/flows/sales-insights-highlight";

export async function getSalesInsights(input: SalesInsightsHighlightInput): Promise<{ highlightedInsights: string } | { error: string }> {
  try {
    const result = await salesInsightsHighlight(input);
    return result;
  } catch (e) {
    console.error(e);
    return { error: "Falha ao gerar insights de vendas." };
  }
}
