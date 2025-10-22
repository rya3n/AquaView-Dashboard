
"use client";

import * as React from 'react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import DashboardLayout from './dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Product, Sale } from '@/lib/types';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '../ui/skeleton';
import { Download } from 'lucide-react';

type MonthlyReport = {
  month: string;
  monthDate: Date;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
};

export default function BillingPage() {
    const firestore = useFirestore();

    const salesCollection = useMemoFirebase(() => collection(firestore, 'sales'), [firestore]);
    const { data: salesData, isLoading: isLoadingSales } = useCollection<Sale>(salesCollection);

    const productsCollection = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
    const { data: productsData, isLoading: isLoadingProducts } = useCollection<Product>(productsCollection);

    const isLoading = isLoadingSales || isLoadingProducts;

    const monthlyReports: MonthlyReport[] = React.useMemo(() => {
        if (!salesData || !productsData) return [];

        const reportsByMonth: { [key: string]: Omit<MonthlyReport, 'profitMargin' | 'grossProfit'> & { grossProfit: number, totalCost: number, totalRevenue: number } } = {};

        salesData.forEach(sale => {
            const saleDate = parseISO(sale.saleDate);
            const monthKey = format(saleDate, 'yyyy-MM');

            if (!reportsByMonth[monthKey]) {
                reportsByMonth[monthKey] = {
                    month: format(saleDate, "MMMM, yyyy", { locale: ptBR }),
                    monthDate: startOfMonth(saleDate),
                    totalRevenue: 0,
                    totalCost: 0,
                    grossProfit: 0,
                };
            }

            const report = reportsByMonth[monthKey];
            report.grossProfit += sale.totalAmount;

            const saleCost = sale.products.reduce((acc, soldProduct) => {
                const productInfo = productsData.find(p => p.id === soldProduct.productId);
                return acc + (productInfo ? productInfo.cost * soldProduct.quantity : 0);
            }, 0);

            report.totalCost += saleCost;
        });

        return Object.values(reportsByMonth).map(report => {
            const totalRevenue = report.grossProfit + report.totalCost;
            return {
                ...report,
                totalRevenue,
                profitMargin: totalRevenue > 0 ? (report.grossProfit / totalRevenue) * 100 : 0,
            }
        }).sort((a, b) => b.monthDate.getTime() - a.monthDate.getTime());

    }, [salesData, productsData]);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    const handleDownload = (report: MonthlyReport) => {
        const headers = ["Metrica", "Valor"];
        const rows = [
            ["Mês do Relatório", report.month],
            ["Receita do Mês", formatCurrency(report.totalRevenue)],
            ["Custo dos Produtos", formatCurrency(report.totalCost)],
            ["Lucro Bruto", formatCurrency(report.grossProfit)],
            ["Margem de Lucro", `${report.profitMargin.toFixed(2)}%`],
        ];

        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `relatorio_${report.month.replace(', ', '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <DashboardLayout headerTitle="Faturamento">
            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Relatórios Financeiros</CardTitle>
                        <CardDescription>Baixe o resumo financeiro de cada mês.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mês</TableHead>
                                    <TableHead className="text-right">Receita Total</TableHead>
                                    <TableHead className="text-right hidden sm:table-cell">Custo</TableHead>
                                    <TableHead className="text-right hidden md:table-cell">Lucro Bruto</TableHead>
                                    <TableHead className="text-right hidden md:table-cell">Margem</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                     Array.from({ length: 3 }).map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                            <TableCell className="text-right hidden sm:table-cell"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                            <TableCell className="text-right hidden md:table-cell"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                            <TableCell className="text-right hidden md:table-cell"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : monthlyReports.map((report) => (
                                    <TableRow key={report.month}>
                                        <TableCell className="font-medium capitalize">{report.month}</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(report.totalRevenue)}</TableCell>
                                        <TableCell className="text-right hidden sm:table-cell">{formatCurrency(report.totalCost)}</TableCell>
                                        <TableCell className="text-right text-green-600 font-bold hidden md:table-cell">{formatCurrency(report.grossProfit)}</TableCell>
                                        <TableCell className="text-right hidden md:table-cell">{report.profitMargin.toFixed(1)}%</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleDownload(report)}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!isLoading && monthlyReports.length === 0 && (
                                     <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            Nenhum dado de vendas para gerar relatórios.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
