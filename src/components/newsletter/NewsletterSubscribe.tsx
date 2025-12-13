import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export const NewsletterSubscribe = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [subscriptionType, setSubscriptionType] = useState('weekly');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const confirmationToken = crypto.randomUUID();
      
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email,
          name: name || null,
          subscription_type: subscriptionType,
          confirmation_token: confirmationToken,
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: t('newsletter.alreadySubscribed'),
            description: t('newsletter.alreadySubscribedDesc'),
            variant: 'destructive',
          });
        } else {
          throw error;
        }
      } else {
        setSuccess(true);
        toast({
          title: t('newsletter.success'),
          description: t('newsletter.successDesc'),
        });
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: t('newsletter.error'),
        description: t('newsletter.errorDesc'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-xl font-bold text-green-600 mb-2">{t('newsletter.subscribed')}</h3>
          <p className="text-muted-foreground">{t('newsletter.subscribedDesc')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          {t('newsletter.title')}
        </CardTitle>
        <CardDescription>{t('newsletter.description')}</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('newsletter.email')} *</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">{t('newsletter.name')}</Label>
            <Input
              id="name"
              type="text"
              placeholder="Votre prénom"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>{t('newsletter.frequency')}</Label>
            <RadioGroup
              value={subscriptionType}
              onValueChange={setSubscriptionType}
              className="grid gap-2"
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily" className="flex-1 cursor-pointer">
                  <span className="font-medium">{t('newsletter.daily')}</span>
                  <p className="text-xs text-muted-foreground">{t('newsletter.dailyDesc')}</p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly" className="flex-1 cursor-pointer">
                  <span className="font-medium">{t('newsletter.weekly')}</span>
                  <p className="text-xs text-muted-foreground">{t('newsletter.weeklyDesc')}</p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('newsletter.subscribing')}
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                {t('newsletter.subscribe')}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
