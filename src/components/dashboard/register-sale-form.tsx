
"use client";

import * as React from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';
import type { Client, Product, InventoryItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2, Plus, Minus, Search } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';

export default function RegisterSaleForm() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const clientsCollection = useMemoFirebase(() => collection(firestore, 'clients'), [firestore]);
    const { data: clientsData, isLoading: isLoadingClients } = useCollection<Client>(clientsCollection);

    const productsCollection = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
    const { data: productsData, isLoading: isLoadingProducts } = useCollection<Product>(productsCollection);
    
    const salesCollection = useMemoFirebase(() => collection(firestore, 'sales'), [firestore]);

    const [selectedClientId, setSelectedClientId] = React.useState<string | undefined>(undefined);
    const [soldProducts, setSoldProducts] = React.useState<(Product & { quantity: number })[]>([]);
    const [searchTerm, setSearchTerm] = React.useState("");
    
    const clients = React.useMemo(() => {
        if (!clientsData) return [];
        return clientsData.map(client => {
            const nameParts = client.name.split(' ');
            const fallback = (nameParts[0]?.[0] ?? '' + (nameParts[1]?.[0] ?? '')).toUpperCase();
            return {
                ...client,
                avatarUrl: `https://picsum.photos/seed/${client.id}/40/40`,
                avatarFallback: fallback,
                totalSpent: 0, 
            };
        });
    }, [clientsData]);

    const inventory: InventoryItem[] = React.useMemo(() => {
        if (!productsData) return [];
        const allItems = productsData.map(item => ({
            ...item,
            status: item.stock > 10 ? 'Em Estoque' : item.stock > 0 ? 'Estoque Baixo' : 'Fora de Estoque',
        }));

        if (!searchTerm) {
            return allItems;
        }

        return allItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [productsData, searchTerm]);

    const handleAddProduct = (product: Product) => {
        setSoldProducts(prev => {
            const existingProduct = prev.find(p => p.id === product.id);
            if (existingProduct) {
                 if (existingProduct.quantity < product.stock) {
                    return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
                 } else {
                    toast({
                        variant: 'destructive',
                        title: 'Estoque insuficiente',
                        description: `A quantidade de "${product.name}" não pode exceder o estoque disponível.`,
                    });
                    return prev;
                 }
            }
            if (product.stock < 1) {
                toast({
                    variant: 'destructive',
                    title: 'Fora de estoque',
                    description: `O produto "${product.name}" não está disponível.`,
                });
                return prev;
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };
    
    const handleRemoveProduct = (productId: string) => {
        setSoldProducts(prev => prev.filter(p => p.id !== productId));
    }

    const handleQuantityChange = (productId: string, change: number) => {
        setSoldProducts(prev => prev.map(p => {
            if (p.id === productId) {
                const newQuantity = p.quantity + change;
                if (newQuantity < 1) {
                    return p; // Prevent quantity from going below 1 here. Removal is handled by trash icon.
                }
                const productInStock = productsData.find(item => item.id === productId);
                if (productInStock && newQuantity > productInStock.stock) {
                    toast({
                        variant: 'destructive',
                        title: 'Estoque insuficiente',
                        description: `A quantidade de "${p.name}" não pode exceder o estoque disponível.`,
                    });
                    return p; // Do not update if exceeding stock
                }
                return { ...p, quantity: newQuantity };
            }
            return p;
        }).filter(p => p.quantity > 0)); // Filter out items if quantity becomes 0 or less
    };

    const totalAmount = React.useMemo(() => {
        return soldProducts.reduce((total, product) => total + product.price * product.quantity, 0);
    }, [soldProducts]);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    const handleRegisterSale = async () => {
        if (!selectedClientId || soldProducts.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Dados incompletos',
                description: 'Por favor, selecione um cliente e adicione produtos para registrar a venda.',
            });
            return;
        }

        const saleData = {
            clientId: selectedClientId,
            products: soldProducts.map(p => ({
                productId: p.id,
                quantity: p.quantity,
                unitPrice: p.price,
            })),
            totalAmount: totalAmount,
            saleDate: new Date().toISOString(),
        };

        
        // 1. Register the sale
        addDocumentNonBlocking(salesCollection, saleData);

        // 2. Update stock for each product
        for (const soldProduct of soldProducts) {
            const productRef = doc(firestore, 'products', soldProduct.id);
            const newStock = soldProduct.stock - soldProduct.quantity;
            updateDocumentNonBlocking(productRef, { stock: newStock });
        }

        // 3. Show success toast
        toast({
            title: 'Venda registrada com sucesso!',
            description: `A venda no valor de ${formatCurrency(totalAmount)} foi registrada.`,
        });

        // 4. Reset form state
        setSelectedClientId(undefined);
        setSoldProducts([]);
        setSearchTerm("");
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle>Registrar Nova Venda</CardTitle>
                <CardDescription>Selecione o cliente e os produtos para registrar a venda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium mb-2">Cliente</h3>
                    <Select onValueChange={setSelectedClientId} value={selectedClientId}>
                        <SelectTrigger className="w-full md:w-1/2">
                            <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoadingClients ? <SelectItem value="loading" disabled>Carregando...</SelectItem> :
                             clients.map(client => (
                                <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-medium">Produtos na Venda</h3>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px] hidden sm:table-cell"></TableHead>
                                    <TableHead>Produto</TableHead>
                                    <TableHead className="w-[150px] text-center">Qtd.</TableHead>
                                    <TableHead className="w-[120px] text-right">Preço Unit.</TableHead>
                                    <TableHead className="w-[120px] text-right">Subtotal</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {soldProducts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                                            Nenhum produto adicionado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    soldProducts.map(product => (
                                        <TableRow key={product.id}>
                                            <TableCell className="hidden sm:table-cell">
                                                <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded-md" />
                                            </TableCell>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(product.id, -1)}>
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-8 text-center">{product.quantity}</span>
                                                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(product.id, 1)}>
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                                            <TableCell className="text-right font-semibold">{formatCurrency(product.price * product.quantity)}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => handleRemoveProduct(product.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h3 className="text-lg font-medium">Adicionar Produtos do Inventário</h3>
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Procurar produtos..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {isLoadingProducts ? (
                            Array.from({length: 6}).map((_, i) => (
                                <Card key={i} className="p-2 flex flex-col items-center justify-center text-center">
                                    <Skeleton className="w-16 h-16 rounded-md mb-2"/>
                                    <Skeleton className="h-4 w-20 mb-1"/>
                                    <Skeleton className="h-4 w-12"/>
                                </Card>
                            ))
                        ) : inventory.map(item => (
                            <Card 
                                key={item.id} 
                                className={cn("p-2 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent transition-colors", {
                                    "opacity-50 cursor-not-allowed": item.stock === 0
                                })}
                                onClick={() => handleAddProduct(item)}
                            >
                                <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md mb-2" data-ai-hint={item.imageHint} />
                                <p className="text-sm font-medium leading-tight">{item.name}</p>
                                <p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p>
                            </Card>
                        ))}
                    </div>
                </div>

            </CardContent>
            <CardFooter className="flex justify-between items-center bg-muted/50 p-4 rounded-b-lg">
                <div className="text-2xl font-bold">
                    <span>Total: </span>
                    <span>{formatCurrency(totalAmount)}</span>
                </div>
                <Button size="lg" onClick={handleRegisterSale} disabled={!selectedClientId || soldProducts.length === 0}>
                    Registrar Venda
                </Button>
            </CardFooter>
        </Card>
    )
}
