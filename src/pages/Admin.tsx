
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AdminMenuBar } from "@/components/layout/AdminMenuBar";
import PlayerTable from "@/components/admin/PlayerTable";
import CoachTable from "@/components/admin/CoachTable";
import StaffManagement from "@/components/admin/StaffManagement";

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [players, setPlayers] = useState([]);
  const [coaches, setCoaches] = useState([]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="madrid-container py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <h1 className="text-3xl font-bold">Administration</h1>
          </div>
          
          <AdminMenuBar />
          
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mt-8">
            <TabsList className="grid grid-cols-8 w-full">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="players">Joueurs</TabsTrigger>
              <TabsTrigger value="coaches">Entraîneurs</TabsTrigger>
              <TabsTrigger value="staff">Staff & Palmarès</TabsTrigger>
              <TabsTrigger value="matches">Matchs</TabsTrigger>
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="videos">Vidéos</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-4">
                <p>Bienvenue dans l'interface d'administration.</p>
                {/* Ajoutez ici des statistiques ou des informations générales */}
              </div>
            </TabsContent>

            <TabsContent value="players">
              <PlayerTable players={players} setPlayers={setPlayers} />
            </TabsContent>

            <TabsContent value="coaches">
              <CoachTable coaches={coaches} setCoaches={setCoaches} />
            </TabsContent>

            <TabsContent value="staff">
              <StaffManagement />
            </TabsContent>

            <TabsContent value="matches">
              <div>Gestion des matchs à venir.</div>
            </TabsContent>

            <TabsContent value="articles">
              <div>Gestion des articles de blog.</div>
            </TabsContent>

            <TabsContent value="photos">
              <div>Gestion des photos.</div>
            </TabsContent>

            <TabsContent value="videos">
              <div>Gestion des vidéos.</div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Admin;
