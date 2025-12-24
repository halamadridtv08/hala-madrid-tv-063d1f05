import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Share2,
  Copy,
  Check,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareModalProps {
  url?: string;
  title?: string;
  description?: string;
  image?: string;
  children?: React.ReactNode;
  className?: string;
}

interface ShareOption {
  name: string;
  icon: React.ReactNode;
  color: string;
  getUrl: (url: string, title: string) => string;
}

const shareOptions: ShareOption[] = [
  {
    name: "Twitter",
    icon: <Twitter className="h-5 w-5" />,
    color: "bg-[#1DA1F2] hover:bg-[#1a8cd8]",
    getUrl: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: "Facebook",
    icon: <Facebook className="h-5 w-5" />,
    color: "bg-[#4267B2] hover:bg-[#365899]",
    getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "LinkedIn",
    icon: <Linkedin className="h-5 w-5" />,
    color: "bg-[#0077B5] hover:bg-[#006097]",
    getUrl: (url, title) =>
      `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  {
    name: "WhatsApp",
    icon: <MessageCircle className="h-5 w-5" />,
    color: "bg-[#25D366] hover:bg-[#20bd5a]",
    getUrl: (url, title) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    name: "Telegram",
    icon: <Send className="h-5 w-5" />,
    color: "bg-[#0088CC] hover:bg-[#0077b3]",
    getUrl: (url, title) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: "Email",
    icon: <Mail className="h-5 w-5" />,
    color: "bg-muted-foreground hover:bg-muted-foreground/80",
    getUrl: (url, title) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
  },
];

export const ShareModal = ({
  url,
  title = "Partager",
  description,
  children,
  className,
}: ShareModalProps) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareTitle = title || "Découvrez cet article sur Real Madrid";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Lien copié !",
        description: "Le lien a été copié dans le presse-papiers",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de copier le lien",
      });
    }
  };

  const handleShare = (option: ShareOption) => {
    const shareLink = option.getUrl(shareUrl, shareTitle);
    window.open(shareLink, "_blank", "noopener,noreferrer,width=600,height=400");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: description,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className={cn("gap-2", className)}>
            <Share2 className="h-4 w-4" />
            Partager
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Partager
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Social Share Buttons */}
          <div className="grid grid-cols-3 gap-3">
            {shareOptions.map((option, index) => (
              <motion.button
                key={option.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleShare(option)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl text-white transition-all duration-200",
                  option.color
                )}
              >
                {option.icon}
                <span className="text-xs font-medium">{option.name}</span>
              </motion.button>
            ))}
          </div>

          {/* Copy Link Section */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Ou copier le lien
            </p>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="text-sm bg-muted/50"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="shrink-0"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Copy className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>

          {/* Native Share (Mobile) */}
          {typeof navigator !== "undefined" && "share" in navigator && (
            <Button
              variant="default"
              className="w-full gap-2"
              onClick={handleNativeShare}
            >
              <Share2 className="h-4 w-4" />
              Plus d'options de partage
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
