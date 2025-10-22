
"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Users, ShoppingCart, Sparkles, AlertCircle, TrendingUp, Landmark } from 'lucide-react';
import { getAIInputData } from '@/lib/data';
import { getSalesInsights } from '@/app/actions';
import type { SalesMetrics } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type SalesOverviewProps = {
  salesMetrics: SalesMetrics;
  isLoading: boolean;
}

export default function SalesOverview({ salesMetrics, isLoading }: SalesOverviewProps) {
  const [insights, setInsights] = React.useState<string | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchInsights = async () => {
      setIsLoadingInsights(true);
      setError(null);
      const aiInput = getAIInputData(salesMetrics);
      if (aiInput.currentSalesData === "Receita Total: R$0.00.") {
        setInsights("Ainda não há dados de vendas suficientes para gerar insights.");
        setIsLoadingInsights(false);
        return;
      }
      const result = await getSalesInsights(aiInput);
      if ('error' in result) {
        setError(result.error);
      } else {
        setInsights(result.highlightedInsights);
      }
      setIsLoadingInsights(false);
    };

    if(!isLoading) {
      fetchInsights();
    }
  }, [salesMetrics, isLoading]);

  const MetricCard = ({ title, value, icon: Icon, isLoading, description }: { title: string, value: string | number, icon: React.ElementType, isLoading: boolean, description?: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-3/4" />
            {description && <Skeleton className="h-4 w-1/2 mt-1" />}
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Visão Geral de Vendas</CardTitle>
        <CardDescription>Métricas de vendas e insights de negócios em tempo real para o mês atual.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <MetricCard 
                title="Lucro Bruto" 
                value={salesMetrics.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                icon={DollarSign}
                isLoading={isLoading}
            />
            <MetricCard 
                title="Custo dos Produtos" 
                value={salesMetrics.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                icon={Landmark}
                isLoading={isLoading}
            />
             <MetricCard 
                title="Receita do Mês" 
                value={salesMetrics.grossProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                icon={TrendingUp}
                isLoading={isLoading}
            />
             <MetricCard 
                title="Margem de Lucro" 
                value={`${salesMetrics.profitMargin.toFixed(1)}%`} 
                icon={TrendingUp}
                isLoading={isLoading}
            />
            <MetricCard 
                title="Total de Vendas" 
                value={salesMetrics.totalSales} 
                icon={ShoppingCart}
                isLoading={isLoading}
            />
        </div>

        <div className="mt-6">
          <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="h-5 w-5 text-primary" />
            Insights de Vendas (IA)
          </h3>
          {isLoading || isLoadingInsights ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
            </Alert>
          ) : (
            <p className="text-sm text-muted-foreground">{insights}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
