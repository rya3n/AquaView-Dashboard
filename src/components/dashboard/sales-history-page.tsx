
"use client";

import * as React from 'react';
import { collection, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import DashboardLayout from './dashboard-layout';
import type { Client, Product, Sale, SaleWithProducts } from '@/lib/types';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { MoreVertical, Search, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Skeleton } from '../ui/skeleton';
import { Input } from '../ui/input';

export default function SalesHistoryPage() {
    const firestore = useFirestore();

    const salesCollection = useMemoFirebase(() => collection(firestore, 'sales'), [firestore]);
    const { data: salesData, isLoading: isLoadingSales } = useCollection<Sale>(salesCollection);
    
    const clientsCollection = useMemoFirebase(() => collection(firestore, 'clients'), [firestore]);
    const { data: clientsData, isLoading: isLoadingClients } = useCollection<Client>(clientsCollection);
    
    const productsCollection = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
    const { data: productsData, isLoading: isLoadingProducts } = useCollection<Product>(productsCollection);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [saleToDelete, setSaleToDelete] = React.useState<string | null>(null);
    const [searchTerm, setSearchTerm] = React.useState("");

    const isLoading = isLoadingSales || isLoadingClients || isLoadingProducts;

    const salesHistory: SaleWithProducts[] = React.useMemo(() => {
        if (!salesData || !clientsData || !productsData) return [];
        
        const allSales = salesData
            .map(sale => {
                const client = clientsData.find(c => c.id === sale.clientId);
                const nameParts = client?.name.split(' ') || ['?'];
                const fallback = (nameParts[0]?.[0] ?? '' + (nameParts[1]?.[0] ?? '')).toUpperCase();

                return {
                    ...sale,
                    client: {
                        id: client?.id || '',
                        name: client?.name || 'Cliente não encontrado',
                        avatarUrl: `https://picsum.photos/seed/${sale.clientId}/40/40`,
                        avatarFallback: fallback
                    },
                    products: sale.products.map(soldProduct => ({
                        ...soldProduct,
                        productDetails: productsData.find(p => p.id === soldProduct.productId) || { name: 'Produto não encontrado', imageUrl: '', id: '', stock: 0, cost: 0, price: 0, imageHint: '', category: 'Outros' }
                    }))
                }
            })
            .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());

        if (!searchTerm) {
            return allSales;
        }

        return allSales.filter(sale =>
            (sale as any).client.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

    }, [salesData, clientsData, productsData, searchTerm]);


    const openDeleteDialog = (saleId: string) => {
        setSaleToDelete(saleId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteSale = () => {
        if (saleToDelete) {
            const saleRef = doc(firestore, 'sales', saleToDelete);
            deleteDocumentNonBlocking(saleRef);
        }
        setIsDeleteDialogOpen(false);
        setSaleToDelete(null);
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    const formatDate = (dateString: string) => {
        try {
            return format(parseISO(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
        } catch {
            return "Data inválida";
        }
    }

    return (
        <DashboardLayout headerTitle="Histórico de Vendas">
             <div className="flex justify-end mb-4">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Procurar por cliente..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
               <Card>
                    <CardHeader>
                        <CardTitle>Todas as Vendas</CardTitle>
                        <CardDescription>Visualize e gerencie todas as vendas registradas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Data da Venda</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="w-[64px] text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <Skeleton className="h-10 w-10 rounded-full" />
                                                    <Skeleton className="h-4 w-32" />
                                                </div>
                                            </TableCell>
                                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : salesHistory.map((sale) => (
                                    <TableRow key={sale.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <Avatar>
                                                    <AvatarImage src={(sale as any).client.avatarUrl} alt={(sale as any).client.name} />
                                                    <AvatarFallback>{(sale as any).client.avatarFallback}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{(sale as any).client.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{formatDate(sale.saleDate)}</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(sale.totalAmount)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                        <span className="sr-only">Ações</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openDeleteDialog(sale.id)} className="text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Apagar Venda
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {salesHistory.length === 0 && !isLoading && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            Nenhuma venda encontrada.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
               </Card>
            </div>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso irá apagar permanentemente o registro desta venda. O estoque dos produtos não será revertido.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSaleToDelete(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteSale}>Apagar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}
