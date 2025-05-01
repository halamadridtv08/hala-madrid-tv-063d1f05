
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <div className="relative bg-madrid-blue overflow-hidden">
      <div 
        className="absolute inset-0 opacity-30 z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('https://media.gettyimages.com/id/1664698815/photo/real-madrid-cf-beats-fc-barcelona-3-2-el-clasico-pre-season-friendly.jpg?s=2048x2048&w=gi&k=20&c=o3BYRGQaJdAbjXcH6_D0OjTNq4D9z_CXsH5RG31rz3A=')` 
        }}
      ></div>
      
      <div className="madrid-container py-20 md:py-32 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
            <span className="text-madrid-gold">Bienvenue sur </span>
            <br />
            HalaMadrid<span className="text-madrid-gold">360</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 mb-8">
            Votre source ultime d'actualités, de statistiques et d'informations sur le Real Madrid
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild className="bg-madrid-gold text-black hover:bg-yellow-400 font-bold py-2 px-6 text-lg">
              <Link to="/news">Dernières Actualités</Link>
            </Button>
            <Button asChild variant="outline" className="bg-transparent text-white border-white hover:bg-white/10 font-bold py-2 px-6 text-lg">
              <Link to="/matches">Prochains Matchs</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
