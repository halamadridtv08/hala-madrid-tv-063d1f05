import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbConfig {
  [key: string]: string;
}

const routeLabels: BreadcrumbConfig = {
  news: "Actualités",
  players: "Joueurs",
  matches: "Matchs",
  stats: "Statistiques",
  videos: "Vidéos",
  calendar: "Calendrier",
  kits: "Maillots",
  transfers: "Transferts",
  press: "Presse",
  training: "Entraînement",
  predictions: "Pronostics",
  comparator: "Comparateur",
  "dream-team": "Dream Team",
  favorites: "Favoris",
  search: "Recherche",
  admin: "Administration",
};

interface DynamicBreadcrumbProps {
  customTitle?: string;
  className?: string;
}

export const DynamicBreadcrumb = ({ customTitle, className }: DynamicBreadcrumbProps) => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Don't show breadcrumb on home page
  if (pathnames.length === 0) return null;

  const getBreadcrumbLabel = (segment: string, index: number) => {
    // If it's the last segment and we have a custom title, use it
    if (index === pathnames.length - 1 && customTitle) {
      return customTitle;
    }
    
    // Check if it's a known route
    if (routeLabels[segment]) {
      return routeLabels[segment];
    }
    
    // If it looks like an ID (UUID or number), skip it
    if (segment.match(/^[0-9a-f-]{36}$/i) || segment.match(/^\d+$/)) {
      return null;
    }
    
    // Capitalize first letter
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const buildPath = (index: number) => {
    return "/" + pathnames.slice(0, index + 1).join("/");
  };

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList className="flex-wrap">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link 
              to="/" 
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">Accueil</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {pathnames.map((segment, index) => {
          const label = getBreadcrumbLabel(segment, index);
          if (!label) return null;

          const isLast = index === pathnames.length - 1;
          const path = buildPath(index);

          return (
            <div key={path} className="flex items-center">
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-medium text-foreground max-w-[200px] truncate">
                    {label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link 
                      to={path}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
