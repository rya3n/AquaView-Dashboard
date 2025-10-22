
"use client";

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Client, SaleWithProducts } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Calendar, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '../ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import Image from 'next/image';

type ClientDetailsDialogProps = {
  client: Client | null;
  salesHistory: SaleWithProducts[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onDeleteClient: (clientId: string) => void;
};

export default function ClientDetailsDialog({ client, salesHistory, isOpen, onOpenChange, onDeleteClient }: ClientDetailsDialogProps) {
  
  const formatSinceDate = (dateString: string) => {
    try {
        const date = parseISO(dateString);
        return format(date, "dd 'de' MMMM, yyyy", { locale: ptBR });
    } catch (error) {
        return "Data inválida";
    }
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  const handleDelete = () => {
    if (client) {
      onDeleteClient(client.id);
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader className="text-center">
          <DialogTitle>Detalhes do Cliente</DialogTitle>
          <DialogDescription>
            Informações detalhadas sobre o cliente e seu histórico de compras.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(100vh-16rem)] pr-4">
        {client && (
             <div className="py-4 space-y-6">
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={client.avatarUrl} alt={client.name} />
                        <AvatarFallback>{client.avatarFallback}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="text-2xl font-semibold">{client.name}</h3>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                        <p className="text-sm text-muted-foreground">{client.phone}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">{formatCurrency(client.totalSpent)}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Compras</CardTitle>
                            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{salesHistory.length}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cliente Desde</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold">{formatSinceDate(client.since)}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Histórico de Compras</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {salesHistory.length > 0 ? (
                            <Accordion type="single" collapsible className="w-full">
                                {salesHistory.map(sale => (
                                    <AccordionItem value={sale.id} key={sale.id}>
                                        <AccordionTrigger>
                                            <div className="flex justify-between w-full pr-4">
                                                <span>{format(parseISO(sale.saleDate), "dd/MM/yyyy 'às' HH:mm")}</span>
                                                <span className="font-semibold">{formatCurrency(sale.totalAmount)}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <ul className="space-y-2 pt-2">
                                                {sale.products.map(p => (
                                                    <li key={p.productId} className="flex items-center gap-4">
                                                        <Image src={p.productDetails.imageUrl} alt={p.productDetails.name} width={40} height={40} className="rounded-md" />
                                                        <div className="flex-1">
                                                            <p className="font-medium">{p.productDetails.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {p.quantity} x {formatCurrency(p.unitPrice)}
                                                            </p>
                                                        </div>
                                                        <p className="font-semibold">{formatCurrency(p.quantity * p.unitPrice)}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                             <p className="text-muted-foreground text-center py-8">Nenhuma compra registrada.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        )}
        </ScrollArea>
        <DialogFooter className="pt-4 sm:justify-between">
            <Button variant="destructive" onClick={handleDelete} disabled={!client}>
                <Trash2 className="mr-2 h-4 w-4" />
                Apagar Cliente
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
