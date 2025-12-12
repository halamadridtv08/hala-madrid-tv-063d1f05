import { usePartners } from "@/hooks/usePartners";
import { useSiteVisibility } from "@/hooks/useSiteVisibility";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";

export function PartnersSection() {
  const { partners, loading } = usePartners();
  const { isVisible } = useSiteVisibility();
  const { t } = useLanguage();

  if (!isVisible('partners_section')) return null;

  const mainPartners = partners.filter(p => p.tier === 'main');
  const officialPartners = partners.filter(p => p.tier === 'official');
  const standardPartners = partners.filter(p => p.tier === 'standard');

  if (loading) {
    return (
      <section className="py-12 bg-background border-t border-border">
        <div className="madrid-container">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-48 mx-auto" />
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-32" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (partners.length === 0) return null;

  return (
    <section className="py-12 bg-background border-t border-border">
      <div className="madrid-container">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-foreground">{t('partners.title')}</h2>
        </div>

        {/* Main Partners - Largest logos */}
        {mainPartners.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-12 mb-10">
            {mainPartners.map((partner) => (
              <a
                key={partner.id}
                href={partner.website_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group transition-all duration-300 hover:scale-105"
                title={partner.name}
              >
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="h-16 md:h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
              </a>
            ))}
          </div>
        )}

        {/* Official Partners - Medium logos */}
        {officialPartners.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
            {officialPartners.map((partner) => (
              <a
                key={partner.id}
                href={partner.website_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group transition-all duration-300 hover:scale-105"
                title={partner.name}
              >
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="h-10 md:h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
              </a>
            ))}
          </div>
        )}

        {/* Standard Partners - Smaller logos */}
        {standardPartners.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-6">
            {standardPartners.map((partner) => (
              <a
                key={partner.id}
                href={partner.website_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group transition-all duration-300 hover:scale-105"
                title={partner.name}
              >
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="h-8 md:h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
