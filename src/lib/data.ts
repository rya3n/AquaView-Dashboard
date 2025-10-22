
import type { Appointment, SalesMetrics } from './types';

// Mock data is no longer used, but file is kept for AI input data function
const appointments: Appointment[] = [];


export const getAppointments = (): Appointment[] => appointments;

export const getAIInputData = (salesMetrics: SalesMetrics) => {
  const currentSales = `
    Receita Total: ${salesMetrics.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}, 
    Custo Total: ${salesMetrics.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}, 
    Lucro Bruto: ${salesMetrics.grossProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })},
    Margem de Lucro: ${salesMetrics.profitMargin.toFixed(1)}%.
  `;
  const historicalSales = `A receita do mês passado foi ${salesMetrics.previousMonthRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}. Dados históricos de meses anteriores podem ser usados para comparação de crescimento.`;
  const salesForecast = "A previsão de vendas pode ser usada para avaliar o desempenho atual.";
  
  return {
    currentSalesData: currentSales,
    historicalSalesData: historicalSales,
    salesForecast,
  }
}
