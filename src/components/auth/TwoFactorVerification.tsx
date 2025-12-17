
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as OTPAuth from "otpauth";

interface TwoFactorVerificationProps {
  email: string;
  onVerificationSuccess: () => void;
  onCancel: () => void;
}

export function TwoFactorVerification({ email, onVerificationSuccess, onCancel }: TwoFactorVerificationProps) {
  const [totpCode, setTotpCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const verifyTOTP = async () => {
    if (totpCode.length !== 6) return;

    setLoading(true);
    try {
      // Récupérer le secret TOTP de l'utilisateur
      const { data: userSession } = await supabase.auth.getSession();
      if (!userSession.session?.user) throw new Error("Utilisateur non authentifié");

      const { data: totpData, error: totpError } = await supabase
        .from('user_totp_secrets')
        .select('secret')
        .eq('user_id', userSession.session.user.id)
        .eq('is_verified', true)
        .single();

      if (totpError || !totpData) {
        throw new Error("Configuration 2FA non trouvée");
      }

      // Vérifier le code TOTP
      const totp = new OTPAuth.TOTP({
        issuer: "Hala Madrid TV",
        label: email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: totpData.secret,
      });

      const isValid = totp.validate({ token: totpCode, window: 1 }) !== null;

      if (isValid) {
        await logLoginAttempt(email, true);
        onVerificationSuccess();
        toast({
          title: "Connexion réussie",
          description: "Authentification à double facteur validée"
        });
      } else {
        await logLoginAttempt(email, false);
        toast({
          variant: "destructive",
          title: "Code invalide",
          description: "Le code TOTP saisi n'est pas valide"
        });
      }
    } catch (error: any) {
      console.error('Error verifying TOTP:', error);
      await logLoginAttempt(email, false);
      toast({
        variant: "destructive",
        title: "Erreur de vérification",
        description: error.message || "Impossible de vérifier le code"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyBackupCode = async () => {
    if (backupCode.length !== 8) return;

    setLoading(true);
    try {
      const { data: userSession } = await supabase.auth.getSession();
      if (!userSession.session?.user) throw new Error("Utilisateur non authentifié");

      const { data: totpData, error: totpError } = await supabase
        .from('user_totp_secrets')
        .select('backup_codes')
        .eq('user_id', userSession.session.user.id)
        .eq('is_verified', true)
        .single();

      if (totpError || !totpData) {
        throw new Error("Configuration 2FA non trouvée");
      }

      const backupCodes = totpData.backup_codes || [];
      const codeIndex = backupCodes.findIndex(code => code.toUpperCase() === backupCode.toUpperCase());

      if (codeIndex !== -1) {
        // Supprimer le code utilisé
        const updatedCodes = backupCodes.filter((_, index) => index !== codeIndex);
        
        await supabase
          .from('user_totp_secrets')
          .update({ backup_codes: updatedCodes })
          .eq('user_id', userSession.session.user.id);

        await logLoginAttempt(email, true);
        onVerificationSuccess();
        toast({
          title: "Connexion réussie",
          description: "Code de récupération validé"
        });
      } else {
        await logLoginAttempt(email, false);
        toast({
          variant: "destructive",
          title: "Code invalide",
          description: "Le code de récupération saisi n'est pas valide"
        });
      }
    } catch (error: any) {
      console.error('Error verifying backup code:', error);
      await logLoginAttempt(email, false);
      toast({
        variant: "destructive",
        title: "Erreur de vérification",
        description: error.message || "Impossible de vérifier le code de récupération"
      });
    } finally {
      setLoading(false);
    }
  };

  const logLoginAttempt = async (email: string, success: boolean) => {
    try {
      await supabase.rpc('log_login_attempt', {
        p_email: email,
        p_success: success,
        p_ip_address: await getClientIP(),
        p_user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error logging login attempt:', error);
    }
  };

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Authentification à double facteur
        </CardTitle>
        <CardDescription>
          Entrez votre code d'authentification pour continuer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="totp" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="totp">Code TOTP</TabsTrigger>
            <TabsTrigger value="backup">Code de récupération</TabsTrigger>
          </TabsList>
          
          <TabsContent value="totp" className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <InputOTP
                value={totpCode}
                onChange={setTotpCode}
                maxLength={6}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              <Alert>
                <AlertDescription>
                  Entrez le code à 6 chiffres de votre application d'authentification
                </AlertDescription>
              </Alert>

              <div className="flex gap-2 w-full">
                <Button variant="outline" onClick={onCancel} className="flex-1">
                  Annuler
                </Button>
                <Button 
                  onClick={verifyTOTP}
                  disabled={totpCode.length !== 6 || loading}
                  className="flex-1"
                >
                  {loading ? "Vérification..." : "Vérifier"}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="backup" className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <InputOTP
                  value={backupCode}
                  onChange={setBackupCode}
                  maxLength={8}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                    <InputOTPSlot index={6} />
                    <InputOTPSlot index={7} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Alert>
                <AlertDescription>
                  Entrez un de vos codes de récupération à 8 caractères
                </AlertDescription>
              </Alert>

              <div className="flex gap-2 w-full">
                <Button variant="outline" onClick={onCancel} className="flex-1">
                  Annuler
                </Button>
                <Button 
                  onClick={verifyBackupCode}
                  disabled={backupCode.length !== 8 || loading}
                  className="flex-1"
                >
                  {loading ? "Vérification..." : "Vérifier"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
