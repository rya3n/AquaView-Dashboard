"use client";

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Client } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

type ClientsListProps = {
  clients: Client[];
  isLoading?: boolean;
  onClientClick?: (client: Client) => void;
  onDeleteClient?: (clientId: string) => void;
}

export default function ClientsList({ clients, isLoading, onClientClick, onDeleteClient }: ClientsListProps) {
  
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


  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Clientes</CardTitle>
        <CardDescription>Gerencie todos os seus clientes em um só lugar.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Telefone</TableHead>
              <TableHead className="text-right">Total Gasto</TableHead>
              <TableHead className="hidden md:table-cell text-right">Cliente Desde</TableHead>
              {onDeleteClient && <TableHead className="w-[64px] text-right">Ações</TableHead>}
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
                  <TableCell  className="hidden sm:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell  className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  <TableCell className="hidden md:table-cell text-right"><Skeleton className="h-4 w-28 ml-auto" /></TableCell>
                  {onDeleteClient && <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>}
                </TableRow>
              ))
            ) : clients.map((client) => (
              <TableRow key={client.id} onClick={() => onClientClick?.(client)} className={cn({'cursor-pointer': !!onClientClick})}>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarImage src={client.avatarUrl} alt={client.name} />
                        <AvatarFallback>{client.avatarFallback}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{client.name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{client.email}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{client.phone}</TableCell>
                <TableCell className="text-right font-semibold text-green-600">{formatCurrency(client.totalSpent)}</TableCell>
                <TableCell className="hidden md:table-cell text-right text-muted-foreground">{formatSinceDate(client.since)}</TableCell>
                {onDeleteClient && (
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDeleteClient(client.id); }}>
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
