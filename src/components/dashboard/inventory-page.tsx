
"use client";

import * as React from 'react';
import { collection, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import DashboardLayout from './dashboard-layout';
import InventoryStatus from './inventory-status';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import AddProductDialog from './add-product-dialog';
import type { Product } from '@/lib/types';
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
import EditProductSheet from './edit-product-sheet';

export default function InventoryPage() {
    const firestore = useFirestore();
    const productsCollection = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
    const { data: inventoryData, isLoading } = useCollection<Product>(productsCollection);

    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [isEditSheetOpen, setIsEditSheetOpen] = React.useState(false);
    const [productToDelete, setProductToDelete] = React.useState<string | null>(null);
    const [productToEdit, setProductToEdit] = React.useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = React.useState("");

    const inventory = React.useMemo(() => {
        if (!inventoryData) return [];
        
        const allItems = inventoryData.map(item => ({
            ...item,
            status: item.stock > 10 ? 'Em Estoque' : item.stock > 0 ? 'Estoque Baixo' : 'Fora de Estoque',
        }));

        if (!searchTerm) {
            return allItems;
        }

        return allItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

    }, [inventoryData, searchTerm]);

    const handleAddProduct = (newProduct: Omit<Product, 'id' | 'imageUrl' | 'imageHint'>) => {
      addDocumentNonBlocking(productsCollection, {
        ...newProduct,
        imageUrl: `https://picsum.photos/seed/${Math.random()}/64/64`,
        imageHint: 'novo produto',
      });
      setIsAddDialogOpen(false);
    };

    const confirmDeleteProduct = () => {
        if (productToDelete) {
            const productRef = doc(firestore, 'products', productToDelete);
            deleteDocumentNonBlocking(productRef);
        }
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
    };
    
    const openDeleteDialog = (productId: string) => {
        setProductToDelete(productId);
        setIsDeleteDialogOpen(true);
    };

    const handleUpdateProduct = (productId: string, updatedValues: Partial<Omit<Product, 'id' | 'imageUrl' | 'imageHint'>>) => {
        const productRef = doc(firestore, 'products', productId);
        updateDocumentNonBlocking(productRef, updatedValues);
        setIsEditSheetOpen(false);
        setProductToEdit(null);
    };

    const openEditSheet = (product: Product) => {
        setProductToEdit(product);
        setIsEditSheetOpen(true);
    };

    return (
        <DashboardLayout headerTitle="Inventário">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                 <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Procurar por nome do produto..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Produto
                </Button>
            </div>
            <div className="grid grid-cols-1 gap-6">
                <InventoryStatus 
                    inventory={inventory} 
                    onDeleteProduct={openDeleteDialog} 
                    onEditProduct={openEditSheet}
                    isLoading={isLoading}
                />
            </div>
            <AddProductDialog 
                isOpen={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onAddProduct={handleAddProduct}
            />
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso irá apagar permanentemente o produto do seu inventário.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteProduct}>Apagar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <EditProductSheet
                product={productToEdit}
                isOpen={isEditSheetOpen}
                onOpenChange={setIsEditSheetOpen}
                onUpdateProduct={handleUpdateProduct}
            />
        </DashboardLayout>
    );
}
