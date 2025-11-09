import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Droplet, Heart, Calendar as CalendarIcon, Trash2 } from "lucide-react";

interface DayModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onMarkMenstruation: () => void;
  onRegisterSymptom: () => void;
  hasMenstruation: boolean;
  hasSymptom: boolean;
  onRemoveMenstruation: () => void;
  onRemoveSymptom: () => void;
}

export function DayModal({ isOpen, onClose, selectedDate, onMarkMenstruation, onRegisterSymptom, hasMenstruation, hasSymptom, onRemoveMenstruation, onRemoveSymptom }: DayModalProps) {
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-auto py-4 flex items-center gap-3 justify-start"
              onClick={onMarkMenstruation}
            >
              <Droplet className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">{hasMenstruation ? "Editar" : "Marcar"} Menstruação</p>
                <p className="text-xs text-muted-foreground">Registrar dia do ciclo menstrual</p>
              </div>
            </Button>
            {hasMenstruation && (
              <Button
                variant="destructive"
                size="icon"
                className="h-auto w-12"
                onClick={onRemoveMenstruation}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-auto py-4 flex items-center gap-3 justify-start"
              onClick={onRegisterSymptom}
            >
              <Heart className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">Registrar Sintomas</p>
                <p className="text-xs text-muted-foreground">Adicionar sintomas do dia</p>
              </div>
            </Button>
            {hasSymptom && (
              <Button
                variant="destructive"
                size="icon"
                className="h-auto w-12"
                onClick={onRemoveSymptom}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
