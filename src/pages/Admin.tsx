
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import PlayerTable from "@/components/admin/PlayerTable";
import CoachTable from "@/components/admin/CoachTable";
import PhotoTable from "@/components/admin/PhotoTable";
import MatchTable from "@/components/admin/MatchTable";
import { QuickStatsCard } from "@/components/admin/QuickStatsCard";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/Player";
import { Coach } from "@/types/Coach";
import { PhotoType } from "@/types/Photo";
import { Match } from "@/types/Match";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch players
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .order('name', { ascending: true });

      if (playersError) {
        console.error('Error fetching players:', playersError);
        toast.error("Erreur lors du chargement des joueurs");
      } else {
        setPlayers(playersData || []);
      }

      // Fetch coaches
      const { data: coachesData, error: coachesError } = await supabase
        .from('coaches')
        .select('*')
        .order('name', { ascending: true });

      if (coachesError) {
        console.error('Error fetching coaches:', coachesError);
        toast.error("Erreur lors du chargement des entraîneurs");
      } else {
        setCoaches(coachesData || []);
      }

      // Fetch photos
      const { data: photosData, error: photosError } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (photosError) {
        console.error('Error fetching photos:', photosError);
        toast.error("Erreur lors du chargement des photos");
      } else {
        setPhotos(photosData || []);
      }

      // Fetch matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: true });

      if (matchesError) {
        console.error('Error fetching matches:', matchesError);
        toast.error("Erreur lors du chargement des matchs");
      } else {
        setMatches(matchesData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-madrid-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement du panneau d'administration...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="bg-madrid-blue py-10">
          <div className="madrid-container">
            <Button 
              onClick={() => navigate('/')} 
              variant="outline" 
              className="mb-4 flex items-center gap-2 text-white border-white hover:bg-white hover:text-madrid-blue"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Button>
            <h1 className="text-4xl font-bold text-white mb-4">Administration</h1>
            <p className="text-blue-100">Gérez le contenu du site Real Madrid</p>
          </div>
        </div>

        <div className="madrid-container py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <QuickStatsCard
              title="Joueurs"
              value={players.filter(p => p.is_active).length}
              subtitle={`${players.length} total`}
              icon="users"
            />
            <QuickStatsCard
              title="Entraîneurs"
              value={coaches.filter(c => c.is_active).length}
              subtitle={`${coaches.length} total`}
              icon="user"
            />
            <QuickStatsCard
              title="Photos"
              value={photos.filter(p => p.is_published).length}
              subtitle={`${photos.length} total`}
              icon="image"
            />
            <QuickStatsCard
              title="Matchs"
              value={matches.filter(m => m.status === 'upcoming').length}
              subtitle={`${matches.length} total`}
              icon="calendar"
            />
          </div>

          <Tabs defaultValue="players" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="players">Joueurs</TabsTrigger>
              <TabsTrigger value="coaches">Entraîneurs</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="matches">Matchs</TabsTrigger>
            </TabsList>

            <TabsContent value="players" className="space-y-6">
              <PlayerTable players={players} setPlayers={setPlayers} />
            </TabsContent>

            <TabsContent value="coaches" className="space-y-6">
              <CoachTable coaches={coaches} setCoaches={setCoaches} />
            </TabsContent>

            <TabsContent value="photos" className="space-y-6">
              <PhotoTable photos={photos} setPhotos={setPhotos} />
            </TabsContent>

            <TabsContent value="matches" className="space-y-6">
              <MatchTable matches={matches} setMatches={setMatches} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Admin;
