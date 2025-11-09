import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Droplet, Heart, Calendar as CalendarIcon } from "lucide-react";

interface DayModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onMarkMenstruation: () => void;
  onRegisterSymptom: () => void;
}

export function DayModal({ isOpen, onClose, selectedDate, onMarkMenstruation, onRegisterSymptom }: DayModalProps) {
  if (!selectedDate) return null;

  const formattedDate = selectedDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            {formattedDate}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-4">
          <Button
            variant="outline"
            className="w-full h-auto py-4 flex items-center gap-3 justify-start"
            onClick={onMarkMenstruation}
          >
            <Droplet className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">Marcar Menstruação</p>
              <p className="text-xs text-muted-foreground">Registrar dia do ciclo menstrual</p>
            </div>
          </Button>
          <Button
            variant="outline"
            className="w-full h-auto py-4 flex items-center gap-3 justify-start"
            onClick={onRegisterSymptom}
          >
            <Heart className="w-5 h-5" />
            <div className="text-left">
              <p className="font-medium">Registrar Sintomas</p>
              <p className="text-xs text-muted-foreground">Adicionar sintomas do dia</p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
