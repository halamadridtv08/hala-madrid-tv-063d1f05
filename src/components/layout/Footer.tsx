import { Link } from "react-router-dom";
import { useState } from "react";
import DOMPurify from "dompurify";
import SocialMediaCard from "./SocialMediaCard";
import { useFooterLinks, FooterLink } from "@/hooks/useFooterLinks";
import { useSiteVisibility } from "@/hooks/useSiteVisibility";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Cookie, FileText, Mail, Shield, HelpCircle } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  cookie: <Cookie className="h-4 w-4" />,
  file: <FileText className="h-4 w-4" />,
  mail: <Mail className="h-4 w-4" />,
  shield: <Shield className="h-4 w-4" />,
  help: <HelpCircle className="h-4 w-4" />,
};

export function Footer() {
  const { links, loading } = useFooterLinks();
  const { isVisible } = useSiteVisibility();
  const { t } = useLanguage();
  const [modalContent, setModalContent] = useState<FooterLink | null>(null);

  // Group links by section
  const groupedLinks = links.reduce((acc, link) => {
    if (!acc[link.section]) {
      acc[link.section] = [];
    }
    acc[link.section].push(link);
    return acc;
  }, {} as Record<string, FooterLink[]>);

  const handleLinkClick = (link: FooterLink, e: React.MouseEvent) => {
    if (link.link_type === 'modal' && link.content) {
      e.preventDefault();
      setModalContent(link);
    }
  };

  const renderLink = (link: FooterLink) => {
    const icon = link.icon ? iconMap[link.icon] : null;
    
    if (link.link_type === 'external' && link.url) {
      return (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
        >
          {icon}
          {link.title}
        </a>
      );
    }

    if (link.link_type === 'internal' && link.url) {
      return (
        <Link
          key={link.id}
          to={link.url}
          className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
        >
          {icon}
          {link.title}
        </Link>
      );
    }

    if (link.link_type === 'modal') {
      return (
        <button
          key={link.id}
          onClick={(e) => handleLinkClick(link, e)}
          className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 text-left"
        >
          {icon}
          {link.title}
        </button>
      );
    }

    return (
      <span key={link.id} className="text-gray-300 flex items-center gap-2">
        {icon}
        {link.title}
      </span>
    );
  };

  if (!isVisible('footer')) {
    return null;
  }

  return (
    <>
      <footer className="bg-madrid-blue text-white mt-12">
        <div className="madrid-container py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About Section */}
            <div>
              <h3 className="text-xl font-bold mb-4">HALA MADRID TV</h3>
              <p className="text-gray-300">
                {t('footer.aboutText')}
              </p>
              <div className="mt-6">
                <SocialMediaCard />
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-4">{t('footer.quickLinks')}</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                    {t('nav.home')}
                  </Link>
                </li>
                <li>
                  <Link to="/news" className="text-gray-300 hover:text-white transition-colors">
                    {t('nav.news')}
                  </Link>
                </li>
                <li>
                  <Link to="/players" className="text-gray-300 hover:text-white transition-colors">
                    {t('nav.players')}
                  </Link>
                </li>
                <li>
                  <Link to="/matches" className="text-gray-300 hover:text-white transition-colors">
                    {t('nav.matches')}
                  </Link>
                </li>
                <li>
                  <Link to="/calendar" className="text-gray-300 hover:text-white transition-colors">
                    {t('nav.calendar')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links from Database */}
            {groupedLinks['legal'] && groupedLinks['legal'].length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Informations légales</h3>
                <ul className="space-y-2">
                  {groupedLinks['legal'].map(renderLink)}
                </ul>
              </div>
            )}

            {/* Contact Links from Database */}
            {groupedLinks['contact'] && groupedLinks['contact'].length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">{t('footer.contact')}</h3>
                <ul className="space-y-2">
                  {groupedLinks['contact'].map(renderLink)}
                </ul>
              </div>
            )}
            
            {/* Newsletter */}
            <div>
              <h3 className="text-xl font-bold mb-4">Newsletter</h3>
              <p className="text-gray-300 mb-4">
                {t('footer.subscribeText') || "Inscrivez-vous pour recevoir les dernières actualités"}
              </p>
              <form className="flex flex-col lg:flex-row gap-2">
                <input
                  type="email"
                  placeholder={t('common.email') || "Votre email"}
                  className="px-4 py-2 rounded text-black flex-1"
                  required
                />
                <button
                  type="submit"
                  className="bg-madrid-gold text-black font-medium px-4 py-2 rounded hover:bg-yellow-400 transition-colors whitespace-nowrap"
                >
                  {t('footer.subscribe') || "S'inscrire"}
                </button>
              </form>
            </div>
          </div>
          
          {/* Bottom bar with additional links */}
          <div className="border-t border-gray-600 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-300">
                © {new Date().getFullYear()} HALA MADRID TV. {t('footer.rights')}.
              </p>
              
              {/* Social links from database */}
              {groupedLinks['social'] && groupedLinks['social'].length > 0 && (
                <div className="flex gap-4">
                  {groupedLinks['social'].map(renderLink)}
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Modal for content display */}
      <Dialog open={!!modalContent} onOpenChange={() => setModalContent(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalContent?.title}</DialogTitle>
          </DialogHeader>
          <div 
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(modalContent?.content || '', {
                ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'div', 'span'],
                ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
              })
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
