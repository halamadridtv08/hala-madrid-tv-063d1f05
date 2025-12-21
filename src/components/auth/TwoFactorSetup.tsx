
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, EyeOff, Copy, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

interface TwoFactorSetupProps {
  onSetupComplete: () => void;
}

export function TwoFactorSetup({ onSetupComplete }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'generate' | 'verify' | 'backup'>('generate');
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Générer un secret TOTP et un QR code
  useEffect(() => {
    if (step === 'generate') {
      generateTOTPSecret();
    }
  }, [step]);

  const generateTOTPSecret = async () => {
    try {
      // Générer un secret aléatoire de 32 caractères en base32
      const newSecret = generateRandomSecret();
      setSecret(newSecret);

      // Créer l'URI TOTP
      const totp = new OTPAuth.TOTP({
        issuer: "Hala Madrid TV",
        label: user?.email || "Admin",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: newSecret,
      });

      // Générer le QR code
      const qrCodeDataUrl = await QRCode.toDataURL(totp.toString());
      setQrCodeUrl(qrCodeDataUrl);

      // Générer les codes de récupération
      const codes = generateBackupCodes();
      setBackupCodes(codes);
    } catch (error) {
      console.error('Error generating TOTP secret:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer le secret 2FA"
      });
    }
  };

  const generateRandomSecret = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateBackupCodes = (): string[] => {
    const codes = [];
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  const verifyTOTPCode = () => {
    try {
      const totp = new OTPAuth.TOTP({
        issuer: "Hala Madrid TV",
        label: user?.email || "Admin",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: secret,
      });

      const isValid = totp.validate({ token: verificationCode, window: 1 }) !== null;
      
      if (isValid) {
        setStep('backup');
        toast({
          title: "Code vérifié",
          description: "Le code TOTP est valide"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Code invalide",
          description: "Le code saisi n'est pas valide"
        });
      }
    } catch (error) {
      console.error('Error verifying TOTP:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la vérification du code"
      });
    }
  };

  const saveTOTPSecret = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Sauvegarder le secret TOTP chiffré via la fonction SQL
      const { error: secretError } = await supabase.rpc('save_totp_secret', {
        p_user_id: user.id,
        p_secret: secret
      });

      if (secretError) throw secretError;

      // Sauvegarder les codes de récupération
      const { error: backupError } = await supabase.rpc('save_backup_codes', {
        p_user_id: user.id,
        p_codes: backupCodes
      });

      if (backupError) throw backupError;

      toast({
        title: "2FA activé",
        description: "L'authentification à double facteur a été configurée avec succès"
      });

      onSetupComplete();
    } catch (error: any) {
      console.error('Error saving TOTP secret:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder la configuration 2FA"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "Le texte a été copié dans le presse-papiers"
    });
  };

  const downloadBackupCodes = () => {
    const content = `Codes de récupération Hala Madrid TV
Générés le: ${new Date().toLocaleDateString('fr-FR')}
Email: ${user?.email}

${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

IMPORTANT: Conservez ces codes dans un endroit sûr. 
Ils vous permettront d'accéder à votre compte si vous perdez votre appareil d'authentification.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hala-madrid-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (step === 'generate') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configuration 2FA
          </CardTitle>
          <CardDescription>
            Scannez le QR code avec votre application d'authentification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {qrCodeUrl && (
            <div className="flex flex-col items-center space-y-4">
              <img src={qrCodeUrl} alt="QR Code 2FA" className="border rounded-lg" />
              
              <div className="w-full">
                <label className="text-sm font-medium">Clé secrète (si vous ne pouvez pas scanner)</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input 
                    type={showSecret ? "text" : "password"}
                    value={secret}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(secret)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  Utilisez Google Authenticator, Authy, ou toute autre application TOTP compatible.
                </AlertDescription>
              </Alert>

              <Button onClick={() => setStep('verify')} className="w-full">
                J'ai configuré l'application
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (step === 'verify') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Vérification du code</CardTitle>
          <CardDescription>
            Entrez le code à 6 chiffres généré par votre application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <InputOTP
              value={verificationCode}
              onChange={setVerificationCode}
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

            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={() => setStep('generate')} className="flex-1">
                Retour
              </Button>
              <Button 
                onClick={verifyTOTPCode} 
                disabled={verificationCode.length !== 6}
                className="flex-1"
              >
                Vérifier
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'backup') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Codes de récupération</CardTitle>
          <CardDescription>
            Conservez ces codes dans un endroit sûr. Ils vous permettront d'accéder à votre compte si vous perdez votre appareil.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((code, index) => (
              <Badge key={index} variant="outline" className="justify-center font-mono">
                {code}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadBackupCodes} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
            <Button 
              variant="outline" 
              onClick={() => copyToClipboard(backupCodes.join('\n'))}
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copier
            </Button>
          </div>

          <Alert>
            <AlertDescription>
              Ces codes ne seront plus affichés. Assurez-vous de les sauvegarder maintenant !
            </AlertDescription>
          </Alert>

          <Button onClick={saveTOTPSecret} disabled={loading} className="w-full">
            {loading ? "Sauvegarde..." : "Terminer la configuration"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
