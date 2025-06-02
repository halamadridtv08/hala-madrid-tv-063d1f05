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
import { MoreHorizontal, Plus, Eye, Pencil, Trash2, Image, Video, Camera, Users, Calendar, FileText, Settings } from "lucide-react";

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

const Admin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabFromUrl = searchParams.get("tab") || "articles";
  const typeFromUrl = searchParams.get("type") || "article";
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // New article form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("match");
  const [readTime, setReadTime] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [currentTab, setCurrentTab] = useState(tabFromUrl === "create" ? "create" : tabFromUrl);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  
  // Mettre à jour les onglets lorsque l'URL change
  useEffect(() => {
    if (tabFromUrl === "create") {
      setCurrentTab("create");
      
      // Si type est spécifié, configurer le formulaire pour ce type
      if (typeFromUrl === "video") {
        setCategory("video");
      } else if (typeFromUrl === "photo") {
        setCategory("photo");
      }
    } else {
      setCurrentTab(tabFromUrl || "articles");
    }
  }, [tabFromUrl, typeFromUrl]);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de récupérer les articles"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
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
      
      let response;
      
      if (editingArticle) {
        response = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', editingArticle.id);
      } else {
        response = await supabase
          .from('articles')
          .insert([articleData]);
      }
      
      if (response.error) throw response.error;
      
      toast({
        title: editingArticle ? "Article mis à jour" : "Article créé",
        description: editingArticle ? "L'article a été mis à jour avec succès" : "L'article a été créé avec succès"
      });
      
      resetForm();
      fetchArticles();
      navigate("/admin?tab=articles");
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
    setEditingArticle(null);
  };

  const handleEdit = (article: Article) => {
    setTitle(article.title);
    setDescription(article.description);
    setContent(article.content);
    setImageUrl(article.image_url || "");
    setCategory(article.category);
    setReadTime(article.read_time || "");
    setIsPublished(article.is_published);
    setIsFeatured(article.featured);
    setEditingArticle(article);
    navigate("/admin?tab=create");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;
    
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Article supprimé",
        description: "L'article a été supprimé avec succès"
      });
      
      fetchArticles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression"
      });
    }
  };

  const togglePublishStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ is_published: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: currentStatus ? "Article dépublié" : "Article publié",
        description: currentStatus 
          ? "L'article a été dépublié avec succès" 
          : "L'article a été publié avec succès"
      });
      
      fetchArticles();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue"
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
                      navigate("/admin?tab=create");
                    }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nouvel article
                    </Button>
                  </div>
                  <CardDescription>
                    Liste de tous vos articles. Vous pouvez les modifier, les supprimer ou changer leur statut de publication.
                  </CardDescription>
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
                            {loading ? "Chargement des articles..." : "Aucun article trouvé"}
                          </TableCell>
                        </TableRow>
                      )}
                      {articles.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell className="font-medium">{article.title}</TableCell>
                          <TableCell>
                            <Badge className="capitalize">
                              {article.category}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(article.published_at)}</TableCell>
                          <TableCell>
                            <Badge variant={article.is_published ? "default" : "outline"}>
                              {article.is_published ? "Publié" : "Brouillon"}
                            </Badge>
                            {article.featured && (
                              <Badge variant="secondary" className="ml-2">
                                À la une
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => togglePublishStatus(article.id, article.is_published)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  {article.is_published ? "Dépublier" : "Publier"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEdit(article)}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(article.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
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
                  <CardTitle>{editingArticle ? "Modifier l'article" : "Créer un nouvel article"}</CardTitle>
                  <CardDescription>
                    Remplissez le formulaire ci-dessous pour {editingArticle ? "modifier" : "créer"} un article.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="title">Titre*</label>
                        <Input 
                          id="title" 
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Titre de l'article"
                          required
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor="description">Description*</label>
                        <Input
                          id="description" 
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Brève description de l'article"
                          required
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor="content">Contenu*</label>
                        <RichTextEditor
                          value={content}
                          onChange={setContent}
                          placeholder="Contenu complet de l'article"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <label htmlFor="image_url">Image principale</label>
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1">
                            <Input 
                              id="image_url" 
                              value={imageUrl}
                              onChange={(e) => setImageUrl(e.target.value)}
                              placeholder="https://example.com/image.jpg"
                              className="w-full"
                            />
                          </div>
                          
                          <div className="w-full md:w-72">
                            <MediaUploader
                              onSuccess={(url) => handleImageUploadSuccess(url)}
                              acceptTypes="image/*"
                              buttonText="Télécharger une image"
                              folderPath="thumbnails"
                            />
                          </div>
                        </div>
                        
                        {imageUrl && (
                          <div className="mt-2 bg-muted/20 p-2 rounded-md">
                            <div className="flex items-center gap-2 mb-2">
                              <Image className="h-4 w-4" />
                              <span className="text-sm font-medium">Aperçu de l'image</span>
                            </div>
                            <img 
                              src={imageUrl} 
                              alt="Aperçu" 
                              className="max-h-40 rounded-md object-contain"
                            />
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
                    
                    <div className="flex gap-2 justify-end">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          resetForm();
                          navigate("/admin?tab=articles");
                        }}
                      >
                        Annuler
                      </Button>
                      <Button type="submit">
                        {editingArticle ? "Mettre à jour" : "Créer"} l'article
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="videos">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des vidéos</CardTitle>
                  <CardDescription>
                    Gérez vos vidéos et contenus multimédias.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Video className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium">Aucune vidéo</h3>
                    <p className="mt-1 text-gray-500">Commencez par ajouter votre première vidéo</p>
                    <Button onClick={() => navigate("/admin?tab=create&type=video")} className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter une vidéo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="photos">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des photos</CardTitle>
                  <CardDescription>
                    Gérez votre galerie photo et vos images.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium">Aucune photo</h3>
                    <p className="mt-1 text-gray-500">Commencez par ajouter votre première photo</p>
                    <Button onClick={() => navigate("/admin?tab=create&type=photo")} className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter une photo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="players">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des joueurs</CardTitle>
                  <CardDescription>
                    Gérez les profils et informations des joueurs.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium">Gestion des joueurs</h3>
                    <p className="mt-1 text-gray-500">Consultez et modifiez les profils des joueurs</p>
                    <Button onClick={() => navigate("/players")} className="mt-4">
                      <Users className="mr-2 h-4 w-4" />
                      Voir les joueurs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="coaches">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des entraîneurs</CardTitle>
                  <CardDescription>
                    Gérez les profils et informations du staff technique.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium">Staff technique</h3>
                    <p className="mt-1 text-gray-500">Gérez les informations du staff technique</p>
                    <Button onClick={() => navigate("/admin?tab=create&type=coach")} className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter un entraîneur
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="matches">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des matchs</CardTitle>
                  <CardDescription>
                    Gérez le calendrier des matchs et les fixtures.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium">Calendrier des matchs</h3>
                    <p className="mt-1 text-gray-500">Ajoutez et gérez les matchs à venir</p>
                    <Button onClick={() => navigate("/admin?tab=create&type=match")} className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter un match
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results">
              <Card>
                <CardHeader>
                  <CardTitle>Résultats des matchs</CardTitle>
                  <CardDescription>
                    Consultez et mettez à jour les résultats des matchs.
                  </CardDescription>
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
