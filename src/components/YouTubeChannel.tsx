
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Youtube } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface YouTubeChannelProps {
  channelUrl: string;
  className?: string;
}

export function YouTubeChannel({ channelUrl, className }: YouTubeChannelProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden transform transition-all hover:shadow-xl">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-red-600 to-red-800 p-4 text-white">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Youtube className="h-7 w-7" />
                <div>
                  <h3 className="text-lg font-bold">HALA MADRID TV</h3>
                </div>
              </div>
              
              <Button 
                asChild
                variant="secondary" 
                className="bg-white text-red-600 hover:bg-gray-100 font-bold text-sm px-3 py-1 h-auto"
              >
                <a href={channelUrl} target="_blank" rel="noopener noreferrer">
                  <Youtube className="mr-2 h-3 w-3" /> S'abonner
                </a>
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="aspect-video w-full">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/videoseries?list=UU-PuI3YgYCDVtgAqEJyW1yw" 
                title="HALA MADRID TV YouTube Channel" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="rounded-b-md"
              ></iframe>
            </div>
            
            {/* Message d'incitation qui apparaît au survol */}
            <motion.div 
              className="absolute inset-0 bg-black/70 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center p-4">
                <Youtube className="h-12 w-12 text-red-600 mx-auto mb-3" />
                <p className="text-white text-xl font-bold mb-2">Suivez-nous sur YouTube !</p>
                <p className="text-white/80 mb-4">Abonnez-vous pour ne manquer aucune vidéo</p>
                <Button 
                  asChild
                  variant="secondary" 
                  className="bg-red-600 text-white hover:bg-red-700 font-bold"
                >
                  <a href={channelUrl} target="_blank" rel="noopener noreferrer">
                    <Youtube className="mr-2 h-4 w-4" /> S'abonner maintenant
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
