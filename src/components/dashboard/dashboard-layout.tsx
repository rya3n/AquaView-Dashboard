"use client";

import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  LayoutGrid,
  Warehouse,
  ShoppingCart,
  Users,
  Settings,
  Droplets,
  ChevronDown,
  History,
  CreditCard,
} from 'lucide-react';
import Header from '@/components/dashboard/header';
import Link from 'next/link';
import { useUser, useAuth } from '@/firebase';
import React from 'react';

const AUTH_KEY = 'acquaview-auth-validated';

export default function DashboardLayout({
    children,
    headerTitle,
}: {
    children: React.ReactNode;
    headerTitle: string;
}) {
    const pathname = usePathname();
    const auth = useAuth();
    const isActive = (path: string) => pathname === path;
    const { user } = useUser();

    const getAvatarFallback = (name: string | null | undefined) => {
      if (!name) return "AA";
      const nameParts = name.split(' ');
      return (nameParts[0]?.[0] ?? '' + (nameParts[1]?.[0] ?? '')).toUpperCase();
    }
    
    const handleSignOut = () => {
      sessionStorage.removeItem(AUTH_KEY);
      auth.signOut();
    }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Droplets className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline text-lg font-semibold">AcquaView</span>
              <span className="text-xs text-muted-foreground">Acqua Aquários</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/" passHref>
                    <SidebarMenuButton tooltip="Painel" isActive={isActive('/')}>
                        <LayoutGrid />
                        <span>Painel</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                 <Link href="/inventory" passHref>
                    <SidebarMenuButton tooltip="Inventário" isActive={isActive('/inventory')}>
                        <Warehouse />
                        <span>Inventário</span>
                    </SidebarMenuButton>
                 </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/sales" passHref>
                    <SidebarMenuButton tooltip="Vendas" isActive={isActive('/sales')}>
                        <ShoppingCart />
                        <span>Vendas</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/clients" passHref>
                    <SidebarMenuButton tooltip="Clientes" isActive={isActive('/clients')}>
                        <Users />
                        <span>Clientes</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/sales-history" passHref>
                    <SidebarMenuButton tooltip="Histórico" isActive={isActive('/sales-history')}>
                        <History />
                        <span>Histórico</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <Link href="/billing" passHref>
                    <SidebarMenuButton tooltip="Faturamento" isActive={isActive('/billing')}>
                        <CreditCard />
                        <span>Faturamento</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <Header title={headerTitle}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || `https://picsum.photos/seed/${user?.uid}/40/40`} alt="Usuário" />
                    <AvatarFallback>{getAvatarFallback(user?.displayName)}</AvatarFallback>
                  </Avatar>
                  <div className="hidden flex-col items-start md:flex">
                    <span className="text-sm font-medium">{user?.displayName || 'Ana Almeida'}</span>
                    <span className="text-xs text-muted-foreground">Admin</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile" passHref>
                    <DropdownMenuItem>Perfil</DropdownMenuItem>
                </Link>
                <Link href="/settings" passHref>
                  <DropdownMenuItem>Configurações</DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </Header>
        <main className="flex-1 space-y-6 p-4 md:p-6">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
