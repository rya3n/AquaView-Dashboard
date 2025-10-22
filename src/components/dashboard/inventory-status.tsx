"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { InventoryItem, Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type InventoryStatusProps = {
  inventory: InventoryItem[];
  onDeleteProduct?: (productId: string) => void;
  onEditProduct?: (product: Product) => void;
  isLoading?: boolean;
}

export default function InventoryStatus({ inventory, onDeleteProduct, onEditProduct, isLoading }: InventoryStatusProps) {
  const getStatusVariant = (status: InventoryItem['status']): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
      case 'Em Estoque':
        return 'default';
      case 'Estoque Baixo':
        return 'secondary';
      case 'Fora de Estoque':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status do Inventário</CardTitle>
        <CardDescription>Acompanhe o status dos produtos em tempo real.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Imagem</span>
              </TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Categoria</TableHead>
              <TableHead className="text-right">Estoque</TableHead>
              <TableHead className="hidden md:table-cell text-right">Custo</TableHead>
              <TableHead className="hidden md:table-cell text-right">Preço</TableHead>
              <TableHead className="text-right">Lucro Potencial</TableHead>
              {onDeleteProduct && <TableHead className="w-[100px] text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-16 w-16 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24" />
                  </TableCell>
                  <TableCell  className="hidden md:table-cell">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-8 ml-auto" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right">
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right">
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </TableCell>
                   {onDeleteProduct && (
                    <TableCell className="text-right">
                        <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : inventory.map((item) => (
              <TableRow key={item.id} onClick={() => onEditProduct?.(item)} className={cn({'cursor-pointer': !!onEditProduct})}>
                <TableCell className="hidden sm:table-cell">
                  <Image
                    alt={item.name}
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={item.imageUrl}
                    width="64"
                    data-ai-hint={item.imageHint}
                  />
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                </TableCell>
                 <TableCell className="hidden md:table-cell text-muted-foreground">{item.category}</TableCell>
                <TableCell className={cn("text-right", {
                    "text-destructive font-bold": item.status === 'Fora de Estoque',
                    "text-amber-600 font-semibold": item.status === 'Estoque Baixo'
                })}>
                  {item.stock}
                </TableCell>
                <TableCell className="hidden md:table-cell text-right">{formatCurrency(item.cost)}</TableCell>
                <TableCell className="hidden md:table-cell text-right">{formatCurrency(item.price)}</TableCell>
                <TableCell className="text-right font-semibold text-green-600">
                    {formatCurrency((item.price - item.cost) * item.stock)}
                </TableCell>
                {onDeleteProduct && (
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDeleteProduct(item.id); }}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Apagar</span>
                        </Button>
                    </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
