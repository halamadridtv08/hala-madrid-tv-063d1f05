import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Article } from "@/types/Article";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import type { CarouselApi } from "@/components/ui/carousel";
export const TrophiesShowcase = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  useEffect(() => {
    fetchSpecialArticles();
  }, []);
  useEffect(() => {
    if (!api) return;
    const updateScrollButtons = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };
    updateScrollButtons();
    api.on("select", updateScrollButtons);
    api.on("reInit", updateScrollButtons);
    return () => {
      api.off("select", updateScrollButtons);
      api.off("reInit", updateScrollButtons);
    };
  }, [api]);
  const fetchSpecialArticles = async () => {
    try {
      // Essayer d'abord les articles "special", sinon prendre les articles featured, sinon les plus récents
      let query = supabase.from("articles").select("*").eq("is_published", true);

      // Essayer d'abord avec category "special"
      let {
        data: specialData
      } = await query.eq("category", "special").order("published_at", {
        ascending: false
      }).limit(8);
      if (specialData && specialData.length > 0) {
        setArticles(specialData);
        return;
      }

      // Si pas de "special", prendre les featured
      let {
        data: featuredData
      } = await supabase.from("articles").select("*").eq("is_published", true).eq("featured", true).order("published_at", {
        ascending: false
      }).limit(8);
      if (featuredData && featuredData.length > 0) {
        setArticles(featuredData);
        return;
      }

      // Si pas de featured, prendre les plus récents
      const {
        data,
        error
      } = await supabase.from("articles").select("*").eq("is_published", true).order("published_at", {
        ascending: false
      }).limit(8);
      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching special articles:", error);
    }
  };
  if (articles.length === 0) return null;
  const mainArticle = articles[0];
  return <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#2b003e] via-[#1a0033] to-[#00001a] py-12 md:py-16">
      <div className="container mx-auto px-4 h-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[80vh]">
          {/* Left side - Hero Image */}
          <div className="relative h-[500px] lg:h-[700px] rounded-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#2b003e]/40 z-10" />
            
            <img src={mainArticle.image_url || "/placeholder.svg"} alt={mainArticle.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />

            {/* Vertical Text */}
            <div className="absolute left-8 top-1/4 z-20">
              
            </div>

            {/* Title at Bottom */}
            <div className="absolute bottom-8 left-8 z-20 max-w-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-1 h-16 bg-gradient-to-b from-[#FFD700] to-transparent" />
                <h3 className="text-white font-['Playfair_Display'] text-3xl md:text-4xl lg:text-5xl leading-tight">
                  Trophées & Moments Légendaires
                </h3>
              </div>
            </div>

            {/* Decorative dots */}
            <div className="absolute left-8 top-1/2 transform -translate-y-1/2 z-20 flex flex-col gap-4">
              {[...Array(5)].map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i === 4 ? "bg-[#FFD700]" : "bg-white/30"}`} />)}
            </div>
          </div>

          {/* Right side - Carousel */}
          <div className="relative">
            <div className="mb-6">
              <h2 className="text-white font-['Playfair_Display'] text-4xl md:text-5xl lg:text-6xl mb-2">
                {mainArticle.title}
              </h2>
              <p className="text-white/70 text-lg">{mainArticle.description}</p>
            </div>

            <Carousel setApi={setApi} opts={{
            align: "start",
            loop: true
          }} className="w-full">
              <CarouselContent className="-ml-4">
                {articles.map(article => <CarouselItem key={article.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <Link to={`/news/${article.id}`}>
                      <Card className="group relative h-[400px] overflow-hidden bg-black/40 backdrop-blur-sm border-white/10 rounded-2xl hover:shadow-2xl hover:shadow-[#FFD700]/20 transition-all duration-500 hover:-translate-y-2">
                        <div className="absolute inset-0">
                          <img src={article.image_url || "/placeholder.svg"} alt={article.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                          {article.category && <span className="inline-block px-3 py-1 bg-[#FFD700]/20 text-[#FFD700] text-xs font-semibold rounded-full mb-3 backdrop-blur-sm border border-[#FFD700]/30">
                              #{article.category}
                            </span>}
                          <h3 className="text-white font-['Playfair_Display'] text-xl md:text-2xl mb-2 leading-tight">
                            {article.title}
                          </h3>
                          <p className="text-white/70 text-sm line-clamp-2">
                            {article.description}
                          </p>
                        </div>
                      </Card>
                    </Link>
                  </CarouselItem>)}
              </CarouselContent>
            </Carousel>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-6">
              <Button variant="outline" size="icon" onClick={() => api?.scrollPrev()} disabled={!canScrollPrev} className="rounded-full w-12 h-12 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 hover:border-white/30 disabled:opacity-30 transition-all">
                <ChevronLeft className="h-5 w-5 text-white" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => api?.scrollNext()} disabled={!canScrollNext} className="rounded-full w-12 h-12 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 hover:border-white/30 disabled:opacity-30 transition-all">
                <ChevronRight className="h-5 w-5 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
    </section>;
};