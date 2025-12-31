import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, Database, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SettingsDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false);
  const [showOptimizeDialog, setShowOptimizeDialog] = useState(false);

  const handleToggleMaintenance = () => {
    setMaintenanceMode(!maintenanceMode);
    toast({
      title: maintenanceMode ? "Mode maintenance désactivé" : "Mode maintenance activé",
      description: maintenanceMode 
        ? "Le site est maintenant accessible au public"
        : "Le site est en maintenance",
    });
  };

  const handleToggleNotifications = () => {
    setPushNotifications(!pushNotifications);
    toast({
      title: pushNotifications ? "Notifications désactivées" : "Notifications activées",
      description: pushNotifications
        ? "Les utilisateurs ne recevront plus de notifications"
        : "Les utilisateurs recevront des notifications",
    });
  };

  const handleToggleBackup = () => {
    setAutoBackup(!autoBackup);
    toast({
      title: autoBackup ? "Sauvegarde automatique désactivée" : "Sauvegarde automatique activée",
      description: autoBackup
        ? "Les sauvegardes automatiques sont désactivées"
        : "Les sauvegardes automatiques sont activées",
    });
  };

  const handleClearCache = () => {
    setShowClearCacheDialog(false);
    toast({
      title: "Cache vidé avec succès",
      description: "Le cache du site a été vidé",
    });
  };

  const handleOptimizeDB = () => {
    setShowOptimizeDialog(false);
    toast({
      title: "Optimisation en cours",
      description: "La base de données est en cours d'optimisation...",
    });
  };

  const handleConfigureSEO = () => {
    navigate('/admin/seo');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration générale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Mode maintenance</h4>
              <p className="text-sm text-muted-foreground">Activer le mode maintenance du site</p>
            </div>
            <Button
              variant={maintenanceMode ? "default" : "secondary"}
              size="sm"
              onClick={handleToggleMaintenance}
            >
              {maintenanceMode ? "Activé" : "Désactivé"}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Notifications push</h4>
              <p className="text-sm text-muted-foreground">Envoyer des notifications aux utilisateurs</p>
            </div>
            <Button
              variant={pushNotifications ? "default" : "secondary"}
              size="sm"
              onClick={handleToggleNotifications}
            >
              {pushNotifications ? "Activé" : "Désactivé"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security card - Admin only */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Authentification à deux facteurs</h4>
                <p className="text-sm text-muted-foreground">Protection supplémentaire pour les administrateurs</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/admin/security')}
              >
                Configurer
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Logs de sécurité</h4>
                <p className="text-sm text-muted-foreground">Consulter les tentatives de connexion</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/admin/security?tab=logs')}
              >
                Voir les logs
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Base de données
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Sauvegarde automatique</h4>
              <p className="text-sm text-muted-foreground">Dernière sauvegarde: il y a 2 heures</p>
            </div>
            <Button
              variant={autoBackup ? "default" : "secondary"}
              size="sm"
              onClick={handleToggleBackup}
            >
              {autoBackup ? "Activé" : "Désactivé"}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Optimisation</h4>
              <p className="text-sm text-muted-foreground">Optimiser les performances de la base</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowOptimizeDialog(true)}
            >
              Optimiser
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Site web
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Cache du site</h4>
              <p className="text-sm text-muted-foreground">Vider le cache pour appliquer les changements</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowClearCacheDialog(true)}
            >
              Vider le cache
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">SEO</h4>
              <p className="text-sm text-muted-foreground">Configuration du référencement</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleConfigureSEO}
            >
              Configurer
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showClearCacheDialog} onOpenChange={setShowClearCacheDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vider le cache ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action videra le cache du site. Les changements seront appliqués immédiatement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearCache}>Vider</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showOptimizeDialog} onOpenChange={setShowOptimizeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Optimiser la base de données ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action optimisera les performances de la base de données. Cela peut prendre quelques minutes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleOptimizeDB}>Optimiser</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SettingsDashboard;
