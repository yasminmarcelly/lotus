import { useState, useEffect } from "react";
import { Header } from "@/components/Layout/Header";
import { BottomNav } from "@/components/Layout/BottomNav";
import { WeekCalendar } from "@/components/Dashboard/WeekCalendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Heart, Pill, Users, FileText, ArrowRight, AlertCircle, FileBarChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentSymptoms, setRecentSymptoms] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchRecentSymptoms();
    }
  }, [user]);

  const fetchRecentSymptoms = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("symptoms")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3);

    if (error) {
      console.error("Error fetching symptoms:", error);
      return;
    }

    setRecentSymptoms(data || []);
  };

  const quickStats = [
    { label: "Próximo Ciclo", value: "em 7 dias", icon: Calendar, color: "text-primary" },
    { label: "Sintomas (7d)", value: "12 registros", icon: Heart, color: "text-secondary-dark" },
    { label: "Medicamentos", value: "3 ativos", icon: Pill, color: "text-accent" },
  ];

  const quickActions = [
    { label: "Registrar Sintomas", icon: Heart, path: "/symptoms", gradient: "from-secondary to-secondary-dark" },
    { label: "Ver Calendário", icon: Calendar, path: "/calendar", gradient: "from-secondary to-secondary-dark" },
    { label: "Profissionais", icon: Users, path: "/professionals", gradient: "from-primary-light to-primary" },
    { label: "Medicamentos", icon: Pill, path: "/medications", gradient: "from-primary-light to-primary" },
    { label: "Modo Crise", icon: AlertCircle, path: "/crisis", gradient: "from-crisis to-destructive" },
    { label: "Obter Relatório", icon: FileBarChart, path: "/reports", gradient: "from-crisis to-destructive" },
  ];

  return (
    <div className="min-h-screen bg-gradient-calm pb-24">
      <Header title="Lotus" showNotifications showSettings />
      
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6 animate-fade-in">
        {/* Greeting */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Olá, Maria</h2>
        </div>

        {/* Week Calendar */}
        <Card className="shadow-soft border-border">
          <CardContent className="pt-6">
            <WeekCalendar onDateClick={(date) => navigate("/calendar")} />
          </CardContent>
        </Card>

        {/* Alerts */}
        <Alert className="border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            Seu próximo ciclo está previsto para daqui a 7 dias.
          </AlertDescription>
        </Alert>

        {/* Tips Section */}
        <Card className="shadow-soft border-border bg-gradient-secondary">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-secondary-dark" />
              Dica do Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-secondary-foreground mb-3">
              Manter um registro detalhado dos seus sintomas ajuda seu médico a criar um plano de tratamento mais eficaz para você.
            </p>
            <Button variant="ghost" size="sm" onClick={() => navigate("/articles")} className="text-secondary-foreground hover:text-secondary-foreground">
              Ler mais artigos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="shadow-soft border-border">
                <CardContent className="pt-4 flex flex-col items-center text-center gap-2">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-foreground">Ações Rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className={`p-4 rounded-xl bg-gradient-to-br ${action.gradient} text-white shadow-soft hover:shadow-medium transition-all hover:scale-[1.02]`}
                >
                  <Icon className="w-6 h-6 mb-2" />
                  <p className="text-xs font-medium text-left">{action.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="shadow-soft border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Atividade Recente
              <Button variant="ghost" size="sm" onClick={() => navigate("/reports")}>
                Ver tudo
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentSymptoms.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma atividade recente
              </p>
            ) : (
              recentSymptoms.map((symptom) => {
                const symptomDate = new Date(symptom.created_at);
                const formattedDate = format(symptomDate, "d 'de' MMMM 'às' HH:mm", { locale: ptBR });
                
                return (
                  <div key={symptom.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                    <div className="w-2 h-2 rounded-full bg-secondary-dark mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Sintoma registrado</p>
                      <p className="text-xs text-muted-foreground">
                        {symptom.symptom_name} • Intensidade {symptom.intensity}/10 • {formattedDate}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

      </main>

      <BottomNav />
    </div>
  );
}
