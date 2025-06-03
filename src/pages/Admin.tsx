import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminMenuBar } from "@/components/layout/AdminMenuBar";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { importRealMadridPlayers } from "@/utils/importPlayers";
import { MoreHorizontal, Plus, Eye, Pencil, Trash2, Image, Video, Camera, Users, Calendar, FileText, Settings, Download } from "lucide-react";

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string | null;
  category: string;
  published_at: string;
  is_published: boolean;
  read_time: string | null;
  featured: boolean;
}

interface Player {
  id: string;
  name: string;
  position: string;
  jersey_number: number | null;
  age: number | null;
  nationality: string | null;
  image_url: string | null;
  bio: string | null;
  is_active: boolean;
  stats?: {
    secondaryPosition?: string | null;
  };
}

interface Coach {
  id: string;
  name: string;
  role: string;
  age: number | null;
  nationality: string | null;
  image_url: string | null;
  bio: string | null;
  experience_years: number | null;
  is_active: boolean;
}

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  match_date: string;
  venue: string | null;
  competition: string | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
}

interface VideoItem {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: string | null;
  is_published: boolean;
  published_at: string | null;
}

interface Photo {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string | null;
  photographer: string | null;
  is_published: boolean;
  published_at: string | null;
}

const Admin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabFromUrl = searchParams.get("tab") || "articles";
  const typeFromUrl = searchParams.get("type") || "article";
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("match");
  const [readTime, setReadTime] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [currentTab, setCurrentTab] = useState(tabFromUrl === "create" ? "create" : tabFromUrl);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form states spécifiques pour les différents types
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [secondaryPosition, setSecondaryPosition] = useState("");
  const [jerseyNumber, setJerseyNumber] = useState("");
  const [age, setAge] = useState("");
  const [nationality, setNationality] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [venue, setVenue] = useState("");
  const [competition, setCompetition] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [photographer, setPhotographer] = useState("");

  // Mettre à jour les onglets lorsque l'URL change
  useEffect(() => {
    if (tabFromUrl === "create") {
      setCurrentTab("create");
      
      // Configurer le formulaire selon le type
      if (typeFromUrl === "video") {
        setCategory("video");
      } else if (typeFromUrl === "photo") {
        setCategory("photo");
      } else if (typeFromUrl === "player") {
        setPosition("attaquant");
        setSecondaryPosition("");
      } else if (typeFromUrl === "coach") {
        setRole("Entraîneur principal");
      } else if (typeFromUrl === "match") {
        setHomeTeam("Real Madrid");
      }
    } else {
      setCurrentTab(tabFromUrl || "articles");
    }
  }, [tabFromUrl, typeFromUrl]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchArticles(),
        fetchPlayers(),
        fetchCoaches(),
        fetchMatches(),
        fetchVideos(),
        fetchPhotos()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false });
    
    if (error) throw error;
    setArticles(data || []);
  };

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('jersey_number', { ascending: true });
    
    if (error) throw error;
    setPlayers(data || []);
  };

  const fetchCoaches = async () => {
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    setCoaches(data || []);
  };

  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: false });
    
    if (error) throw error;
    setMatches(data || []);
  };

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('published_at', { ascending: false });
    
    if (error) throw error;
    setVideos(data || []);
  };

  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('published_at', { ascending: false });
    
    if (error) throw error;
    setPhotos(data || []);
  };

  const handleImportPlayers = async () => {
    try {
      const imported = await importRealMadridPlayers();
      if (imported) {
        toast({
          title: "Joueurs importés",
          description: "L'effectif du Real Madrid a été importé avec succès"
        });
        await fetchPlayers();
      } else {
        toast({
          title: "Import annulé",
          description: "Des joueurs existent déjà dans la base de données"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de l'importation des joueurs"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let response;
      
      // Déterminer le type de contenu à créer basé sur la catégorie ou le type
      const contentType = typeFromUrl || category;
      
      if (contentType === "player") {
        const playerData = {
          name,
          position,
          jersey_number: jerseyNumber ? parseInt(jerseyNumber) : null,
          age: age ? parseInt(age) : null,
          nationality: nationality || null,
          image_url: imageUrl || null,
          bio: bio || null,
          is_active: isPublished,
          stats: {
            secondaryPosition: secondaryPosition || null
          }
        };
        
        if (editingItem) {
          response = await supabase
            .from('players')
            .update(playerData)
            .eq('id', editingItem.id);
        } else {
          response = await supabase
            .from('players')
            .insert([playerData]);
        }
        
        if (response.error) throw response.error;
        await fetchPlayers();
        navigate("/admin?tab=players");
        
      } else if (contentType === "coach") {
        const coachData = {
          name,
          role,
          age: age ? parseInt(age) : null,
          nationality: nationality || null,
          image_url: imageUrl || null,
          bio: bio || null,
          experience_years: experienceYears ? parseInt(experienceYears) : null,
          is_active: isPublished
        };
        
        if (editingItem) {
          response = await supabase
            .from('coaches')
            .update(coachData)
            .eq('id', editingItem.id);
        } else {
          response = await supabase
            .from('coaches')
            .insert([coachData]);
        }
        
        if (response.error) throw response.error;
        await fetchCoaches();
        navigate("/admin?tab=coaches");
        
      } else if (contentType === "match") {
        const matchData = {
          home_team: homeTeam,
          away_team: awayTeam,
          match_date: matchDate,
          venue: venue || null,
          competition: competition || null,
          status: isPublished ? 'upcoming' : 'draft'
        };
        
        if (editingItem) {
          response = await supabase
            .from('matches')
            .update(matchData)
            .eq('id', editingItem.id);
        } else {
          response = await supabase
            .from('matches')
            .insert([matchData]);
        }
        
        if (response.error) throw response.error;
        await fetchMatches();
        navigate("/admin?tab=matches");
        
      } else if (contentType === "video") {
        const videoData = {
          title,
          description: description || null,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl || imageUrl || null,
          category: category || null,
          is_published: isPublished
        };
        
        if (editingItem) {
          response = await supabase
            .from('videos')
            .update(videoData)
            .eq('id', editingItem.id);
        } else {
          response = await supabase
            .from('videos')
            .insert([videoData]);
        }
        
        if (response.error) throw response.error;
        await fetchVideos();
        navigate("/admin?tab=videos");
        
      } else if (contentType === "photo") {
        const photoData = {
          title,
          description: description || null,
          image_url: imageUrl,
          category: category || null,
          photographer: photographer || null,
          is_published: isPublished
        };
        
        if (editingItem) {
          response = await supabase
            .from('photos')
            .update(photoData)
            .eq('id', editingItem.id);
        } else {
          response = await supabase
            .from('photos')
            .insert([photoData]);
        }
        
        if (response.error) throw response.error;
        await fetchPhotos();
        navigate("/admin?tab=photos");
        
      } else {
        // Article par défaut
        const articleData = {
          title,
          description,
          content,
          image_url: imageUrl || null,
          category,
          read_time: readTime || null,
          is_published: isPublished,
          featured: isFeatured,
          author_id: user?.id
        };
        
        if (editingItem) {
          response = await supabase
            .from('articles')
            .update(articleData)
            .eq('id', editingItem.id);
        } else {
          response = await supabase
            .from('articles')
            .insert([articleData]);
        }
        
        if (response.error) throw response.error;
        await fetchArticles();
        navigate("/admin?tab=articles");
      }
      
      toast({
        title: editingItem ? "Contenu mis à jour" : "Contenu créé",
        description: editingItem ? "Le contenu a été mis à jour avec succès" : "Le contenu a été créé avec succès"
      });
      
      resetForm();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue"
      });
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setContent("");
    setImageUrl("");
    setCategory("match");
    setReadTime("");
    setIsPublished(false);
    setIsFeatured(false);
    setName("");
    setPosition("");
    setSecondaryPosition("");
    setJerseyNumber("");
    setAge("");
    setNationality("");
    setBio("");
    setRole("");
    setExperienceYears("");
    setHomeTeam("");
    setAwayTeam("");
    setMatchDate("");
    setVenue("");
    setCompetition("");
    setVideoUrl("");
    setThumbnailUrl("");
    setPhotographer("");
    setEditingItem(null);
  };

  const handleEdit = (item: any, type: string) => {
    if (type === "article") {
      setTitle(item.title);
      setDescription(item.description);
      setContent(item.content);
      setImageUrl(item.image_url || "");
      setCategory(item.category);
      setReadTime(item.read_time || "");
      setIsPublished(item.is_published);
      setIsFeatured(item.featured);
    } else if (type === "player") {
      setName(item.name);
      setPosition(item.position);
      setSecondaryPosition(item.stats?.secondaryPosition || "");
      setJerseyNumber(item.jersey_number?.toString() || "");
      setAge(item.age?.toString() || "");
      setNationality(item.nationality || "");
      setImageUrl(item.image_url || "");
      setBio(item.bio || "");
      setIsPublished(item.is_active);
    } else if (type === "coach") {
      setName(item.name);
      setRole(item.role);
      setAge(item.age?.toString() || "");
      setNationality(item.nationality || "");
      setImageUrl(item.image_url || "");
      setBio(item.bio || "");
      setExperienceYears(item.experience_years?.toString() || "");
      setIsPublished(item.is_active);
    } else if (type === "match") {
      setHomeTeam(item.home_team);
      setAwayTeam(item.away_team);
      setMatchDate(item.match_date);
      setVenue(item.venue || "");
      setCompetition(item.competition || "");
      setIsPublished(item.status === 'upcoming');
    } else if (type === "video") {
      setTitle(item.title);
      setDescription(item.description || "");
      setVideoUrl(item.video_url);
      setThumbnailUrl(item.thumbnail_url || "");
      setCategory(item.category || "");
      setIsPublished(item.is_published);
    } else if (type === "photo") {
      setTitle(item.title);
      setDescription(item.description || "");
      setImageUrl(item.image_url);
      setCategory(item.category || "");
      setPhotographer(item.photographer || "");
      setIsPublished(item.is_published);
    }
    
    setEditingItem(item);
    navigate(`/admin?tab=create&type=${type}`);
  };

  const handleDelete = async (id: string, type: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) return;
    
    try {
      let tableName: string;
      
      // Mapper explicitement le type vers le nom de table correct
      switch (type) {
        case "article":
          tableName = "articles";
          break;
        case "player":
          tableName = "players";
          break;
        case "coach":
          tableName = "coaches";
          break;
        case "match":
          tableName = "matches";
          break;
        case "video":
          tableName = "videos";
          break;
        case "photo":
          tableName = "photos";
          break;
        default:
          throw new Error(`Type non supporté: ${type}`);
      }

      const { error } = await supabase
        .from(tableName as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Élément supprimé",
        description: "L'élément a été supprimé avec succès"
      });
      
      // Actualiser les données appropriées
      if (type === "article") await fetchArticles();
      else if (type === "player") await fetchPlayers();
      else if (type === "coach") await fetchCoaches();
      else if (type === "match") await fetchMatches();
      else if (type === "video") await fetchVideos();
      else if (type === "photo") await fetchPhotos();
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleImageUploadSuccess = (url: string) => {
    setImageUrl(url);
    toast({
      title: "Image ajoutée",
      description: "L'image a été ajoutée avec succès."
    });
  };

  const renderCreateForm = () => {
    const contentType = typeFromUrl || category;
    
    if (contentType === "player") {
      return (
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="name">Nom du joueur*</label>
            <Input 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom complet du joueur"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="position">Position principale*</label>
              <Select value={position} onValueChange={setPosition} required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gardien">Gardien</SelectItem>
                  <SelectItem value="défenseur">Défenseur</SelectItem>
                  <SelectItem value="milieu">Milieu</SelectItem>
                  <SelectItem value="attaquant">Attaquant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="secondary_position">Position secondaire</label>
              <Select value={secondaryPosition} onValueChange={setSecondaryPosition}>
                <SelectTrigger>
                  <SelectValue placeholder="Position secondaire (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucune</SelectItem>
                  <SelectItem value="défenseur central">Défenseur central</SelectItem>
                  <SelectItem value="défenseur latéral gauche">Défenseur latéral gauche</SelectItem>
                  <SelectItem value="défenseur latéral droite">Défenseur latéral droite</SelectItem>
                  <SelectItem value="milieu défensif">Milieu défensif</SelectItem>
                  <SelectItem value="milieu de terrain">Milieu de terrain</SelectItem>
                  <SelectItem value="milieu offensif">Milieu offensif</SelectItem>
                  <SelectItem value="ailier gauche">Ailier gauche</SelectItem>
                  <SelectItem value="ailier droit">Ailier droit</SelectItem>
                  <SelectItem value="attaquant">Attaquant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="jersey_number">Numéro de maillot</label>
              <Input 
                id="jersey_number" 
                type="number"
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(e.target.value)}
                placeholder="Ex: 10"
                min="1"
                max="99"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="age">Âge</label>
              <Input 
                id="age" 
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Ex: 25"
                min="16"
                max="45"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="nationality">Nationalité</label>
            <Input 
              id="nationality" 
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              placeholder="Ex: Espagne"
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="bio">Biographie</label>
            <Textarea
              id="bio" 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Biographie du joueur"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="image_url">Photo du joueur</label>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input 
                  id="image_url" 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="w-full md:w-72">
                <MediaUploader
                  onSuccess={handleImageUploadSuccess}
                  acceptTypes="image/*"
                  buttonText="Télécharger une photo"
                  folderPath="players"
                />
              </div>
            </div>
            {imageUrl && (
              <div className="mt-2">
                <img src={imageUrl} alt="Aperçu" className="max-h-40 rounded-md object-contain" />
              </div>
            )}
          </div>
          
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isPublished}
                onChange={() => setIsPublished(!isPublished)}
                className="w-4 h-4"
              />
              Joueur actif
            </label>
          </div>
        </div>
      );
    }
    
    if (contentType === "coach") {
      return (
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="name">Nom de l'entraîneur*</label>
            <Input 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom complet de l'entraîneur"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="role">Rôle*</label>
            <Select value={role} onValueChange={setRole} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Entraîneur principal">Entraîneur principal</SelectItem>
                <SelectItem value="Entraîneur adjoint">Entraîneur adjoint</SelectItem>
                <SelectItem value="Entraîneur des gardiens">Entraîneur des gardiens</SelectItem>
                <SelectItem value="Préparateur physique">Préparateur physique</SelectItem>
                <SelectItem value="Analyste vidéo">Analyste vidéo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <label htmlFor="age">Âge</label>
              <Input 
                id="age" 
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Ex: 45"
                min="25"
                max="80"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="nationality">Nationalité</label>
              <Input 
                id="nationality" 
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="Ex: Espagne"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="experience">Années d'expérience</label>
              <Input 
                id="experience" 
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                placeholder="Ex: 15"
                min="0"
                max="50"
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="bio">Biographie</label>
            <Textarea
              id="bio" 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Biographie de l'entraîneur"
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="image_url">Photo de l'entraîneur</label>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input 
                  id="image_url" 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="w-full md:w-72">
                <MediaUploader
                  onSuccess={handleImageUploadSuccess}
                  acceptTypes="image/*"
                  buttonText="Télécharger une photo"
                  folderPath="coaches"
                />
              </div>
            </div>
            {imageUrl && (
              <div className="mt-2">
                <img src={imageUrl} alt="Aperçu" className="max-h-40 rounded-md object-contain" />
              </div>
            )}
          </div>
          
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isPublished}
                onChange={() => setIsPublished(!isPublished)}
                className="w-4 h-4"
              />
              Staff actif
            </label>
          </div>
        </div>
      );
    }
    
    // Formulaire d'article par défaut pour les autres types
    return (
      <div className="grid gap-4">
        <div className="grid gap-2">
          <label htmlFor="title">Titre*</label>
          <Input 
            id="title" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du contenu"
            required
          />
        </div>
        
        <div className="grid gap-2">
          <label htmlFor="description">Description*</label>
          <Input
            id="description" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brève description"
            required
          />
        </div>
        
        {contentType === "video" && (
          <div className="grid gap-2">
            <label htmlFor="video_url">URL de la vidéo*</label>
            <Input
              id="video_url" 
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              required
            />
          </div>
        )}
        
        {(contentType === "article" || contentType === "match") && (
          <div className="grid gap-2">
            <label htmlFor="content">Contenu*</label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Contenu complet"
            />
          </div>
        )}
        
        <div className="grid gap-2">
          <label htmlFor="image_url">Image principale</label>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input 
                id="image_url" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="w-full md:w-72">
              <MediaUploader
                onSuccess={handleImageUploadSuccess}
                acceptTypes="image/*"
                buttonText="Télécharger une image"
                folderPath="thumbnails"
              />
            </div>
          </div>
          {imageUrl && (
            <div className="mt-2">
              <img src={imageUrl} alt="Aperçu" className="max-h-40 rounded-md object-contain" />
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <label htmlFor="category">Catégorie*</label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="match">Match</SelectItem>
                <SelectItem value="joueur">Joueur</SelectItem>
                <SelectItem value="conférence">Conférence</SelectItem>
                <SelectItem value="mercato">Mercato</SelectItem>
                <SelectItem value="hommage">Hommage</SelectItem>
                <SelectItem value="formation">Formation</SelectItem>
                <SelectItem value="video">Vidéo</SelectItem>
                <SelectItem value="photo">Photo</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="read_time">Temps de lecture</label>
            <Input 
              id="read_time" 
              value={readTime}
              onChange={(e) => setReadTime(e.target.value)}
              placeholder="3 min"
            />
          </div>
          
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isPublished}
                onChange={() => setIsPublished(!isPublished)}
                className="w-4 h-4"
              />
              Publier
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isFeatured}
                onChange={() => setIsFeatured(!isFeatured)}
                className="w-4 h-4"
              />
              À la une
            </label>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="madrid-container py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Tableau de bord administrateur</h1>
          </div>
          
          <AdminMenuBar />
          
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="create">Créer / Modifier</TabsTrigger>
              <TabsTrigger value="videos">Vidéos</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="players">Joueurs</TabsTrigger>
              <TabsTrigger value="coaches">Entraîneurs</TabsTrigger>
              <TabsTrigger value="matches">Matchs</TabsTrigger>
              <TabsTrigger value="results">Résultats</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
              <TabsTrigger value="featured">À la une</TabsTrigger>
            </TabsList>
            
            <TabsContent value="articles">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Gérer les articles</CardTitle>
                    <Button onClick={() => {
                      resetForm();
                      navigate("/admin?tab=create&type=article");
                    }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nouvel article
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Date de publication</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {articles.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            {loading ? "Chargement..." : "Aucun article trouvé"}
                          </TableCell>
                        </TableRow>
                      )}
                      {articles.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell className="font-medium">{article.title}</TableCell>
                          <TableCell>
                            <Badge className="capitalize">{article.category}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(article.published_at)}</TableCell>
                          <TableCell>
                            <Badge variant={article.is_published ? "default" : "outline"}>
                              {article.is_published ? "Publié" : "Brouillon"}
                            </Badge>
                            {article.featured && (
                              <Badge variant="secondary" className="ml-2">À la une</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(article, "article")}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(article.id, "article")} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingItem ? "Modifier" : "Créer"} {
                      typeFromUrl === "player" ? "un joueur" :
                      typeFromUrl === "coach" ? "un entraîneur" :
                      typeFromUrl === "match" ? "un match" :
                      typeFromUrl === "video" ? "une vidéo" :
                      typeFromUrl === "photo" ? "une photo" :
                      "un article"
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {renderCreateForm()}
                    
                    <div className="flex gap-2 justify-end">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          resetForm();
                          navigate("/admin");
                        }}
                      >
                        Annuler
                      </Button>
                      <Button type="submit">
                        {editingItem ? "Mettre à jour" : "Créer"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="players">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Gestion des joueurs</CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={handleImportPlayers}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Importer l'effectif RM
                      </Button>
                      <Button onClick={() => {
                        resetForm();
                        navigate("/admin?tab=create&type=player");
                      }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un joueur
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Position secondaire</TableHead>
                        <TableHead>Numéro</TableHead>
                        <TableHead>Nationalité</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {players.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            {loading ? "Chargement..." : "Aucun joueur trouvé"}
                          </TableCell>
                        </TableRow>
                      )}
                      {players.map((player) => (
                        <TableRow key={player.id}>
                          <TableCell className="font-medium">{player.name}</TableCell>
                          <TableCell>
                            <Badge className="capitalize">{player.position}</Badge>
                          </TableCell>
                          <TableCell>
                            {player.stats?.secondaryPosition ? (
                              <Badge variant="outline" className="capitalize">
                                {player.stats.secondaryPosition}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>{player.jersey_number || "-"}</TableCell>
                          <TableCell>{player.nationality || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={player.is_active ? "default" : "outline"}>
                              {player.is_active ? "Actif" : "Inactif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(player, "player")}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(player.id, "player")} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="coaches">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Gestion des entraîneurs</CardTitle>
                    <Button onClick={() => {
                      resetForm();
                      navigate("/admin?tab=create&type=coach");
                    }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter un entraîneur
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Expérience</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coaches.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            {loading ? "Chargement..." : "Aucun entraîneur trouvé"}
                          </TableCell>
                        </TableRow>
                      )}
                      {coaches.map((coach) => (
                        <TableRow key={coach.id}>
                          <TableCell className="font-medium">{coach.name}</TableCell>
                          <TableCell>{coach.role}</TableCell>
                          <TableCell>{coach.experience_years ? `${coach.experience_years} ans` : "-"}</TableCell>
                          <TableCell>
                            <Badge variant={coach.is_active ? "default" : "outline"}>
                              {coach.is_active ? "Actif" : "Inactif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(coach, "coach")}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(coach.id, "coach")} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="videos">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Gestion des vidéos</CardTitle>
                    <Button onClick={() => {
                      resetForm();
                      navigate("/admin?tab=create&type=video");
                    }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter une vidéo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {videos.length === 0 ? (
                    <div className="text-center py-8">
                      <Video className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-lg font-medium">Aucune vidéo</h3>
                      <p className="mt-1 text-gray-500">Commencez par ajouter votre première vidéo</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {videos.map((video) => (
                        <Card key={video.id}>
                          <CardContent className="p-4">
                            <h3 className="font-medium mb-2">{video.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{video.description}</p>
                            <Badge variant={video.is_published ? "default" : "outline"}>
                              {video.is_published ? "Publié" : "Brouillon"}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="photos">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Gestion des photos</CardTitle>
                    <Button onClick={() => {
                      resetForm();
                      navigate("/admin?tab=create&type=photo");
                    }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter une photo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {photos.length === 0 ? (
                    <div className="text-center py-8">
                      <Camera className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-lg font-medium">Aucune photo</h3>
                      <p className="mt-1 text-gray-500">Commencez par ajouter votre première photo</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {photos.map((photo) => (
                        <Card key={photo.id}>
                          <CardContent className="p-4">
                            {photo.image_url && (
                              <img src={photo.image_url} alt={photo.title} className="w-full h-32 object-cover rounded mb-2" />
                            )}
                            <h3 className="font-medium mb-2">{photo.title}</h3>
                            <Badge variant={photo.is_published ? "default" : "outline"}>
                              {photo.is_published ? "Publié" : "Brouillon"}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="matches">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Gestion des matchs</CardTitle>
                    <Button onClick={() => {
                      resetForm();
                      navigate("/admin?tab=create&type=match");
                    }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter un match
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Match</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Compétition</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matches.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            {loading ? "Chargement..." : "Aucun match trouvé"}
                          </TableCell>
                        </TableRow>
                      )}
                      {matches.map((match) => (
                        <TableRow key={match.id}>
                          <TableCell className="font-medium">
                            {match.home_team} vs {match.away_team}
                          </TableCell>
                          <TableCell>{formatDate(match.match_date)}</TableCell>
                          <TableCell>{match.competition || "-"}</TableCell>
                          <TableCell>
                            <Badge className="capitalize">{match.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(match, "match")}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(match.id, "match")} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results">
              <Card>
                <CardHeader>
                  <CardTitle>Résultats des matchs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium">Résultats</h3>
                    <p className="mt-1 text-gray-500">Gérez les résultats des matchs passés</p>
                    <Button onClick={() => navigate("/matches")} className="mt-4">
                      <Calendar className="mr-2 h-4 w-4" />
                      Voir les résultats
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres du site</CardTitle>
                  <CardDescription>
                    Configurez les paramètres généraux de votre site.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="site_name">Nom du site</label>
                        <Input 
                          id="site_name" 
                          defaultValue="Hala Madrid TV"
                          placeholder="Nom de votre site"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="site_description">Description</label>
                        <Input
                          id="site_description" 
                          defaultValue="Site officiel du Real Madrid"
                          placeholder="Description de votre site"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="contact_email">Email de contact</label>
                        <Input
                          id="contact_email" 
                          type="email"
                          placeholder="contact@example.com"
                        />
                      </div>
                    </div>
                    <Button>
                      <Settings className="mr-2 h-4 w-4" />
                      Sauvegarder les paramètres
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="featured">
              <Card>
                <CardHeader>
                  <CardTitle>Contenu à la une</CardTitle>
                  <CardDescription>
                    Gérez le contenu mis en avant sur la page d'accueil.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium">Contenu à la une</h3>
                    <p className="mt-1 text-gray-500">Sélectionnez les articles et contenus à mettre en avant</p>
                    <Button onClick={() => navigate("/admin?tab=articles")} className="mt-4">
                      <FileText className="mr-2 h-4 w-4" />
                      Gérer les articles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  );
};

export default Admin;
