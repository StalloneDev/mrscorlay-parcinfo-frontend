import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  Database,
  Download,
  Upload,
  Trash2
} from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState({
    email: true,
    desktop: false,
    tickets: true,
    equipment: true,
    licenses: true,
  });

  const [preferences, setPreferences] = useState({
    language: "fr",
    timezone: "Europe/Paris",
    dateFormat: "dd/MM/yyyy",
    autoRefresh: 30,
  });

  const handleSaveNotifications = () => {
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos préférences de notifications ont été mises à jour",
    });
  };

  const handleSavePreferences = () => {
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos préférences générales ont été mises à jour",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export en cours",
      description: "Vos données sont en cours d'exportation...",
    });
  };

  const handleImportData = () => {
    toast({
      title: "Import en cours",
      description: "Vos données sont en cours d'importation...",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-3">
        <SettingsIcon className="h-8 w-8 text-primary-600" />
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Paramètres</h1>
          <p className="text-muted-foreground">Configurez l'application selon vos préférences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <span>Apparence</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode">Mode sombre</Label>
                <p className="text-sm text-muted-foreground">
                  Activer le thème sombre pour l'interface
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="language">Langue</Label>
              <select
                id="language"
                value={preferences.language}
                onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-background text-foreground"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Fuseau horaire</Label>
              <select
                id="timezone"
                value={preferences.timezone}
                onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-background text-foreground"
              >
                <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                <option value="UTC">UTC (GMT+0)</option>
                <option value="America/New_York">America/New_York (GMT-5)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-format">Format de date</Label>
              <select
                id="date-format"
                value={preferences.dateFormat}
                onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-background text-foreground"
              >
                <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                <option value="yyyy-MM-dd">YYYY-MM-DD</option>
              </select>
            </div>

            <Button onClick={handleSavePreferences} className="w-full">
              Sauvegarder les préférences
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Notifications par email</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir des notifications par email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="desktop-notifications">Notifications bureau</Label>
                <p className="text-sm text-muted-foreground">
                  Afficher les notifications sur le bureau
                </p>
              </div>
              <Switch
                id="desktop-notifications"
                checked={notifications.desktop}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, desktop: checked }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="ticket-notifications">Notifications de tickets</Label>
                <p className="text-sm text-muted-foreground">
                  Nouveaux tickets et mises à jour
                </p>
              </div>
              <Switch
                id="ticket-notifications"
                checked={notifications.tickets}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, tickets: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="equipment-notifications">Notifications d'équipements</Label>
                <p className="text-sm text-muted-foreground">
                  Changements d'état des équipements
                </p>
              </div>
              <Switch
                id="equipment-notifications"
                checked={notifications.equipment}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, equipment: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="license-notifications">Notifications de licences</Label>
                <p className="text-sm text-muted-foreground">
                  Expirations et alertes de licences
                </p>
              </div>
              <Switch
                id="license-notifications"
                checked={notifications.licenses}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, licenses: checked }))}
              />
            </div>

            <Button onClick={handleSaveNotifications} className="w-full">
              Sauvegarder les notifications
            </Button>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Système</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auto-refresh">Actualisation automatique (secondes)</Label>
              <Input
                id="auto-refresh"
                type="number"
                value={preferences.autoRefresh}
                onChange={(e) => setPreferences(prev => ({ ...prev, autoRefresh: parseInt(e.target.value) }))}
                min="10"
                max="300"
              />
              <p className="text-sm text-muted-foreground">
                Fréquence d'actualisation des données (10-300 secondes)
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Gestion des données</h4>
              
              <Button variant="outline" onClick={handleExportData} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Exporter les données
              </Button>
              
              <Button variant="outline" onClick={handleImportData} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Importer des données
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Sécurité</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium">Gestion de session</h4>
              
              <Button variant="outline" className="w-full">
                Fermer toutes les autres sessions
              </Button>
              
              <Button variant="outline" className="w-full">
                Changer le mot de passe
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Audit et logs</h4>
              
              <Button variant="outline" className="w-full">
                Télécharger les logs d'audit
              </Button>
              
              <Button variant="outline" className="w-full">
                Vider le cache de l'application
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium text-destructive">Zone de danger</h4>
              
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Réinitialiser toutes les données
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Cette action est irréversible et supprimera toutes les données.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de l'application</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Version</p>
              <p className="text-lg font-semibold">2.0.0</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Dernière mise à jour</p>
              <p className="text-lg font-semibold">{new Date().toLocaleDateString('fr-FR')}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Environnement</p>
              <p className="text-lg font-semibold">Production</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
