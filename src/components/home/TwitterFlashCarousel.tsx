import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Twitter, TrendingUp, Newspaper } from "lucide-react";

interface FlashNews {
  id: string;
  author: string;
  authorHandle: string;
  content: string;
  timestamp: string;
  verified: boolean;
  category: "transfer" | "injury" | "match" | "general";
}

const mockFlashNews: FlashNews[] = [
  {
    id: "1",
    author: "Fabrizio Romano",
    authorHandle: "@FabrizioRomano",
    content: "🚨 Kylian Mbappé to Real Madrid, HERE WE GO! All documents signed and sealed. Medical scheduled for next week. ⚪️👑",
    timestamp: "Il y a 2h",
    verified: true,
    category: "transfer"
  },
  {
    id: "2",
    author: "Madrid Times",
    authorHandle: "@MadridTimes",
    content: "⚽️ OFFICIEL : Vinicius Jr. remporte le prix du meilleur joueur du mois de janvier avec 5 buts et 3 passes décisives!",
    timestamp: "Il y a 4h",
    verified: true,
    category: "general"
  },
  {
    id: "3",
    author: "Carlo Ancelotti",
    authorHandle: "@MrAncelotti",
    content: "🏆 Très fier de l'équipe aujourd'hui. La mentalité et le travail collectif ont fait la différence. Hala Madrid! 💪",
    timestamp: "Il y a 5h",
    verified: true,
    category: "match"
  },
  {
    id: "4",
    author: "Real Madrid Info",
    authorHandle: "@RMadridInfo",
    content: "🚑 Mise à jour médicale : Militão devrait reprendre l'entraînement avec le groupe la semaine prochaine après sa blessure.",
    timestamp: "Il y a 6h",
    verified: true,
    category: "injury"
  },
  {
    id: "5",
    author: "Transfert News",
    authorHandle: "@TransfertNews",
    content: "📰 Le Real Madrid surveille de près plusieurs jeunes talents en Europe pour renforcer l'équipe cet été. Négociations en cours.",
    timestamp: "Il y a 8h",
    verified: true,
    category: "transfer"
  }
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "transfer":
      return <TrendingUp className="w-4 h-4" />;
    case "injury":
      return <span className="text-base">🚑</span>;
    case "match":
      return <span className="text-base">⚽</span>;
    default:
      return <Newspaper className="w-4 h-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "transfer":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "injury":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "match":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    default:
      return "bg-primary/10 text-primary border-primary/20";
  }
};

export const TwitterFlashCarousel = () => {
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#1DA1F2]/10">
            <Twitter className="w-6 h-6 text-[#1DA1F2]" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Infos Flash
            </h2>
            <p className="text-sm text-muted-foreground">
              Les dernières actualités en temps réel
            </p>
          </div>
        </div>

        {/* Mobile Carousel */}
        <div className="lg:hidden">
          <Carousel
            opts={{
              align: "start",
              dragFree: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {mockFlashNews.map((news) => (
                <CarouselItem key={news.id} className="pl-4 basis-[90%] sm:basis-[70%]">
                  <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                          <span className="text-primary-foreground font-bold text-sm">
                            {news.author.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-sm truncate">
                              {news.author}
                            </span>
                            {news.verified && (
                              <svg className="w-4 h-4 text-[#1DA1F2] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/>
                              </svg>
                            )}
                          </div>
                          <span className="text-muted-foreground text-xs">{news.authorHandle}</span>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${getCategoryColor(news.category)}`}>
                          {getCategoryIcon(news.category)}
                        </div>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed mb-3">
                        {news.content}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {news.timestamp}
                      </div>
                    </CardContent>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Desktop Grid with Carousel */}
        <div className="hidden lg:block">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {mockFlashNews.map((news) => (
                <CarouselItem key={news.id} className="pl-4 basis-1/3">
                  <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 bg-card/50 backdrop-blur-sm h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                          <span className="text-primary-foreground font-bold text-sm">
                            {news.author.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-sm truncate">
                              {news.author}
                            </span>
                            {news.verified && (
                              <svg className="w-4 h-4 text-[#1DA1F2] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/>
                              </svg>
                            )}
                          </div>
                          <span className="text-muted-foreground text-xs">{news.authorHandle}</span>
                        </div>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${getCategoryColor(news.category)}`}>
                          {getCategoryIcon(news.category)}
                        </div>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed mb-3">
                        {news.content}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {news.timestamp}
                      </div>
                    </CardContent>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 -translate-x-12" />
            <CarouselNext className="right-0 translate-x-12" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};
