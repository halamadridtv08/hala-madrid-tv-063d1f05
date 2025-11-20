import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  author: z.string().min(1, "L'auteur est requis"),
  author_handle: z.string().min(1, "Le handle est requis").regex(/^@/, "Doit commencer par @"),
  content: z.string().min(10, "Le contenu doit faire au moins 10 caractères"),
  category: z.enum(['transfer', 'injury', 'match', 'general']),
  verified: z.boolean().default(true),
  is_published: z.boolean().default(false),
  status: z.enum(['draft', 'pending', 'approved', 'published']).default('draft'),
  scheduled_at: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface FlashNewsFormProps {
  flashNews?: any;
  onSuccess?: () => void;
}

export const FlashNewsForm = ({ flashNews, onSuccess }: FlashNewsFormProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      author: flashNews?.author || "",
      author_handle: flashNews?.author_handle || "@",
      content: flashNews?.content || "",
      category: flashNews?.category || "general",
      verified: flashNews?.verified ?? true,
      is_published: flashNews?.is_published ?? false,
      status: flashNews?.status || "draft",
      scheduled_at: flashNews?.scheduled_at || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      if (flashNews) {
        const { error } = await supabase
          .from('flash_news')
          .update(values)
          .eq('id', flashNews.id);

        if (error) throw error;

        toast({
          title: "Info flash mise à jour",
          description: "L'info flash a été mise à jour avec succès.",
        });
      } else {
        const { error } = await supabase
          .from('flash_news')
          .insert([{
            author: values.author,
            author_handle: values.author_handle,
            content: values.content,
            category: values.category,
            verified: values.verified,
            is_published: values.is_published,
            status: values.status,
            scheduled_at: values.scheduled_at || null,
          }]);

        if (error) throw error;

        toast({
          title: "Info flash créée",
          description: "L'info flash a été créée avec succès.",
        });

        form.reset();
      }

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Auteur</FormLabel>
                <FormControl>
                  <Input placeholder="Fabrizio Romano" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="author_handle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Handle Twitter</FormLabel>
                <FormControl>
                  <Input placeholder="@FabrizioRomano" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenu</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="🚨 Dernières nouvelles du Real Madrid..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="transfer">Transfert</SelectItem>
                  <SelectItem value="injury">Blessure</SelectItem>
                  <SelectItem value="match">Match</SelectItem>
                  <SelectItem value="general">Général</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statut de modération</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvé</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scheduled_at"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Planifier la publication (optionnel)</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                  placeholder="Date et heure de publication"
                />
              </FormControl>
              <div className="text-sm text-muted-foreground">
                Laisser vide pour une publication immédiate
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="verified"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Vérifié</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Afficher le badge de vérification
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_published"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Publié</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Rendre visible au public
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : flashNews ? "Mettre à jour" : "Créer"}
        </Button>
      </form>
    </Form>
  );
};
