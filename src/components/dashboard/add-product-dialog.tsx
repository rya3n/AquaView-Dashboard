"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Product } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome do produto deve ter pelo menos 2 caracteres.",
  }),
  category: z.string({
    required_error: "Por favor, selecione uma categoria.",
  }),
  stock: z.coerce.number().int().min(0, {
    message: "O estoque não pode ser negativo.",
  }),
  cost: z.coerce.number().min(0, {
    message: "O custo não pode ser negativo.",
  }),
  price: z.coerce.number().min(0, {
    message: "O preço não pode ser negativo.",
  }),
});

type AddProductDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddProduct: (product: Omit<Product, 'id' | 'imageUrl' | 'imageHint'>) => void;
};

export default function AddProductDialog({ isOpen, onOpenChange, onAddProduct }: AddProductDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      stock: 0,
      cost: 0,
      price: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddProduct(values);
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Produto</DialogTitle>
          <DialogDescription>
            Preencha as informações abaixo para adicionar um novo item ao inventário.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Aquário 20L" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Peixes">Peixes</SelectItem>
                      <SelectItem value="Plantas">Plantas</SelectItem>
                      <SelectItem value="Aquários">Aquários</SelectItem>
                      <SelectItem value="Alimentação">Alimentação</SelectItem>
                      <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                      <SelectItem value="Decoração">Decoração</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar Produto</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
