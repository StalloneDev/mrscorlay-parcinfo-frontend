import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Download, Upload } from "lucide-react";
import { getApiUrl } from "@/lib/config";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "import" | "export";
}

const DATA_TYPES = [
  { value: "employees", label: "Employés" },
  { value: "equipment", label: "Équipements" },
  { value: "inventory", label: "Inventaire" },
  { value: "licenses", label: "Licences" },
  { value: "planning", label: "Planning" },
  { value: "tickets", label: "Tickets" },
];

export function ImportExportModal({ isOpen, onClose, mode }: ImportExportModalProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleExport = async () => {
    if (!selectedType) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un type de données",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/settings/export/${selectedType}`), {
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/vnd.ms-excel",
        },
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      // Récupérer le blob directement
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedType}-export-${new Date().toISOString()}.xls`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export réussi",
        description: "Vos données ont été exportées avec succès",
      });
      onClose();
    } catch (error) {
      console.error("Erreur d'export:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'exporter les données",
        variant: "destructive",
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedType) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un type de données",
        variant: "destructive",
      });
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', selectedType);

      const response = await fetch(getApiUrl('/api/settings/import'), {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Import failed');
      }

      toast({
        title: "Import réussi",
        description: "Vos données ont été importées avec succès",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'importer les données",
        variant: "destructive",
      });
    }
  };

  const handleGenerateTemplate = async () => {
    if (!selectedType) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un type de données",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/settings/template/${selectedType}`, {
        method: "GET",
        headers: {
          Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la génération du modèle");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedType}-template.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Modèle généré avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la génération du modèle:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération du modèle",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Importer/Exporter des données</DialogTitle>
          <DialogDescription>
            Sélectionnez le type de données à importer ou exporter
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select
              value={selectedType}
              onValueChange={setSelectedType}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {DATA_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file" className="text-right">
              Fichier
            </Label>
            <div className="col-span-3">
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImport}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleGenerateTemplate}
            className="w-full sm:w-auto"
          >
            Générer un modèle
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="w-full sm:w-auto"
          >
            Exporter
          </Button>
          <Button
            onClick={() => handleImport(null as unknown as React.ChangeEvent<HTMLInputElement>)}
            disabled={!selectedType}
            className="w-full sm:w-auto"
          >
            Importer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 