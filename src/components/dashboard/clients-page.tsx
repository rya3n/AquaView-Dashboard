
"use client";

import * as React from 'react';
import { collection, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import DashboardLayout from './dashboard-layout';
import ClientsList from './clients-list';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import AddClientDialog from './add-client-dialog';
import type { Client, Product, Sale, SaleWithProducts } from '@/lib/types';
import ClientDetailsDialog from './client-details-dialog';
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

export default function ClientsPage() {
    const firestore = useFirestore();
    const clientsCollection = useMemoFirebase(() => collection(firestore, 'clients'), [firestore]);
    const { data: clientsData, isLoading: isLoadingClients } = useCollection<Omit<Client, 'avatarUrl' | 'avatarFallback' | 'totalSpent'>>(clientsCollection);

    const salesCollection = useMemoFirebase(() => collection(firestore, 'sales'), [firestore]);
    const { data: salesData, isLoading: isLoadingSales } = useCollection<Sale>(salesCollection);

    const productsCollection = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
    const { data: productsData, isLoading: isLoadingProducts } = useCollection<Product>(productsCollection);

    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);
    const [clientToDelete, setClientToDelete] = React.useState<string | null>(null);
    const [searchTerm, setSearchTerm] = React.useState("");


    const clients: Client[] = React.useMemo(() => {
        if (!clientsData || !salesData) return [];
        
        const allClients = clientsData.map(client => {
            const nameParts = client.name.split(' ');
            const fallback = (nameParts[0]?.[0] ?? '' + (nameParts[1]?.[0] ?? '')).toUpperCase();
            const clientSales = salesData.filter(sale => sale.clientId === client.id);
            const totalSpent = clientSales.reduce((acc, sale) => acc + sale.totalAmount, 0);

            return {
                ...client,
                avatarUrl: `https://picsum.photos/seed/${client.id}/40/40`,
                avatarFallback: fallback,
                totalSpent: totalSpent,
            };
        });

        if (!searchTerm) {
            return allClients;
        }

        return allClients.filter(client => 
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

    }, [clientsData, salesData, searchTerm]);

    const selectedClientSalesHistory: SaleWithProducts[] = React.useMemo(() => {
        if (!selectedClient || !salesData || !productsData) return [];
        return salesData
            .filter(sale => sale.clientId === selectedClient.id)
            .map(sale => ({
                ...sale,
                products: sale.products.map(soldProduct => ({
                    ...soldProduct,
                    productDetails: productsData.find(p => p.id === soldProduct.productId) || { name: 'Produto não encontrado', imageUrl: '', id: '', stock: 0, cost: 0, price: 0, imageHint: '', category: 'Outros' }
                }))
            }))
            .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
    }, [selectedClient, salesData, productsData]);

    const isLoading = isLoadingClients || isLoadingSales || isLoadingProducts;

    const handleAddClient = (newClient: Omit<Client, 'id' | 'since' | 'avatarUrl' | 'avatarFallback' | 'totalSpent'>) => {
      addDocumentNonBlocking(clientsCollection, {
        ...newClient,
        since: new Date().toISOString(),
      });
      setIsAddDialogOpen(false);
    };

    const handleClientClick = (client: Client) => {
        setSelectedClient(client);
        setIsDetailsDialogOpen(true);
    }
    
    const openDeleteDialog = (clientId: string) => {
        setClientToDelete(clientId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteClient = () => {
        if (clientToDelete) {
            const clientRef = doc(firestore, 'clients', clientToDelete);
            deleteDocumentNonBlocking(clientRef);
            if (selectedClient?.id === clientToDelete) {
                setIsDetailsDialogOpen(false);
                setSelectedClient(null);
            }
        }
        setIsDeleteDialogOpen(false);
        setClientToDelete(null);
    };

    return (
        <DashboardLayout headerTitle="Clientes">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Procurar por nome ou email..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Cliente
                </Button>
            </div>
            <div className="grid grid-cols-1 gap-6">
                <ClientsList 
                    clients={clients} 
                    isLoading={isLoading}
                    onClientClick={handleClientClick}
                    onDeleteClient={openDeleteDialog}
                />
            </div>
            <AddClientDialog 
                isOpen={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onAddClient={handleAddClient}
            />
            <ClientDetailsDialog
                client={selectedClient}
                salesHistory={selectedClientSalesHistory}
                isOpen={isDetailsDialogOpen}
                onOpenChange={setIsDetailsDialogOpen}
                onDeleteClient={openDeleteDialog}
            />
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso irá apagar permanentemente o cliente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setClientToDelete(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteClient}>Apagar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}
