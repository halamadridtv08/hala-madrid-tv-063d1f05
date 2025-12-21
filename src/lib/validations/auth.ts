import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

// Liste statique de domaines d'emails temporaires courants (fallback)
const COMMON_DISPOSABLE_DOMAINS = [
  '10minutemail.com', '10minutemail.net', '10minutemail.org',
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.biz',
  'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'temp-mail.net',
  'mailinator.com', 'mailinator.net', 'mailinator.org',
  'throwaway.email', 'throwawaymail.com',
  'fakeinbox.com', 'fakemailgenerator.com',
  'yopmail.com', 'yopmail.fr', 'yopmail.net',
  'discard.email', 'discardmail.com',
  'trashmail.com', 'trashmail.net', 'trashmail.org',
  'getnada.com', 'nada.email',
  'maildrop.cc', 'mailnesia.com',
  'mohmal.com', 'tempail.com',
  'sharklasers.com', 'spam4.me',
  'grr.la', 'guerrillamailblock.com',
  'emailondeck.com', 'tempr.email',
  'tmpmail.org', 'tmpmail.net',
  'burnermail.io', 'minutemail.com',
  'emailfake.com', 'fakemail.net',
  'mailcatch.com', 'mailsac.com',
  'mytemp.email', 'tempinbox.com',
  'disposablemail.com', 'throwmail.com'
];

// Cache pour les domaines bloqués depuis Supabase
let cachedBlockedDomains: string[] | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fonction pour récupérer les domaines bloqués depuis Supabase
export const fetchBlockedDomains = async (): Promise<string[]> => {
  const now = Date.now();
  
  // Retourner le cache s'il est encore valide
  if (cachedBlockedDomains && now < cacheExpiry) {
    return cachedBlockedDomains;
  }
  
  try {
    const { data, error } = await supabase
      .from('blocked_email_domains')
      .select('domain')
      .eq('is_active', true);
    
    if (error) {
      console.error('Error fetching blocked domains:', error);
      return COMMON_DISPOSABLE_DOMAINS;
    }
    
    const domains = data?.map(d => d.domain.toLowerCase()) || [];
    
    // Combiner avec la liste statique
    const allDomains = [...new Set([...domains, ...COMMON_DISPOSABLE_DOMAINS])];
    
    // Mettre en cache
    cachedBlockedDomains = allDomains;
    cacheExpiry = now + CACHE_DURATION;
    
    return allDomains;
  } catch (error) {
    console.error('Error fetching blocked domains:', error);
    return COMMON_DISPOSABLE_DOMAINS;
  }
};

// Vérification synchrone (utilise la liste statique comme fallback)
export const isDisposableEmailSync = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  
  // Vérifier d'abord le cache, sinon la liste statique
  const domainsToCheck = cachedBlockedDomains || COMMON_DISPOSABLE_DOMAINS;
  return domainsToCheck.includes(domain);
};

// Vérification asynchrone complète (avec données Supabase)
export const isDisposableEmail = async (email: string): Promise<boolean> => {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  
  const blockedDomains = await fetchBlockedDomains();
  return blockedDomains.includes(domain);
};

// Email validation with strict rules
export const emailSchema = z
  .string()
  .min(1, "L'email est requis")
  .email("Format d'email invalide")
  .max(255, "L'email ne peut pas dépasser 255 caractères")
  .refine(
    (email) => !email.includes("<") && !email.includes(">") && !email.includes("'") && !email.includes('"'),
    "L'email contient des caractères non autorisés"
  )
  .refine(
    (email) => !isDisposableEmailSync(email),
    "Les adresses email temporaires ne sont pas autorisées. Veuillez utiliser une adresse email permanente."
  );

// Password validation with security requirements (12+ chars, special character)
export const passwordSchema = z
  .string()
  .min(12, "Le mot de passe doit contenir au moins 12 caractères")
  .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
  .refine(
    (password) => /[A-Z]/.test(password),
    "Le mot de passe doit contenir au moins une majuscule"
  )
  .refine(
    (password) => /[a-z]/.test(password),
    "Le mot de passe doit contenir au moins une minuscule"
  )
  .refine(
    (password) => /[0-9]/.test(password),
    "Le mot de passe doit contenir au moins un chiffre"
  )
  .refine(
    (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
    "Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*(),.?\":{}|<>)"
  );

// Login form schema (less strict password for existing users)
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis"),
});

// Sign up form schema (strict password requirements)
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Article form validation
export const articleSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(200, "Le titre ne peut pas dépasser 200 caractères")
    .refine(
      (title) => !/<script/i.test(title),
      "Contenu non autorisé détecté"
    ),
  description: z
    .string()
    .min(1, "La description est requise")
    .max(500, "La description ne peut pas dépasser 500 caractères"),
  content: z.string().min(1, "Le contenu est requis"),
  category: z.string().min(1, "La catégorie est requise"),
});

// Flash news validation
export const flashNewsSchema = z.object({
  content: z
    .string()
    .min(1, "Le contenu est requis")
    .max(280, "Le contenu ne peut pas dépasser 280 caractères")
    .refine(
      (content) => !/<script/i.test(content) && !/javascript:/i.test(content),
      "Contenu non autorisé détecté"
    ),
  author: z.string().min(1, "L'auteur est requis"),
  author_handle: z.string().min(1, "Le handle est requis"),
  category: z.string().min(1, "La catégorie est requise"),
});

// Comment validation
export const commentSchema = z.object({
  user_name: z
    .string()
    .min(1, "Le nom est requis")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .refine(
      (name) => !/<|>|&|"|'/.test(name),
      "Caractères non autorisés détectés"
    ),
  content: z
    .string()
    .min(1, "Le commentaire est requis")
    .max(1000, "Le commentaire ne peut pas dépasser 1000 caractères")
    .refine(
      (content) => !/<script/i.test(content) && !/javascript:/i.test(content),
      "Contenu non autorisé détecté"
    ),
  user_email: z.string().email("Email invalide").optional().or(z.literal("")),
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ArticleFormData = z.infer<typeof articleSchema>;
export type FlashNewsFormData = z.infer<typeof flashNewsSchema>;
export type CommentFormData = z.infer<typeof commentSchema>;
