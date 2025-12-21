import { z } from "zod";

// Email validation with strict rules
export const emailSchema = z
  .string()
  .min(1, "L'email est requis")
  .email("Format d'email invalide")
  .max(255, "L'email ne peut pas dépasser 255 caractères")
  .refine(
    (email) => !email.includes("<") && !email.includes(">") && !email.includes("'") && !email.includes('"'),
    "L'email contient des caractères non autorisés"
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
