import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LogIn, Send, MessageCircle } from "lucide-react";

interface ChatMsg {
  id: string;
  user_id: string;
  display_name: string | null;
  message: string;
  created_at: string;
}

interface LiveChatProps {
  videoId?: string;
  roomKey?: string;
  onRequestLogin?: () => void;
}

export const LiveChat = ({ videoId, roomKey, onRequestLogin }: LiveChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const room = roomKey || (videoId ? `video:${videoId}` : "global");

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("live_chat_messages")
        .select("id,user_id,display_name,message,created_at")
        .eq("room_key", room)
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(80);
      if (mounted && data) setMessages([...data].reverse());
    })();

    const channel = supabase
      .channel(`live-chat-${room}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_chat_messages", filter: `room_key=eq.${room}` },
        (payload) => {
          const m = payload.new as ChatMsg;
          setMessages((prev) => [...prev.slice(-99), m]);
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [room]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    if (!user) {
      onRequestLogin?.();
      return;
    }
    const msg = text.trim();
    if (!msg) return;
    setSending(true);
    const displayName =
      (user.user_metadata as any)?.display_name ||
      (user.user_metadata as any)?.full_name ||
      user.email?.split("@")[0] ||
      "Madridista";
    const { error } = await supabase.from("live_chat_messages").insert({
      user_id: user.id,
      video_id: videoId ?? null,
      room_key: room,
      display_name: displayName,
      message: msg,
    });
    setSending(false);
    if (error) {
      toast.error("Envoi impossible");
      return;
    }
    setText("");
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border/50 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2 bg-muted/40">
        <MessageCircle className="h-4 w-4 text-primary" />
        <span className="font-semibold text-sm">Top Chat en direct</span>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[300px] max-h-[520px]">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            Sois le premier à écrire un message !
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="text-sm leading-snug break-words">
            <span className="font-semibold text-primary mr-1">
              {m.display_name || "Madridista"}
            </span>
            <span className="text-foreground">{m.message}</span>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border/50">
        {user ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-2"
          >
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              placeholder="Écris un message..."
              disabled={sending}
            />
            <Button type="submit" size="icon" disabled={sending || !text.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <Button variant="outline" className="w-full" onClick={onRequestLogin}>
            <LogIn className="h-4 w-4 mr-2" />
            Connecte-toi pour discuter
          </Button>
        )}
      </div>
    </div>
  );
};

export default LiveChat;