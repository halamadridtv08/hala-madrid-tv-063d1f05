
import { Link } from "react-router-dom";
import SocialMediaCard from "./SocialMediaCard";

export function Footer() {
  return (
    <footer className="bg-madrid-blue text-white mt-12">
      <div className="madrid-container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">HALA MADRID TV</h3>
            <p className="text-gray-300">
              Votre chaîne d'actualités, de vidéos et d'informations sur le Real Madrid.
            </p>
            <div className="mt-6">
              <SocialMediaCard />
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-gray-300 hover:text-white transition-colors">
                  Actualités
                </Link>
              </li>
              <li>
                <Link to="/players" className="text-gray-300 hover:text-white transition-colors">
                  Effectif
                </Link>
              </li>
              <li>
                <Link to="/matches" className="text-gray-300 hover:text-white transition-colors">
                  Matchs
                </Link>
              </li>
              <li>
                <Link to="/training" className="text-gray-300 hover:text-white transition-colors">
                  Entrainement
                </Link>
              </li>
              <li>
                <Link to="/press" className="text-gray-300 hover:text-white transition-colors">
                  Conférences
                </Link>
              </li>
              <li>
                <Link to="/calendar" className="text-gray-300 hover:text-white transition-colors">
                  Calendrier
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Newsletter</h3>
            <p className="text-gray-300 mb-4">
              Inscrivez-vous pour recevoir les dernières actualités
            </p>
            <form className="flex flex-col lg:flex-row gap-2">
              <input
                type="email"
                placeholder="Votre email"
                className="px-4 py-2 rounded text-black flex-1"
                required
              />
              <button
                type="submit"
                className="bg-madrid-gold text-black font-medium px-4 py-2 rounded hover:bg-yellow-400 transition-colors whitespace-nowrap"
              >
                S'inscrire
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
          <p>© {new Date().getFullYear()} HALA MADRID TV. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
