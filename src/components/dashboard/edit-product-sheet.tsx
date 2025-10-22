
"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const formSchema = z.object({
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

type EditProductSheetProps = {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpdateProduct: (productId: string, updatedValues: z.infer<typeof formSchema>) => void;
};

export default function EditProductSheet({ product, isOpen, onOpenChange, onUpdateProduct }: EditProductSheetProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  React.useEffect(() => {
    if (product) {
      form.reset({
        category: product.category,
        stock: product.stock,
        cost: product.cost,
        price: product.price,
      });
    }
  }, [product, form, isOpen]); // Added isOpen to deps to ensure reset happens when sheet re-opens

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (product) {
      onUpdateProduct(product.id, values);
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Editar Produto</SheetTitle>
          <SheetDescription>
            Atualize as informações do produto.
          </SheetDescription>
        </SheetHeader>
        {product && (
             <div className="py-4 flex-1 overflow-y-auto pr-4">
                <div className="flex items-center gap-4 mb-6">
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="rounded-md"
                        data-ai-hint={product.imageHint}
                    />
                    <div>
                        <h3 className="text-lg font-semibold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">ID: {product.id}</p>
                    </div>
                </div>
                <Form {...form}>
                <form id="edit-product-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Quantidade em Estoque</FormLabel>
                          <FormControl>
                              <Input type="number" min="0" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
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
                </form>
                </Form>
            </div>
        )}
         <SheetFooter className="pt-4 mt-auto">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
            </Button>
            <Button type="submit" form="edit-product-form">Salvar Alterações</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
