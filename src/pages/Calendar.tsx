import { useState, useEffect } from "react";
import { Header } from "@/components/Layout/Header";
import { BottomNav } from "@/components/Layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Circle, Heart, Droplet } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { DayModal } from "@/components/Calendar/DayModal";
import { MenstruationModal } from "@/components/Calendar/MenstruationModal";
import { SymptomModal } from "@/components/Symptoms/SymptomModal";
import { useNavigate } from "react-router-dom";

const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showMenstruationModal, setShowMenstruationModal] = useState(false);
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [menstruationDays, setMenstruationDays] = useState<number[]>([]);
  const [symptomDays, setSymptomDays] = useState<number[]>([]);
  const navigate = useNavigate();

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    checkAuth();
    loadCalendarData();
  }, [currentDate]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
    }
  };

  const loadCalendarData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
      const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

      // Load menstruation days
      const { data: cycles } = await supabase
        .from('menstruation_cycles')
        .select('date')
        .eq('user_id', user.id)
        .gte('date', firstDay)
        .lte('date', lastDay);

      if (cycles) {
        const days: number[] = (cycles as any[]).map((c: any) => {
          const [y, m, d] = String(c.date).split('-').map(Number);
          return new Date(y, m - 1, d).getDate();
        });
        setMenstruationDays(days);
      }

      // Load symptom days
      const { data: symptoms } = await supabase
        .from('symptoms')
        .select('date')
        .eq('user_id', user.id)
        .gte('date', firstDay)
        .lte('date', lastDay);

      if (symptoms) {
        const days: number[] = [...new Set((symptoms as any[]).map((s: any) => {
          const [y, m, d] = String(s.date).split('-').map(Number);
          return new Date(y, m - 1, d).getDate();
        }))] as number[];
        setSymptomDays(days);
      }
    } catch (error) {
      console.error('Error loading calendar data:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getDayStatus = (day: number) => {
    if (menstruationDays.includes(day)) return "menstruation";
    if (symptomDays.includes(day)) return "symptom";
    return null;
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    setShowDayModal(true);
  };

  const removeMenstruation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !selectedDate) return;

      const dateStr = formatLocalDate(selectedDate);

      const { error } = await supabase
        .from('menstruation_cycles')
        .delete()
        .eq('user_id', user.id)
        .eq('date', dateStr);

      if (error) throw error;

      toast.success("Menstruação removida com sucesso!");
      await loadCalendarData();
      setShowDayModal(false);
    } catch (error) {
      console.error('Error removing menstruation:', error);
      toast.error("Erro ao remover");
    }
  };

  const removeSymptoms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !selectedDate) return;

      const dateStr = formatLocalDate(selectedDate);

      const { error } = await supabase
        .from('symptoms')
        .delete()
        .eq('user_id', user.id)
        .eq('date', dateStr);

      if (error) throw error;

      toast.success("Sintomas removidos com sucesso!");
      await loadCalendarData();
      setShowDayModal(false);
    } catch (error) {
      console.error('Error removing symptoms:', error);
      toast.error("Erro ao remover sintomas");
    }
  };

  const saveMenstruation = async (intensity: string, notes: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !selectedDate) return;

      const dateStr = formatLocalDate(selectedDate);

      const { error } = await supabase
        .from('menstruation_cycles')
        .upsert({
          user_id: user.id,
          date: dateStr,
          flow_intensity: intensity,
          notes
        }, {
          onConflict: 'user_id,date'
        });

      if (error) throw error;

      toast.success("Menstruação registrada com sucesso!");
      loadCalendarData();
      setShowMenstruationModal(false);
      setShowDayModal(false);
    } catch (error) {
      console.error('Error saving menstruation:', error);
      toast.error("Erro ao salvar");
    }
  };

  const saveSymptom = async (symptomName: string, intensity: number, notes: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !selectedDate) return;

      const dateStr = formatLocalDate(selectedDate);

      const { error } = await supabase
        .from('symptoms')
        .insert({
          user_id: user.id,
          date: dateStr,
          symptom_name: symptomName,
          intensity,
          notes
        });

      if (error) throw error;

      toast.success("Sintoma registrado com sucesso!");
      loadCalendarData();
      setShowSymptomModal(false);
      setShowDayModal(false);
    } catch (error) {
      console.error('Error saving symptom:', error);
      toast.error("Erro ao salvar sintoma");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-calm pb-24">
      <Header title="Calendário Menstrual" showBack showNotifications />
      
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6 animate-fade-in">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => {
              setSelectedDate(new Date());
              setShowMenstruationModal(true);
            }}
          >
            <Droplet className="w-5 h-5" />
            <span className="text-xs">Marcar Menstruação</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => {
              setSelectedDate(new Date());
              setShowSymptomModal(true);
            }}
          >
            <Heart className="w-5 h-5" />
            <span className="text-xs">Registrar Sintomas</span>
          </Button>
        </div>
       
        {/* Calendar Card */}
        <Card className="shadow-medium border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={previousMonth}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <CardTitle className="text-lg">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Days of week */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const status = getDayStatus(day);
                const isToday = day === new Date().getDate() && 
                                currentDate.getMonth() === new Date().getMonth();

                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      "aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all relative",
                      isToday && "ring-2 ring-primary ring-offset-2",
                      status === "menstruation" && "bg-destructive/20 text-destructive hover:bg-destructive/30",
                      status === "symptom" && "bg-secondary text-secondary-foreground hover:bg-secondary-dark",
                      !status && "hover:bg-muted text-foreground"
                    )}
                  >
                    {day}
                    {status === "menstruation" && (
                      <Droplet className="w-3 h-3 absolute bottom-1" />
                    )}
                    {status === "symptom" && (
                      <Circle className="w-2 h-2 fill-current absolute bottom-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="shadow-soft border-border">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center">
                  <Droplet className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Dias de Menstruação</p>
                  <p className="text-xs text-muted-foreground">Período menstrual registrado</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <Circle className="w-3 h-3 fill-current text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Dias com Sintomas</p>
                  <p className="text-xs text-muted-foreground">Sintomas registrados neste dia</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cycle Info */}
        <Card className="shadow-soft border-border bg-gradient-primary">
          <CardHeader>
            <CardTitle className="text-white text-lg">Previsão do Próximo Ciclo</CardTitle>
          </CardHeader>
          <CardContent className="text-white">
            <p className="text-2xl font-bold mb-2">7 dias</p>
            <p className="text-sm text-white/80">Próxima menstruação prevista para 24 de Novembro</p>
          </CardContent>
        </Card>

       
      </main>

      <DayModal
        isOpen={showDayModal}
        onClose={() => setShowDayModal(false)}
        selectedDate={selectedDate}
        onMarkMenstruation={() => {
          setShowDayModal(false);
          setShowMenstruationModal(true);
        }}
        onRegisterSymptom={() => {
          setShowDayModal(false);
          setShowSymptomModal(true);
        }}
        hasMenstruation={selectedDate ? menstruationDays.includes(selectedDate.getDate()) : false}
        hasSymptom={selectedDate ? symptomDays.includes(selectedDate.getDate()) : false}
        onRemoveMenstruation={removeMenstruation}
        onRemoveSymptom={removeSymptoms}
      />

      <MenstruationModal
        isOpen={showMenstruationModal}
        onClose={() => setShowMenstruationModal(false)}
        selectedDate={selectedDate}
        onSave={saveMenstruation}
      />

      <SymptomModal
        isOpen={showSymptomModal}
        onClose={() => setShowSymptomModal(false)}
        selectedDate={selectedDate}
        onSave={saveSymptom}
      />

      <BottomNav />
    </div>
  );
}
