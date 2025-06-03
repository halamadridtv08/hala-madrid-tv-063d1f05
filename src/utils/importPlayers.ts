
import { supabase } from "@/integrations/supabase/client";
import { realMadridPlayers } from "@/data/realMadridPlayers";
import { realMadridCoaches } from "@/data/realMadridCoaches";

export const importRealMadridPlayers = async () => {
  try {
    // Vérifier d'abord s'il y a déjà des joueurs
    const { data: existingPlayers } = await supabase
      .from('players')
      .select('id')
      .limit(1);

    if (existingPlayers && existingPlayers.length > 0) {
      console.log('Des joueurs existent déjà dans la base de données');
      return false;
    }

    // Préparer les données pour l'insertion
    const playersToInsert = realMadridPlayers.map(player => ({
      name: player.name,
      position: player.position,
      jersey_number: player.jerseyNumber,
      age: player.age,
      nationality: player.nationality,
      image_url: player.imageUrl,
      bio: player.bio,
      is_active: true,
      stats: {
        secondaryPosition: player.secondaryPosition
      }
    }));

    // Insérer tous les joueurs
    const { data, error } = await supabase
      .from('players')
      .insert(playersToInsert);

    if (error) {
      console.error('Erreur lors de l\'importation des joueurs:', error);
      return false;
    }

    console.log('Joueurs importés avec succès:', data);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'importation:', error);
    return false;
  }
};

export const importRealMadridCoaches = async () => {
  try {
    // Vérifier d'abord s'il y a déjà des entraîneurs
    const { data: existingCoaches } = await supabase
      .from('coaches')
      .select('id')
      .limit(1);

    if (existingCoaches && existingCoaches.length > 0) {
      console.log('Des entraîneurs existent déjà dans la base de données');
      return false;
    }

    // Préparer les données pour l'insertion
    const coachesToInsert = realMadridCoaches.map(coach => ({
      name: coach.name,
      role: coach.role,
      age: coach.age,
      nationality: coach.nationality,
      image_url: coach.imageUrl,
      bio: coach.bio,
      experience_years: coach.experienceYears,
      is_active: true
    }));

    // Insérer tous les entraîneurs
    const { data, error } = await supabase
      .from('coaches')
      .insert(coachesToInsert);

    if (error) {
      console.error('Erreur lors de l\'importation des entraîneurs:', error);
      return false;
    }

    console.log('Entraîneurs importés avec succès:', data);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'importation:', error);
    return false;
  }
};
