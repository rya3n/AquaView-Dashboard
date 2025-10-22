"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser } from '@/firebase';
import { updateProfile, type User } from 'firebase/auth';

import DashboardLayout from './dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
});

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const { toast } = useToast();
    const [currentUser, setCurrentUser] = React.useState<User | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          name: "",
        },
    });
    
    React.useEffect(() => {
        if(user) {
            setCurrentUser(user);
            form.setValue('name', user.displayName || 'Ana Almeida');
        }
    }, [user, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!currentUser) return;
    
        try {
          await updateProfile(currentUser, {
            displayName: values.name,
          });
          // Manually update the user state to reflect the change immediately
          setCurrentUser(prevUser => prevUser ? ({...prevUser, displayName: values.name } as User) : null);
          toast({
            title: "Sucesso!",
            description: "Seu nome foi atualizado.",
          });
        } catch (error) {
          console.error("Erro ao atualizar perfil:", error);
          toast({
            variant: "destructive",
            title: "Uh oh! Algo deu errado.",
            description: "Não foi possível atualizar seu nome. Tente novamente.",
          });
        }
    }

    const getAvatarFallback = (name: string | null | undefined) => {
        if (!name) return "AA";
        const nameParts = name.split(' ');
        return (nameParts[0]?.[0] ?? '' + (nameParts[1]?.[0] ?? '')).toUpperCase();
    }
  
    return (
    <DashboardLayout headerTitle="Meu Perfil">
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Atualize suas informações de perfil.</CardDescription>
          </CardHeader>
          <CardContent>
            {isUserLoading || !currentUser ? (
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full max-w-sm" />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={currentUser.photoURL || `https://picsum.photos/seed/${currentUser.uid}/80/80`} alt={currentUser.displayName || ""} />
                            <AvatarFallback>{getAvatarFallback(currentUser.displayName)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-xl font-semibold">{currentUser.displayName || 'Ana Almeida'}</h3>
                            <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                        </div>
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
                            <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Nome de Exibição</FormLabel>
                                <FormControl>
                                    <Input placeholder="Seu nome" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Salvando..." : "Salvar Alterações"}
                            </Button>
                        </form>
                    </Form>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
