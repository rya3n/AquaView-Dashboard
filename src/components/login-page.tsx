"use client";

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Droplets } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  password: z.string().min(1, { message: "A senha é obrigatória." }),
});

const CORRECT_PASSWORD = "2106";
const AUTH_KEY = 'acquaview-auth-validated';

export default function LoginPage() {
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  React.useEffect(() => {
    // If the user is already logged in AND validated, redirect them.
    if (user && sessionStorage.getItem(AUTH_KEY) === 'true') {
      router.push('/');
    }
  }, [user, router]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.password === CORRECT_PASSWORD) {
      // 1. Set the session storage flag
      sessionStorage.setItem(AUTH_KEY, 'true');
      
      // 2. Initiate sign-in. The onAuthStateChanged listener will handle the redirect.
      if (!user) {
        initiateAnonymousSignIn(auth);
      } else {
        // If there's already an anonymous user, we don't need to sign in again.
        // Just redirect.
        router.push('/');
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Senha Incorreta',
        description: 'A senha que você digitou está incorreta. Tente novamente.',
      });
      form.reset();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Droplets className="h-7 w-7" />
                </div>
            </div>
          <CardTitle>AcquaView</CardTitle>
          <CardDescription>Painel de Controle</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha de Acesso</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Digite a senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
