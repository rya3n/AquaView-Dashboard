import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Appointment } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';


type ServiceScheduleProps = {
  appointments: Appointment[];
}

export default function ServiceSchedule({ appointments }: ServiceScheduleProps) {

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'Agendado':
        return 'bg-blue-500';
      case 'Em Andamento':
        return 'bg-yellow-500';
      case 'Concluído':
        return 'bg-green-500';
      case 'Cancelado':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Agendamentos de Serviços</CardTitle>
        <CardDescription>Próximos serviços agendados.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="flex items-start gap-4">
              <Avatar className="h-10 w-10 border">
                 <AvatarFallback>{appointment.customerName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1 flex-1">
                <div className="flex items-center justify-between">
                    <p className="font-medium">{appointment.customerName}</p>
                    <span className="text-xs text-muted-foreground">{format(appointment.date, "dd/MM")}</span>
                </div>
                <p className="text-sm text-muted-foreground">{appointment.service}</p>
                <p className="text-xs text-muted-foreground">Técnico: {appointment.technician}</p>
              </div>
              <div className="flex items-center gap-2">
                 <div className={cn("h-2.5 w-2.5 rounded-full", getStatusColor(appointment.status))}></div>
                 <span className="text-xs text-muted-foreground">{appointment.status}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
