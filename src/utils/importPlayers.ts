
import { supabase } from "@/integrations/supabase/client";
import { realMadridPlayers } from "@/data/realMadridPlayers";
import { realMadridCoaches } from "@/data/realMadridCoaches";

export const importRealMadridPlayers = async (forceUpdate = false) => {
  try {
    console.log('Début de l\'importation des joueurs du Real Madrid...');
    
    // Si forceUpdate est false, vérifier s'il y a déjà des joueurs
    if (!forceUpdate) {
      const { data: existingPlayers } = await supabase
        .from('players')
        .select('id')
        .limit(1);

      if (existingPlayers && existingPlayers.length > 0) {
        console.log('Des joueurs existent déjà dans la base de données');
        return false;
      }
    }

    // Préparer les données pour l'insertion avec UPSERT
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

    console.log('Données des joueurs préparées:', playersToInsert);

    // Utiliser UPSERT pour insérer ou mettre à jour les joueurs
    const { data, error } = await supabase
      .from('players')
      .upsert(playersToInsert, { 
        onConflict: 'name',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error('Erreur lors de l\'importation des joueurs:', error);
      
      // Si l'UPSERT échoue à cause des conflits, essayer une insertion simple
      if (error.code === '23505') {
        console.log('Tentative d\'insertion individuelle...');
        
        for (const player of playersToInsert) {
          try {
            const { error: insertError } = await supabase
              .from('players')
              .insert([player]);
            
            if (insertError && insertError.code !== '23505') {
              console.error(`Erreur lors de l'insertion de ${player.name}:`, insertError);
            }
          } catch (individualError) {
            console.error(`Erreur individuelle pour ${player.name}:`, individualError);
          }
        }
        
        console.log('Importation terminée avec insertions individuelles');
        return true;
      }
      
      return false;
    }

    console.log('Joueurs importés avec succès:', data);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'importation:', error);
    return false;
  }
};

export const importRealMadridCoaches = async (forceUpdate = false) => {
  try {
    console.log('Début de l\'importation des entraîneurs du Real Madrid...');
    
    // Si forceUpdate est false, vérifier s'il y a déjà des entraîneurs
    if (!forceUpdate) {
      const { data: existingCoaches } = await supabase
        .from('coaches')
        .select('id')
        .limit(1);

      if (existingCoaches && existingCoaches.length > 0) {
        console.log('Des entraîneurs existent déjà dans la base de données');
        return false;
      }
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

    console.log('Données des entraîneurs préparées:', coachesToInsert);

    // Utiliser UPSERT pour insérer ou mettre à jour les entraîneurs
    const { data, error } = await supabase
      .from('coaches')
      .upsert(coachesToInsert, { 
        onConflict: 'name',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error('Erreur lors de l\'importation des entraîneurs:', error);
      
      // Si l'UPSERT échoue à cause des conflits, essayer une insertion simple
      if (error.code === '23505') {
        console.log('Tentative d\'insertion individuelle des entraîneurs...');
        
        for (const coach of coachesToInsert) {
          try {
            const { error: insertError } = await supabase
              .from('coaches')
              .insert([coach]);
            
            if (insertError && insertError.code !== '23505') {
              console.error(`Erreur lors de l'insertion de ${coach.name}:`, insertError);
            }
          } catch (individualError) {
            console.error(`Erreur individuelle pour ${coach.name}:`, individualError);
          }
        }
        
        console.log('Importation des entraîneurs terminée avec insertions individuelles');
        return true;
      }
      
      return false;
    }

    console.log('Entraîneurs importés avec succès:', data);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'importation:', error);
    return false;
  }
};

// Fonction pour forcer la réimportation de tous les données
export const forceImportAllData = async () => {
  try {
    console.log('Force l\'importation de toutes les données...');
    
    const [playersResult, coachesResult] = await Promise.all([
      importRealMadridPlayers(true),
      importRealMadridCoaches(true)
    ]);
    
    return {
      players: playersResult,
      coaches: coachesResult
    };
  } catch (error) {
    console.error('Erreur lors de l\'importation forcée:', error);
    return {
      players: false,
      coaches: false
    };
  }
};
