import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  Database,
  Download,
  Upload,
  Trash2,
  Lock,
  LogOut
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImportExportModal } from "@/components/modals/import-export-modal";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [importExportMode, setImportExportMode] = useState<"import" | "export">("export");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
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

  const handleSaveNotifications = async () => {
    try {
      await apiRequest('PUT', '/api/settings/notifications', notifications);
      toast({
        title: "Paramètres sauvegardés",
        description: "Vos préférences de notifications ont été mises à jour",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les préférences de notifications",
        variant: "destructive",
      });
    }
  };

  const handleSavePreferences = async () => {
    try {
      await apiRequest('PUT', '/api/settings/preferences', preferences);
      toast({
        title: "Paramètres sauvegardés",
        description: "Vos préférences générales ont été mises à jour",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les préférences",
        variant: "destructive",
      });
    }
  };

  const handleExportData = () => {
    setImportExportMode("export");
    setIsImportExportModalOpen(true);
  };

  const handleImportData = () => {
    setImportExportMode("import");
    setIsImportExportModalOpen(true);
  };

  const handleCloseOtherSessions = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout-other-sessions');
      toast({
        title: "Sessions fermées",
        description: "Toutes les autres sessions ont été fermées",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de fermer les autres sessions",
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest('PUT', '/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setIsChangePasswordOpen(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été modifié avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le mot de passe",
        variant: "destructive",
      });
    }
  };

  const handleClearCache = async () => {
    try {
      await apiRequest('POST', '/api/settings/clear-cache');
      toast({
        title: "Cache vidé",
        description: "Le cache de l'application a été vidé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de vider le cache",
        variant: "destructive",
      });
    }
  };

  const handleResetData = async () => {
    if (!confirm("Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.")) {
      return;
    }

    try {
      await apiRequest('POST', '/api/settings/reset-data');
      toast({
        title: "Données réinitialisées",
        description: "Toutes les données ont été réinitialisées",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser les données",
        variant: "destructive",
      });
    }
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
              
              <Button variant="outline" onClick={handleCloseOtherSessions} className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Fermer toutes les autres sessions
              </Button>
              
              <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Lock className="h-4 w-4 mr-2" />
                    Changer le mot de passe
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Changer le mot de passe</DialogTitle>
                    <DialogDescription>
                      Entrez votre mot de passe actuel et votre nouveau mot de passe
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Mot de passe actuel</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nouveau mot de passe</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleChangePassword}>Changer le mot de passe</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Audit et logs</h4>
              
              <Button variant="outline" onClick={handleExportData} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Télécharger les logs d'audit
              </Button>
              
              <Button variant="outline" onClick={handleClearCache} className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Vider le cache de l'application
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium text-destructive">Zone de danger</h4>
              
              <Button variant="destructive" onClick={handleResetData} className="w-full">
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

      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        mode={importExportMode}
      />
    </div>
  );
}
