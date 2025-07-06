
import React from "react";
import { useForm } from "react-hook-form";
import { PressConference } from "@/types/PressConference";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface PressConferenceFormProps {
  conference?: PressConference | null;
  onSuccess: (conference: PressConference) => void;
  onCancel: () => void;
}

interface FormData {
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  duration: string;
  conference_date: string;
  is_published: boolean;
}

export function PressConferenceForm({ conference, onSuccess, onCancel }: PressConferenceFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: {
      title: conference?.title || '',
      description: conference?.description || '',
      thumbnail_url: conference?.thumbnail_url || '',
      video_url: conference?.video_url || '',
      duration: conference?.duration || '',
      conference_date: conference?.conference_date ? 
        new Date(conference.conference_date).toISOString().slice(0, 16) : '',
      is_published: conference?.is_published || false,
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      const conferenceData = {
        ...data,
        conference_date: new Date(data.conference_date).toISOString(),
      };

      let result;
      if (conference) {
        result = await supabase
          .from('press_conferences')
          .update(conferenceData)
          .eq('id', conference.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('press_conferences')
          .insert(conferenceData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast.success(
        conference ? 'Conférence modifiée avec succès' : 'Conférence créée avec succès'
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
        <Label htmlFor="conference_date">Date de la conférence *</Label>
        <Input
          id="conference_date"
          type="datetime-local"
          {...register('conference_date', { required: 'La date est requise' })}
        />
        {errors.conference_date && (
          <p className="text-sm text-red-500 mt-1">{errors.conference_date.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="duration">Durée</Label>
        <Input
          id="duration"
          placeholder="ex: 45 min"
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
        <Switch
          id="is_published"
          {...register('is_published')}
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
