"use client"

import * as React from "react"
import { Label, Pie, PieChart, Cell } from "recharts"
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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { PopularProduct } from "@/lib/types"

type PopularProductsChartProps = {
  data: PopularProduct[];
}

export default function PopularProductsChart({ data }: PopularProductsChartProps) {
  const totalSales = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.sales, 0)
  }, [data])

  const chartConfig = React.useMemo(() => {
    const config: any = {
      sales: {
        label: "Vendas",
      },
    };
    data.forEach(item => {
      config[item.category] = { label: item.category, color: item.fill };
    });
    return config;
  }, [data]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Vendas por Categoria</CardTitle>
        <CardDescription>Unidades vendidas este mês</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="sales"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
            >
               {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalSales.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Vendas
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
             <ChartLegend
                content={<ChartLegendContent nameKey="category" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
