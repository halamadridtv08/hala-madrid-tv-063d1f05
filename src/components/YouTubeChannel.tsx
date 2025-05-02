
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Youtube } from "lucide-react";
import { motion } from "framer-motion";

interface YouTubeChannelProps {
  channelUrl: string;
  className?: string;
}

export function YouTubeChannel({ channelUrl, className }: YouTubeChannelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="overflow-hidden transform transition-all hover:shadow-xl">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Youtube className="h-10 w-10" />
                <div>
                  <h3 className="text-xl font-bold">HALA MADRID TV</h3>
                  <p className="text-sm opacity-80">Suivez toutes nos vidéos sur YouTube</p>
                </div>
              </div>
              
              <Button 
                asChild
                variant="secondary" 
                className="bg-white text-red-600 hover:bg-gray-100 font-bold"
              >
                <a href={channelUrl} target="_blank" rel="noopener noreferrer">
                  <Youtube className="mr-2 h-4 w-4" /> S'abonner
                </a>
              </Button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="aspect-video w-full">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/videoseries?list=UU-PuI3YgYCDVtgAqEJyW1yw" 
                title="HALA MADRID TV YouTube Channel" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="rounded-md shadow-lg"
              ></iframe>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
