
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { SalesTrend } from "@/lib/types"

type SalesTrendsChartProps = {
  data: SalesTrend[];
}

const chartConfig = {
  revenue: {
    label: "Receita",
    color: "hsl(var(--chart-1))",
  },
}

export default function SalesTrendsChart({ data }: SalesTrendsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendências de Vendas</CardTitle>
        <CardDescription>Receita dos últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              interval={0}
            />
            <YAxis
              tickFormatter={(value) => `R$${value / 1000}k`}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                formatter={(value) => `R$${(value as number).toLocaleString('pt-BR')}`}
              />}
            />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} name="Revenue" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
