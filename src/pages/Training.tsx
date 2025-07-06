
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrainingSession } from "@/types/TrainingSession";

const Training = () => {
  const { data: trainingSessions = [], isLoading, error } = useQuery({
    queryKey: ['training-sessions'],
    queryFn: async () => {
      console.log('Fetching training sessions...');
      const { data, error } = await supabase
        .from('training_sessions')
        .select('*')
        .eq('is_published', true)
        .order('training_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching training sessions:', error);
        throw error;
      }
      
      console.log('Fetched training sessions:', data);
      return data as TrainingSession[];
    }
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main>
          <div className="madrid-container py-8">
            <h1 className="section-title mb-8">Séances d'Entrainement</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <CardHeader>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    console.error('Error loading training sessions:', error);
    return (
      <>
        <Navbar />
        <main>
          <div className="madrid-container py-8">
            <h1 className="section-title mb-8">Séances d'Entrainement</h1>
            <div className="text-center py-8">
              <p className="text-red-500">Erreur lors du chargement des séances d'entraînement</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        <div className="madrid-container py-8">
          <h1 className="section-title mb-8">Séances d'Entrainement</h1>
          
          {trainingSessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Aucune séance d'entraînement disponible pour le moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainingSessions.map((session) => (
                <Card key={session.id} className="overflow-hidden card-hover">
                  <div className="relative h-48 overflow-hidden">
                    {session.thumbnail_url ? (
                      <img 
                        src={session.thumbnail_url} 
                        alt={session.title}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <Video className="h-16 w-16 text-white opacity-50" />
                      </div>
                    )}
                    {session.duration && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                        <Video className="h-3 w-3" />
                        {session.duration}
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className="bg-madrid-blue text-white">
                        Entrainement
                      </Badge>
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(session.training_date)}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-2">{session.title}</CardTitle>
                    {session.description && (
                      <CardDescription className="line-clamp-2">{session.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardFooter>
                    <Button 
                      variant="secondary" 
                      className="w-full"
                      onClick={() => {
                        if (session.video_url) {
                          window.open(session.video_url, '_blank');
                        }
                      }}
                      disabled={!session.video_url}
                    >
                      <Video className="mr-2 h-4 w-4" /> 
                      {session.video_url ? 'Regarder la vidéo' : 'Vidéo non disponible'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Training;
