import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Eye, EyeOff, Edit2, Check, X, Layout, Navigation, Footprints } from "lucide-react";
import { useSiteVisibility } from "@/hooks/useSiteVisibility";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export const SiteVisibilityManager = () => {
  const { sections, loading, toggleVisibility, updateSectionName, refetch } = useSiteVisibility();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleToggle = async (sectionKey: string) => {
    try {
      await toggleVisibility(sectionKey);
      toast.success("Visibilité mise à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const startEditing = (section: any) => {
    setEditingKey(section.section_key);
    setEditValue(section.section_name);
  };

  const cancelEditing = () => {
    setEditingKey(null);
    setEditValue("");
  };

  const saveEditing = async (sectionKey: string) => {
    if (!editValue.trim()) {
      toast.error("Le nom ne peut pas être vide");
      return;
    }
    
    try {
      await updateSectionName(sectionKey, editValue.trim());
      toast.success("Nom mis à jour");
      setEditingKey(null);
      setEditValue("");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const parentSections = sections.filter(s => !s.parent_key);
  const getChildSections = (parentKey: string) => 
    sections.filter(s => s.parent_key === parentKey);

  const getIcon = (sectionKey: string) => {
    if (sectionKey.startsWith('navbar')) return <Navigation className="h-4 w-4" />;
    if (sectionKey.startsWith('footer')) return <Footprints className="h-4 w-4" />;
    return <Layout className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestion de la visibilité du site</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const renderSection = (section: any, isChild = false) => {
    const isEditing = editingKey === section.section_key;
    
    return (
      <div 
        key={section.section_key}
        className={`flex items-center justify-between p-3 rounded-lg border ${
          isChild ? 'ml-6 bg-muted/30' : 'bg-card'
        } ${!section.is_visible ? 'opacity-60' : ''}`}
      >
        <div className="flex items-center gap-3 flex-1">
          {getIcon(section.section_key)}
          
          {isEditing ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="h-8"
                autoFocus
              />
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => saveEditing(section.section_key)}
              >
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={cancelEditing}
              >
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-medium">{section.section_name}</span>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => startEditing(section)}
                className="h-6 w-6 p-0"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {section.is_visible ? (
            <Eye className="h-4 w-4 text-green-600" />
          ) : (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          )}
          <Switch
            checked={section.is_visible}
            onCheckedChange={() => handleToggle(section.section_key)}
          />
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layout className="h-5 w-5" />
          Gestion de la visibilité du site
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Masquez ou affichez les sections du site public
        </p>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={['navbar', 'sections', 'footer']} className="space-y-4">
          {/* Navbar Section */}
          <AccordionItem value="navbar" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary" />
                <span className="font-semibold">Barre de navigation</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 pt-2">
              {sections
                .filter(s => s.section_key === 'navbar' || s.parent_key === 'navbar')
                .map(section => renderSection(section, section.parent_key === 'navbar'))}
            </AccordionContent>
          </AccordionItem>

          {/* Main Sections */}
          <AccordionItem value="sections" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" />
                <span className="font-semibold">Sections de la page d'accueil</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 pt-2">
              {sections
                .filter(s => !s.parent_key && !s.section_key.startsWith('navbar') && !s.section_key.startsWith('footer'))
                .map(section => renderSection(section))}
            </AccordionContent>
          </AccordionItem>

          {/* Footer Section */}
          <AccordionItem value="footer" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Footprints className="h-5 w-5 text-primary" />
                <span className="font-semibold">Pied de page</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 pt-2">
              {sections
                .filter(s => s.section_key === 'footer' || s.parent_key === 'footer')
                .map(section => renderSection(section, section.parent_key === 'footer'))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
