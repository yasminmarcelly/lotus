import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const commonSymptoms = [
  "Dor Pélvica",
  "Cólicas",
  "Fadiga",
  "Náusea",
  "Dor nas costas",
  "Inchaço",
  "Dor de cabeça",
  "Alteração no intestino",
];

interface SymptomModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onSave: (symptomName: string, intensity: number, notes: string) => Promise<void>;
}

export function SymptomModal({ isOpen, onClose, selectedDate, onSave }: SymptomModalProps) {
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [customSymptom, setCustomSymptom] = useState("");
  const [intensity, setIntensity] = useState<number>(5);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSave = async () => {
    const symptomToSave = showCustomInput ? customSymptom : selectedSymptom;
    
    if (!symptomToSave) return;

    setLoading(true);
    try {
      await onSave(symptomToSave, intensity, notes);
      resetForm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedSymptom(null);
    setCustomSymptom("");
    setIntensity(5);
    setNotes("");
    setShowCustomInput(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!selectedDate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Sintoma</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {!showCustomInput ? (
            <>
              <div className="space-y-3">
                <Label>Selecione o sintoma</Label>
                <div className="grid grid-cols-2 gap-2">
                  {commonSymptoms.map((symptom) => (
                    <Button
                      key={symptom}
                      variant={selectedSymptom === symptom ? "default" : "outline"}
                      className="h-auto py-3 text-sm"
                      onClick={() => setSelectedSymptom(symptom)}
                    >
                      {symptom}
                    </Button>
                  ))}
                  <Button
                    variant={showCustomInput ? "default" : "outline"}
                    className="h-auto py-3 text-sm col-span-2"
                    onClick={() => setShowCustomInput(true)}
                  >
                    Outro sintoma
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="custom">Nome do sintoma</Label>
              <Input
                id="custom"
                placeholder="Digite o nome do sintoma"
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCustomInput(false)}
                className="text-xs"
              >
                Voltar para lista
              </Button>
            </div>
          )}

          {(selectedSymptom || customSymptom) && (
            <>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Intensidade</Label>
                    <span className="text-2xl font-bold text-primary">{intensity}</span>
                  </div>
                  <Slider
                    value={[intensity]}
                    onValueChange={(value) => setIntensity(value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Leve</span>
                    <span>Intenso</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symptom-notes">Observações (opcional)</Label>
                  <Textarea
                    id="symptom-notes"
                    placeholder="Adicione detalhes sobre o sintoma..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={handleClose} className="flex-1" disabled={loading}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="flex-1" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
