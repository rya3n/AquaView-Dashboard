
"use client";

import DashboardLayout from './dashboard-layout';
import RegisterSaleForm from './register-sale-form';

export default function SalesPage() {
    return (
        <DashboardLayout headerTitle="Vendas">
            <div className="grid grid-cols-1 gap-6">
                <RegisterSaleForm />
            </div>
        </DashboardLayout>
    );
}
