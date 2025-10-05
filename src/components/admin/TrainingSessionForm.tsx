
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { TrainingSession } from "@/types/TrainingSession";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface TrainingSessionFormProps {
  session?: TrainingSession | null;
  onSuccess: (session: TrainingSession) => void;
  onCancel: () => void;
}

interface FormData {
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  duration: string;
  training_date: string;
  is_published: boolean;
}

export function TrainingSessionForm({ session, onSuccess, onCancel }: TrainingSessionFormProps) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: {
      title: session?.title || '',
      description: session?.description || '',
      thumbnail_url: session?.thumbnail_url || '',
      video_url: session?.video_url || '',
      duration: session?.duration || '',
      training_date: session?.training_date ? 
        new Date(session.training_date).toISOString().slice(0, 16) : '',
      is_published: session?.is_published || false,
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      const sessionData = {
        ...data,
        training_date: new Date(data.training_date).toISOString(),
      };

      let result;
      if (session) {
        result = await supabase
          .from('training_sessions')
          .update(sessionData)
          .eq('id', session.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('training_sessions')
          .insert(sessionData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast.success(
        session ? 'Séance modifiée avec succès' : 'Séance créée avec succès'
      );
      onSuccess(result.data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Titre *</Label>
        <Input
          id="title"
          {...register('title', { required: 'Le titre est requis' })}
        />
        {errors.title && (
          <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
        />
      </div>
      
      <div>
        <Label htmlFor="training_date">Date de l'entraînement *</Label>
        <Input
          id="training_date"
          type="datetime-local"
          {...register('training_date', { required: 'La date est requise' })}
        />
        {errors.training_date && (
          <p className="text-sm text-red-500 mt-1">{errors.training_date.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="duration">Durée</Label>
        <Input
          id="duration"
          placeholder="ex: 90 min"
          {...register('duration')}
        />
      </div>
      
      <div>
        <Label htmlFor="video_url">URL de la vidéo</Label>
        <Input
          id="video_url"
          placeholder="https://..."
          {...register('video_url')}
        />
      </div>
      
      <div>
        <Label htmlFor="thumbnail_url">URL de la miniature</Label>
        <Input
          id="thumbnail_url"
          placeholder="https://..."
          {...register('thumbnail_url')}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Controller
          name="is_published"
          control={control}
          render={({ field }) => (
            <Switch
              id="is_published"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="is_published">Publier</Label>
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
