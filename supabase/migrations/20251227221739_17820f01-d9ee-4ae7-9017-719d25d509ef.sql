-- Ajouter la colonne category à la table youtube_videos
ALTER TABLE public.youtube_videos 
ADD COLUMN category text DEFAULT 'YouTube';

-- Créer un index pour améliorer les performances de filtrage par catégorie
CREATE INDEX idx_youtube_videos_category ON public.youtube_videos(category);