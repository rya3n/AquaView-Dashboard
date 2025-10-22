
"use client";

import SalesOverview from '@/components/dashboard/sales-overview';
import InventoryStatus from '@/components/dashboard/inventory-status';
import SalesTrendsChart from '@/components/dashboard/sales-trends-chart';
import PopularProductsChart from '@/components/dashboard/popular-products-chart';
import DashboardLayout from '@/components/dashboard/dashboard-layout';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Product, Sale, Client, SalesMetrics, SalesTrend, PopularProduct } from '@/lib/types';
import { useMemo } from 'react';
import { format, subMonths, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DashboardPage() {
  const firestore = useFirestore();

  const productsCollection = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
  const { data: inventoryData, isLoading: isLoadingProducts } = useCollection<Product>(productsCollection);

  const salesCollection = useMemoFirebase(() => collection(firestore, 'sales'), [firestore]);
  const { data: salesData, isLoading: isLoadingSales } = useCollection<Sale>(salesCollection);

  const clientsCollection = useMemoFirebase(() => collection(firestore, 'clients'), [firestore]);
  const { data: clientsData, isLoading: isLoadingClients } = useCollection<Client>(clientsCollection);

  const salesMetrics: SalesMetrics = useMemo(() => {
    const defaultMetrics = { totalRevenue: 0, previousMonthRevenue: 0, activeClients: 0, totalSales: 0, totalCost: 0, grossProfit: 0, profitMargin: 0 };
    if (!salesData || !clientsData || !inventoryData) {
      return defaultMetrics;
    }
    
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const previousMonthDate = subMonths(now, 1);
    const previousMonthStart = startOfMonth(previousMonthDate);
    const previousMonthEnd = endOfMonth(previousMonthDate);

    const currentMonthSales = salesData.filter(sale => {
      const saleDate = parseISO(sale.saleDate);
      return saleDate >= currentMonthStart;
    });
    
    if (currentMonthSales.length === 0) {
      return defaultMetrics;
    }

    const grossProfit = currentMonthSales.reduce((acc, sale) => acc + sale.totalAmount, 0);

    const totalCost = currentMonthSales.reduce((acc, sale) => {
      const saleCost = sale.products.reduce((productAcc, soldProduct) => {
        const productInfo = inventoryData.find(p => p.id === soldProduct.productId);
        const cost = productInfo ? productInfo.cost : 0;
        return productAcc + (cost * soldProduct.quantity);
      }, 0);
      return acc + saleCost;
    }, 0);

    const totalRevenue = grossProfit + totalCost;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const previousMonthRevenue = salesData
      .filter(sale => {
        const saleDate = parseISO(sale.saleDate);
        return isWithinInterval(saleDate, { start: previousMonthStart, end: previousMonthEnd });
      })
      .reduce((acc, sale) => acc + sale.totalAmount, 0);

    const activeClients = new Set(currentMonthSales.map(sale => sale.clientId)).size;

    return {
      totalRevenue,
      previousMonthRevenue,
      activeClients,
      totalSales: currentMonthSales.length,
      totalCost,
      grossProfit,
      profitMargin,
    }

  }, [salesData, clientsData, inventoryData]);

  const salesTrends: SalesTrend[] = useMemo(() => {
    if (!salesData) return [];
  
    const monthlySales: { [key: string]: number } = {};
    const now = new Date();
  
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthKey = format(date, 'yyyy-MM');
      monthlySales[monthKey] = 0;
    }
  
    salesData.forEach(sale => {
      const saleDate = parseISO(sale.saleDate);
      const monthKey = format(saleDate, 'yyyy-MM');
      if (monthlySales.hasOwnProperty(monthKey)) {
        monthlySales[monthKey] += sale.totalAmount;
      }
    });
  
    return Object.keys(monthlySales)
      .sort()
      .map(monthKey => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          month: format(date, 'MMM/yy', { locale: ptBR }),
          revenue: monthlySales[monthKey],
          name: monthKey, // Use the unique 'yyyy-MM' as the key
        };
      });
  }, [salesData]);


  const popularProducts: PopularProduct[] = useMemo(() => {
    if (!salesData || !inventoryData || salesData.length === 0) return [];
  
    const categorySales: { [category: string]: { sales: number } } = {};
  
    salesData.forEach(sale => {
      sale.products.forEach(soldProduct => {
        const productInfo = inventoryData.find(p => p.id === soldProduct.productId);
        if (productInfo && productInfo.category) {
          if (!categorySales[productInfo.category]) {
            categorySales[productInfo.category] = { sales: 0 };
          }
          categorySales[productInfo.category].sales += soldProduct.quantity;
        }
      });
    });
  
    const categoryColors: { [key: string]: string } = {
        'Peixes': 'hsl(var(--chart-1))',
        'Plantas': 'hsl(var(--chart-2))',
        'Aquários': 'hsl(var(--chart-3))',
        'Alimentação': 'hsl(var(--chart-4))',
        'Equipamentos': 'hsl(var(--chart-5))',
        'Decoração': 'hsl(var(--chart-1))', // re-using colors for more categories
        'Outros': 'hsl(var(--chart-2))'
    };

    return Object.entries(categorySales)
      .map(([category, data]) => ({ 
        category: category, 
        sales: data.sales, 
        fill: categoryColors[category] || 'hsl(var(--chart-3))'
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  
  }, [salesData, inventoryData]);


  const inventory = useMemo(() => {
    if (!inventoryData) return [];
    return inventoryData.map(item => ({
        ...item,
        status: item.stock > 10 ? 'Em Estoque' : item.stock > 0 ? 'Estoque Baixo' : 'Fora de Estoque',
    }));
  }, [inventoryData]);

  const isLoading = isLoadingProducts || isLoadingSales || isLoadingClients;

  return (
    <DashboardLayout headerTitle="Painel">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="col-span-12">
              <SalesOverview salesMetrics={salesMetrics} isLoading={isLoading} />
            </div>
            <div className="lg:col-span-7">
                <SalesTrendsChart data={salesTrends} />
            </div>
            <div className="lg:col-span-5">
                <PopularProductsChart data={popularProducts} />
            </div>
            <div className="col-span-12">
                <InventoryStatus inventory={inventory} isLoading={isLoading} />
            </div>
        </div>
    </DashboardLayout>
  );
}
