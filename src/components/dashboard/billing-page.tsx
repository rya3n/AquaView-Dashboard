
"use client";

import * as React from 'react';
import { collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import DashboardLayout from './dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Product, Sale, Client } from '@/lib/types';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
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
  totalSales: number;
  totalProductsSold: number;
  averageTicket: number;
};

export default function BillingPage() {
    const firestore = useFirestore();

    const salesCollection = useMemoFirebase(() => collection(firestore, 'sales'), [firestore]);
    const { data: salesData, isLoading: isLoadingSales } = useCollection<Sale>(salesCollection);

    const productsCollection = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
    const { data: productsData, isLoading: isLoadingProducts } = useCollection<Product>(productsCollection);

    const clientsCollection = useMemoFirebase(() => collection(firestore, 'clients'), [firestore]);
    const { data: clientsData, isLoading: isLoadingClients } = useCollection<Client>(clientsCollection);

    const isLoading = isLoadingSales || isLoadingProducts || isLoadingClients;

    const monthlyReports: MonthlyReport[] = React.useMemo(() => {
        if (!salesData || !productsData) return [];

        const reportsByMonth: { 
            [key: string]: { 
                month: string;
                monthDate: Date;
                totalAmount: number;
                totalCost: number;
                salesCount: number;
                productsSoldCount: number;
            } 
        } = {};

        salesData.forEach(sale => {
            const saleDate = parseISO(sale.saleDate);
            const monthKey = format(saleDate, 'yyyy-MM');

            if (!reportsByMonth[monthKey]) {
                reportsByMonth[monthKey] = {
                    month: format(saleDate, "MMMM 'de' yyyy", { locale: ptBR }),
                    monthDate: startOfMonth(saleDate),
                    totalAmount: 0,
                    totalCost: 0,
                    salesCount: 0,
                    productsSoldCount: 0,
                };
            }

            const report = reportsByMonth[monthKey];
            report.totalAmount += sale.totalAmount;
            report.salesCount += 1;

            const { saleCost, productsSold } = sale.products.reduce((acc, soldProduct) => {
                const productInfo = productsData.find(p => p.id === soldProduct.productId);
                acc.saleCost += (productInfo ? productInfo.cost * soldProduct.quantity : 0);
                acc.productsSold += soldProduct.quantity;
                return acc;
            }, { saleCost: 0, productsSold: 0 });

            report.totalCost += saleCost;
            report.productsSoldCount += productsSold;
        });

        return Object.values(reportsByMonth).map(report => {
            const grossProfit = report.totalAmount - report.totalCost;
            const profitMargin = report.totalAmount > 0 ? (grossProfit / report.totalAmount) * 100 : 0;
            const averageTicket = report.salesCount > 0 ? report.totalAmount / report.salesCount : 0;
            return {
                ...report,
                totalRevenue: report.totalAmount,
                grossProfit: grossProfit,
                profitMargin: profitMargin,
                totalSales: report.salesCount,
                totalProductsSold: report.productsSoldCount,
                averageTicket: averageTicket,
            }
        }).sort((a, b) => b.monthDate.getTime() - a.monthDate.getTime());

    }, [salesData, productsData]);


    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    const handleDownload = (report: MonthlyReport) => {
        if (!salesData || !clientsData) return;
    
        const monthStart = report.monthDate;
        const monthEnd = endOfMonth(monthStart);
    
        const salesInMonth = salesData.filter(sale => isWithinInterval(parseISO(sale.saleDate), { start: monthStart, end: monthEnd }));
        
        const clientSales: { [clientId: string]: { name: string, totalSpent: number, lastPurchase: string } } = {};
    
        salesInMonth.forEach(sale => {
            const client = clientsData.find(c => c.id === sale.clientId);
            if (!client) return;
    
            if (!clientSales[sale.clientId]) {
                clientSales[sale.clientId] = {
                    name: client.name,
                    totalSpent: 0,
                    lastPurchase: ''
                };
            }
            clientSales[sale.clientId].totalSpent += sale.totalAmount;
            
            const saleDate = parseISO(sale.saleDate);
            const currentLastPurchase = clientSales[sale.clientId].lastPurchase ? parseISO(clientSales[sale.clientId].lastPurchase) : new Date(0);
            if (saleDate > currentLastPurchase) {
                 clientSales[sale.clientId].lastPurchase = sale.saleDate;
            }
        });
    
        const csvRows = [
            // Header
            ['Relatório Financeiro Detalhado - ' + report.month],
            [],
            ['Resumo Financeiro'],
            ['Métrica', 'Valor'],
            ['Lucro Bruto', formatCurrency(report.grossProfit)],
            ['Valor Líquido (Receita)', formatCurrency(report.totalRevenue)],
            ['Custo dos Produtos', formatCurrency(report.totalCost)],
            [],
            ['Resumo de Clientes no Mês'],
            ['Nome do Cliente', 'Total Gasto', 'Última Compra'],
        ];

        Object.values(clientSales).forEach(clientData => {
            csvRows.push([
                clientData.name,
                formatCurrency(clientData.totalSpent),
                format(parseISO(clientData.lastPurchase), "dd/MM/yyyy", { locale: ptBR })
            ]);
        });
    
        const csvContent = "data:text/csv;charset=utf-8," 
            + csvRows.map(e => e.join(",")).join("\n");
    
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `relatorio_${report.month.replace(/ /g, "_").replace("'", "")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <DashboardLayout headerTitle="Faturamento">
            <Card>
                <CardHeader>
                    <CardTitle>Relatórios Financeiros Mensais</CardTitle>
                    <CardDescription>Acompanhe o faturamento, custos e lucros de cada mês.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mês</TableHead>
                                <TableHead className="text-right">Receita</TableHead>
                                <TableHead className="text-right hidden sm:table-cell">Custos</TableHead>
                                <TableHead className="text-right hidden sm:table-cell">Lucro Bruto</TableHead>
                                <TableHead className="text-right hidden md:table-cell">Vendas</TableHead>
                                <TableHead className="text-right hidden md:table-cell">Produtos Vendidos</TableHead>
                                <TableHead className="text-right hidden lg:table-cell">Ticket Médio</TableHead>
                                <TableHead className="text-right">Margem</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({length: 3}).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                                        <TableCell className="text-right hidden sm:table-cell"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                                        <TableCell className="text-right hidden sm:table-cell"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                                        <TableCell className="text-right hidden md:table-cell"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                        <TableCell className="text-right hidden md:table-cell"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                        <TableCell className="text-right hidden lg:table-cell"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-10 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : monthlyReports.map((report) => (
                                <TableRow key={report.month}>
                                    <TableCell className="font-medium capitalize">{report.month}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(report.totalRevenue)}</TableCell>
                                    <TableCell className="text-right hidden sm:table-cell text-destructive">{formatCurrency(report.totalCost)}</TableCell>
                                    <TableCell className="text-right hidden sm:table-cell font-semibold text-green-600">{formatCurrency(report.grossProfit)}</TableCell>
                                    <TableCell className="text-right hidden md:table-cell">{report.totalSales}</TableCell>
                                    <TableCell className="text-right hidden md:table-cell">{report.totalProductsSold}</TableCell>
                                    <TableCell className="text-right hidden lg:table-cell">{formatCurrency(report.averageTicket)}</TableCell>
                                    <TableCell className="text-right font-semibold">{report.profitMargin.toFixed(1)}%</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => handleDownload(report)}>
                                            <Download className="h-4 w-4 md:mr-2" />
                                            <span className="hidden md:inline">Baixar</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
