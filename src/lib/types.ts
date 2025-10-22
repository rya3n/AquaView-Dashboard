

export type InventoryItem = {
  id: string;
  name: string;
  stock: number;
  cost: number;
  price: number;
  category: string;
  status: 'Em Estoque' | 'Estoque Baixo' | 'Fora de Estoque';
  imageUrl: string;
  imageHint: string;
};

export type Product = {
  id: string;
  name: string;
  stock: number;
  cost: number;
  price: number;
  category: string;
  imageUrl: string;
  imageHint: string;
}

export type Client = {
    id: string;
    name: string;
    email: string;
    phone: string;
    since: string;
    avatarUrl: string;
    avatarFallback: string;
    totalSpent: number;
}

export type Sale = {
    id: string;
    clientId: string;
    products: {
        productId: string;
        quantity: number;
        unitPrice: number;
    }[];
    totalAmount: number;
    saleDate: string;
}

export type SaleWithProducts = Omit<Sale, 'products'> & {
    products: {
        productId: string;
        quantity: number;
        unitPrice: number;
        productDetails: Product;
    }[];
}

export type Appointment = {
  id: string;
  customerName: string;
  service: string;
  technician: string;
  date: Date;
  status: 'Agendado' | 'Em Andamento' | 'Concluído' | 'Cancelado';
};

export type SalesTrend = {
  month: string;
  revenue: number;
  name: string; // Unique key for the month (e.g., '2023-05')
};

export type PopularProduct = {
  category: string;
  sales: number;
  fill: string;
};

export type SalesMetrics = {
  totalRevenue: number;
  previousMonthRevenue: number;
  activeClients: number;
  totalSales: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
}
