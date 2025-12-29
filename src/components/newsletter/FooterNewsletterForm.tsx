import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';

export const FooterNewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      // Use secure server-side function with validation
      const { error } = await supabase.rpc('subscribe_to_newsletter', {
        p_email: email.trim(),
        p_subscription_type: 'weekly'
      });

      if (error) {
        // Handle specific error messages from the function
        if (error.message?.includes('ALREADY_SUBSCRIBED')) {
          toast.info('Vous êtes déjà inscrit à notre newsletter !');
        } else if (error.message?.includes('Format d\'email invalide')) {
          toast.error('Format d\'email invalide');
        } else if (error.message?.includes('domaine d\'email n\'est pas autorisé')) {
          toast.error('Ce type d\'email n\'est pas accepté');
        } else {
          throw error;
        }
      } else {
        setSubscribed(true);
        toast.success('Inscription réussie ! Bienvenue dans notre communauté.');
        setEmail('');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error("Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className="flex items-center gap-2 text-green-400">
        <CheckCircle className="w-5 h-5" />
        <span>Merci pour votre inscription !</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-gray-300 text-sm">
        Recevez les dernières actualités du Real Madrid directement dans votre boîte mail.
      </p>
      <div className="flex flex-col gap-2">
        <Input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
        />
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-madrid-gold text-black hover:bg-yellow-400 w-full"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              S'inscrire
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
