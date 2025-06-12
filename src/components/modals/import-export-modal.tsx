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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "import" ? "Importer des données" : "Exporter des données"}
          </DialogTitle>
          <DialogDescription>
            {mode === "import"
              ? "Sélectionnez le type de données à importer et choisissez votre fichier"
              : "Sélectionnez le type de données à exporter"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type de données</label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un type" />
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

          {mode === "import" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Fichier</label>
              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('import-file')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choisir un fichier
                </Button>
                <input
                  id="import-file"
                  type="file"
                  accept=".xls"
                  className="hidden"
                  onChange={handleImport}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {mode === "export" && (
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 