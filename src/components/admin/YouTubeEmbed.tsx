
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Youtube, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface YouTubeEmbedProps {
  onSuccess: (url: string, videoId: string) => void;
  currentValue?: string;
}

export function YouTubeEmbed({ onSuccess, currentValue = "" }: YouTubeEmbedProps) {
  const [url, setUrl] = useState(currentValue);
  const [videoId, setVideoId] = useState<string | null>(
    currentValue ? extractVideoId(currentValue) : null
  );
  const { toast } = useToast();

  // Extraire l'ID de la vidéo YouTube à partir de l'URL
  function extractVideoId(youtubeUrl: string): string | null {
    if (!youtubeUrl) return null;
    
    // Support multiple YouTube URL formats
    const regExpList = [
      // Standard watch URLs
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
      // Short URLs
      /^.*(youtu.be\/)([^#\&\?]*).*/,
      // Playlist URLs (extracts video ID)
      /^.*(youtube.com\/watch\?v=)([^#\&\?]*)\&list=.*/
    ];

    for (const regExp of regExpList) {
      const match = youtubeUrl.match(regExp);
      if (match && match[2].length === 11) {
        return match[2];
      }
    }
    
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const extractedId = extractVideoId(url);
    
    if (!extractedId) {
      toast({
        title: "URL invalide",
        description: "Veuillez saisir une URL YouTube valide",
        variant: "destructive"
      });
      return;
    }
    
    setVideoId(extractedId);
    onSuccess(url, extractedId);
    
    toast({
      title: "Vidéo intégrée",
      description: "La vidéo YouTube a été ajoutée avec succès."
    });
  };

  const clearVideo = () => {
    setUrl("");
    setVideoId(null);
    onSuccess("", "");
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1"
          />
          <Button type="submit" variant="outline" className="flex items-center gap-2">
            <Youtube className="w-4 h-4" />
            Intégrer
          </Button>
        </div>
      </form>
      
      {videoId && (
        <div className="mt-2 border rounded-md p-2 bg-muted/20 relative">
          <div className="flex items-center gap-2 mb-2">
            <Youtube className="w-6 h-6 text-red-600" />
            <span className="text-sm font-medium">Aperçu YouTube</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto h-6 w-6 rounded-full p-0 hover:bg-red-100"
              onClick={clearVideo}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-md"
            ></iframe>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            <p>ID de la vidéo: <span className="font-mono bg-gray-100 px-1 rounded">{videoId}</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
