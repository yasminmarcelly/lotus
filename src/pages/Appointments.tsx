import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Layout/Header";
import { BottomNav } from "@/components/Layout/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Plus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Appointment {
  id: string;
  professional_id: string;
  date: string;
  time: string;
  status: string;
  professionals: {
    name: string;
    specialty: string;
  };
}

export default function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  useEffect(() => {
    checkAuth();
    loadAppointments();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) navigate("/auth");
  };

  const loadAppointments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('appointments')
        .select('*, professionals(name, specialty)')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Erro ao carregar consultas');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelDialog.id) return;
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelada' })
        .eq('id', cancelDialog.id);

      if (error) throw error;
      
      toast.success('Consulta cancelada');
      loadAppointments();
    } catch (error) {
      console.error('Error canceling appointment:', error);
      toast.error('Erro ao cancelar consulta');
    } finally {
      setCancelDialog({ open: false, id: null });
    }
  };

  const upcomingAppointments = appointments.filter(a => a.status === 'agendada');
  const pastAppointments = appointments.filter(a => ['concluída', 'cancelada'].includes(a.status));

  return (
    <div className="min-h-screen bg-gradient-calm pb-24">
      <Header title="Minhas Consultas" showBack showNotifications />
      
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6 animate-fade-in">
        <Button onClick={() => navigate("/professionals")} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Agendar Nova Consulta
        </Button>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Agendadas ({upcomingAppointments.length})</TabsTrigger>
            <TabsTrigger value="past">Realizadas ({pastAppointments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 mt-4">
            {loading ? (
              <Card className="shadow-soft border-border animate-pulse">
                <CardContent className="pt-6 space-y-4">
                  <div className="h-6 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ) : upcomingAppointments.length === 0 ? (
              <Card className="shadow-soft border-border">
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nenhuma consulta agendada
                </CardContent>
              </Card>
            ) : (
              upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="shadow-soft border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {appointment.professionals.name}
                        </h3>
                        <Badge variant="secondary" className="mt-1">
                          {appointment.professionals.specialty}
                        </Badge>
                      </div>
                      <Badge className="bg-accent text-accent-foreground">Confirmada</Badge>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(appointment.date).toLocaleDateString("pt-BR")}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {appointment.time}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setCancelDialog({ open: true, id: appointment.id })}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4 mt-4">
            {pastAppointments.length === 0 ? (
              <Card className="shadow-soft border-border">
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nenhuma consulta realizada
                </CardContent>
              </Card>
            ) : (
              pastAppointments.map((appointment) => (
                <Card key={appointment.id} className="shadow-soft border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {appointment.professionals.name}
                        </h3>
                        <Badge variant="secondary" className="mt-1">
                          {appointment.professionals.specialty}
                        </Badge>
                      </div>
                      <Badge variant="outline">
                        {appointment.status === 'concluída' ? 'Realizada' : 'Cancelada'}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(appointment.date).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      <AlertDialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog({ open, id: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Consulta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar esta consulta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, manter consulta</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel}>Sim, cancelar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  );
}
