
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, ShieldCheck, ShieldX, Eye, Clock, MapPin, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";

interface LoginAttempt {
  id: string;
  email: string;
  ip_address: string;
  success: boolean;
  attempted_at: string;
  user_agent: string;
}

export function SecuritySettings() {
  const [has2FA, setHas2FA] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [showSetup, setShowSetup] = useState(false);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

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
        .from('user_totp_secrets')
        .select('is_verified')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setHas2FA(data?.is_verified || false);
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
      const { error } = await supabase
        .from('user_totp_secrets')
        .delete()
        .eq('user_id', user.id);

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

      <Tabs defaultValue="2fa" className="space-y-4">
        <TabsList>
          <TabsTrigger value="2fa">Authentification 2FA</TabsTrigger>
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
