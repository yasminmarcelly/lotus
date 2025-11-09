import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface MenstruationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onSave: (intensity: string, notes: string) => Promise<void>;
}

export function MenstruationModal({ isOpen, onClose, selectedDate, onSave }: MenstruationModalProps) {
  const [intensity, setIntensity] = useState<string>("moderado");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(intensity, notes);
      setNotes("");
      setIntensity("moderado");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!selectedDate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Menstruação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-3">
            <Label>Intensidade do Fluxo</Label>
            <RadioGroup value={intensity} onValueChange={setIntensity}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="leve" id="leve" />
                <Label htmlFor="leve" className="font-normal cursor-pointer">Leve</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="moderado" id="moderado" />
                <Label htmlFor="moderado" className="font-normal cursor-pointer">Moderado</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intenso" id="intenso" />
                <Label htmlFor="intenso" className="font-normal cursor-pointer">Intenso</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Adicione observações sobre o dia..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
