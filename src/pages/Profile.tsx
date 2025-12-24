import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/SEOHead";
import { BadgesDisplay } from "@/components/badges/BadgesDisplay";
import { DynamicBreadcrumb } from "@/components/common/DynamicBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBadges } from "@/hooks/useBadges";
import { useAuth } from "@/contexts/AuthContext";
import { User, Trophy, Target, Calendar } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const { stats, unlockedBadges, availableBadges } = useBadges();

  const statCards = [
    {
      label: "Badges Débloqués",
      value: unlockedBadges.length,
      total: availableBadges.length,
      icon: Trophy,
      color: "text-primary",
    },
    {
      label: "Réactions",
      value: stats.reactions,
      icon: Target,
      color: "text-orange-500",
    },
    {
      label: "Pronostics",
      value: stats.predictions,
      icon: Target,
      color: "text-blue-500",
    },
    {
      label: "Jours Consécutifs",
      value: stats.visit_streak,
      icon: Calendar,
      color: "text-green-500",
    },
  ];

  return (
    <>
      <SEOHead
        title="Mon Profil - Real Madrid Fan"
        description="Consultez votre profil, vos badges et vos statistiques de fan."
      />
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="madrid-container py-8">
          <DynamicBreadcrumb className="mb-6" />
          
          {/* Profile Header */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
              <CardContent className="flex items-center gap-6 p-6">
                <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {user?.email ? user.email.split("@")[0] : "Fan Anonyme"}
                  </h1>
                  <p className="text-muted-foreground">
                    Membre depuis {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4 text-center">
                  <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                  <p className="text-2xl font-bold">
                    {stat.value}
                    {stat.total && (
                      <span className="text-sm text-muted-foreground">/{stat.total}</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Badges Section */}
          <BadgesDisplay />
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Profile;
