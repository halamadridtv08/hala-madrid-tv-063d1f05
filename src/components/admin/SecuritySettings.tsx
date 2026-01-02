import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Shield, ShieldCheck, ShieldX, Eye, Clock, MapPin, Smartphone, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";
import { useSiteVisibility } from "@/hooks/useSiteVisibility";

interface LoginAttempt {
  id: string;
  email: string;
  ip_address: string;
  success: boolean;
  attempted_at: string;
  user_agent: string;
}

export function SecuritySettings() {
  const [searchParams] = useSearchParams();
  const [has2FA, setHas2FA] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [showSetup, setShowSetup] = useState(false);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const { isVisible, toggleVisibility, loading: visibilityLoading } = useSiteVisibility();
  
  const devToolsProtectionEnabled = isVisible('devtools_protection');
  const rightClickEnabled = isVisible('protection_right_click');
  const copyEnabled = isVisible('protection_copy');
  const keyboardEnabled = isVisible('protection_keyboard');
  
  // Check if we should open logs tab by default
  const defaultTab = searchParams.get('tab') === 'logs' ? 'logs' : '2fa';

  useEffect(() => {
    if (user && isAdmin) {
      check2FAStatus();
      fetchLoginAttempts();
    }
  }, [user, isAdmin]);

  const check2FAStatus = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('secure_totp_secrets')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setHas2FA(!!data);
    } catch (error: any) {
      console.error('Error checking 2FA status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoginAttempts = async () => {
    try {
      const { data, error } = await supabase
        .from('login_attempts')
        .select('*')
        .order('attempted_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLoginAttempts(data || []);
    } catch (error: any) {
      console.error('Error fetching login attempts:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer l'historique des connexions"
      });
    }
  };

  const disable2FA = async () => {
    if (!user?.id) return;
    if (!window.confirm("Êtes-vous sûr de vouloir désactiver l'authentification à double facteur ?")) return;

    try {
      const { error } = await supabase.rpc('delete_totp_secret');

      if (error) throw error;

      setHas2FA(false);
      toast({
        title: "2FA désactivé",
        description: "L'authentification à double facteur a été désactivée"
      });
    } catch (error: any) {
      console.error('Error disabling 2FA:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de désactiver le 2FA"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLocationFromIP = (ip: string): string => {
    // En production, vous pourriez utiliser un service de géolocalisation IP
    return ip === 'unknown' ? 'Localisation inconnue' : `IP: ${ip}`;
  };

  if (!isAdmin) {
    return (
      <Alert>
        <ShieldX className="h-4 w-4" />
        <AlertDescription>
          Accès refusé. Cette page est réservée aux administrateurs.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return <div>Chargement des paramètres de sécurité...</div>;
  }

  if (showSetup) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setShowSetup(false)}>
          ← Retour aux paramètres
        </Button>
        <TwoFactorSetup onSetupComplete={() => {
          setShowSetup(false);
          setHas2FA(true);
        }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Paramètres de sécurité</h1>
        <Badge variant={has2FA ? "default" : "destructive"}>
          {has2FA ? "2FA activé" : "2FA désactivé"}
        </Badge>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="2fa">Authentification 2FA</TabsTrigger>
          <TabsTrigger value="protection">Protection du site</TabsTrigger>
          <TabsTrigger value="logs">Historique des connexions</TabsTrigger>
        </TabsList>

        <TabsContent value="2fa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentification à double facteur
              </CardTitle>
              <CardDescription>
                Renforcez la sécurité de votre compte avec l'authentification à double facteur (2FA)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {has2FA ? (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-green-800 dark:text-green-200">
                        2FA activé
                      </h3>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        Votre compte est protégé par l'authentification à double facteur
                      </p>
                    </div>
                  </div>
                  <Button variant="destructive" onClick={disable2FA}>
                    Désactiver 2FA
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-center gap-3">
                    <ShieldX className="h-8 w-8 text-red-600" />
                    <div>
                      <h3 className="font-semibold text-red-800 dark:text-red-200">
                        2FA désactivé
                      </h3>
                      <p className="text-sm text-red-600 dark:text-red-300">
                        Votre compte n'est pas protégé par l'authentification à double facteur
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => setShowSetup(true)}>
                    Activer 2FA
                  </Button>
                </div>
              )}

              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  L'authentification à double facteur nécessite une application comme Google Authenticator, 
                  Authy, ou Microsoft Authenticator installée sur votre téléphone.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Protection du site
              </CardTitle>
              <CardDescription>
                Activez/désactivez individuellement chaque type de protection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Attention :</strong> Désactivez ces options lorsque vous travaillez sur l'environnement de développement Lovable.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {/* DevTools Overlay Protection */}
                <div className={`flex items-center justify-between p-4 border rounded-lg ${devToolsProtectionEnabled ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-muted/50'}`}>
                  <div className="flex items-center gap-3">
                    {devToolsProtectionEnabled ? (
                      <ShieldCheck className="h-6 w-6 text-green-600" />
                    ) : (
                      <ShieldX className="h-6 w-6 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">Protection Anti-DevTools</p>
                      <p className="text-xs text-muted-foreground">Affiche un écran bloquant si DevTools est détecté</p>
                    </div>
                  </div>
                  <Switch
                    checked={devToolsProtectionEnabled}
                    onCheckedChange={() => toggleVisibility('devtools_protection')}
                    disabled={visibilityLoading}
                  />
                </div>

                {/* Right-click Protection */}
                <div className={`flex items-center justify-between p-4 border rounded-lg ${rightClickEnabled ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-muted/50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${rightClickEnabled ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                    <div>
                      <p className="font-medium">Blocage clic droit</p>
                      <p className="text-xs text-muted-foreground">Désactive le menu contextuel et le glisser-déposer des médias</p>
                    </div>
                  </div>
                  <Switch
                    checked={rightClickEnabled}
                    onCheckedChange={() => toggleVisibility('protection_right_click')}
                    disabled={visibilityLoading}
                  />
                </div>

                {/* Copy Protection */}
                <div className={`flex items-center justify-between p-4 border rounded-lg ${copyEnabled ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-muted/50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${copyEnabled ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                    <div>
                      <p className="font-medium">Blocage copie</p>
                      <p className="text-xs text-muted-foreground">Bloque copier/coller/couper et la sélection (sauf champs de saisie)</p>
                    </div>
                  </div>
                  <Switch
                    checked={copyEnabled}
                    onCheckedChange={() => toggleVisibility('protection_copy')}
                    disabled={visibilityLoading}
                  />
                </div>

                {/* Keyboard Shortcuts Protection */}
                <div className={`flex items-center justify-between p-4 border rounded-lg ${keyboardEnabled ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-muted/50'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${keyboardEnabled ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                    <div>
                      <p className="font-medium">Blocage raccourcis clavier</p>
                      <p className="text-xs text-muted-foreground">F12, Ctrl+U, Ctrl+S, Ctrl+Shift+I/J/C</p>
                    </div>
                  </div>
                  <Switch
                    checked={keyboardEnabled}
                    onCheckedChange={() => toggleVisibility('protection_keyboard')}
                    disabled={visibilityLoading}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Historique des connexions
                  </CardTitle>
                  <CardDescription>
                    Surveillez les tentatives de connexion à votre système
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={fetchLoginAttempts}>
                  Actualiser
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date/Heure</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Appareil</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loginAttempts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Aucune tentative de connexion enregistrée
                      </TableCell>
                    </TableRow>
                  ) : (
                    loginAttempts.map((attempt) => (
                      <TableRow key={attempt.id}>
                        <TableCell className="font-medium">{attempt.email}</TableCell>
                        <TableCell>
                          <Badge variant={attempt.success ? "default" : "destructive"}>
                            {attempt.success ? "Réussie" : "Échouée"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {formatDate(attempt.attempted_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {getLocationFromIP(attempt.ip_address)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground max-w-xs truncate">
                            {attempt.user_agent}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
