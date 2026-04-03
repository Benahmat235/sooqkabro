import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { ChevronLeft, MessageCircle, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useConversations, useMessages, useSendMessage, type Conversation } from "@/hooks/useConversations";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useTranslation } from "@/i18n/useTranslation";

const MessagesPage = () => {
  const { user, loading } = useAuth();
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background pb-20">
      {selectedConvo ? (
        <ChatView conversation={selectedConvo} userId={user.id} onBack={() => setSelectedConvo(null)} />
      ) : (
        <ConversationList userId={user.id} onSelect={setSelectedConvo} />
      )}
      <BottomNav />
    </div>
  );
};

function ConversationList({ userId, onSelect }: { userId: string; onSelect: (c: Conversation) => void }) {
  const { data: conversations = [], isLoading } = useConversations();
  const { t } = useTranslation();

  return (
    <>
      <div className="sticky top-0 z-50 glass border-b px-4 py-3 flex items-center gap-3">
        <Link to="/"><ChevronLeft className="h-5 w-5 text-foreground" /></Link>
        <h1 className="text-lg font-extrabold">{t("messages.title")}</h1>
      </div>

      <div className="px-4 py-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-center">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-2.5 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="h-9 w-9 text-accent-foreground" />
            </div>
            <p className="text-lg font-bold text-foreground">{t("messages.none")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("messages.appear")}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => onSelect(convo)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-accent/50 transition-colors text-left"
              >
                <div className="relative">
                  <img src={convo.listing_image} alt="" className="w-12 h-12 rounded-xl object-cover bg-muted" />
                  {(convo.unread_count || 0) > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-card">
                      {convo.unread_count}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground truncate">{convo.other_user_name}</p>
                    {convo.last_message_at && (
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {formatDistanceToNow(new Date(convo.last_message_at), { addSuffix: false, locale: fr })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{convo.listing_title}</p>
                  {convo.last_message && (
                    <p className={cn("text-xs truncate mt-0.5", (convo.unread_count || 0) > 0 ? "text-foreground font-semibold" : "text-muted-foreground")}>
                      {convo.last_message}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function ChatView({ conversation, userId, onBack }: { conversation: Conversation; userId: string; onBack: () => void }) {
  const { data: messages = [] } = useMessages(conversation.id);
  const sendMessage = useSendMessage();
  const [text, setText] = useState("");
  const { t } = useTranslation();

  const unreadIds = messages.filter((m) => !m.read && m.sender_id !== userId).map((m) => m.id);
  if (unreadIds.length > 0) {
    supabase.from("messages").update({ read: true }).in("id", unreadIds).then(() => {});
  }

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage.mutate({ conversationId: conversation.id, content: text, senderId: userId });
    setText("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="sticky top-0 z-50 glass border-b px-4 py-3 flex items-center gap-3">
        <button onClick={onBack}><ChevronLeft className="h-5 w-5 text-foreground" /></button>
        <img src={conversation.listing_image} alt="" className="w-8 h-8 rounded-lg object-cover bg-muted" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{conversation.other_user_name}</p>
          <p className="text-[10px] text-muted-foreground truncate">{conversation.listing_title}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map((msg) => {
          const isMine = msg.sender_id === userId;
          return (
            <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[75%] px-3.5 py-2 rounded-2xl text-sm",
                isMine
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              )}>
                <p>{msg.content}</p>
                <p className={cn("text-[9px] mt-0.5", isMine ? "text-primary-foreground/60" : "text-muted-foreground")}>
                  {new Date(msg.created_at).toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t glass px-4 py-3 flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("messages.placeholder")}
          className="rounded-xl bg-muted/50 border-0"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button onClick={handleSend} size="icon" className="rounded-xl shrink-0" disabled={!text.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default MessagesPage;
