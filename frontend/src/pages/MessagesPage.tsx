import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Navigate, Link } from "react-router-dom";
import { 
  ChevronLeft, 
  MessageCircle, 
  Send, 
  Search, 
  MoreVertical, 
  Check, 
  CheckCheck,
  Image as ImageIcon,
  Smile,
  Phone,
  ArrowDown,
  Circle,
  Clock,
  Filter,
  Star
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useConversations, useMessages, useSendMessage, type Conversation, type Message } from "@/hooks/useConversations";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import BottomNav from "@/components/BottomNav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { fr } from "date-fns/locale";
import { useTranslation } from "@/i18n/useTranslation";
import { useUserPresence } from "@/hooks/useUserPresence";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import RateSellerDialog from "@/components/RateSellerDialog";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredConversations = useMemo(() => {
    let filtered = conversations;
    
    if (filter === "unread") {
      filtered = filtered.filter(c => (c.unread_count || 0) > 0);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.other_user_name?.toLowerCase().includes(query) ||
        c.listing_title?.toLowerCase().includes(query) ||
        c.last_message?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [conversations, searchQuery, filter]);

  const totalUnread = useMemo(() => 
    conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0),
    [conversations]
  );

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </Link>
            <div>
              <h1 className="text-lg font-extrabold">{t("messages.title")}</h1>
              {totalUnread > 0 && (
                <p className="text-xs text-muted-foreground">
                  {totalUnread} message{totalUnread > 1 ? "s" : ""} non lu{totalUnread > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter("all")} className={filter === "all" ? "bg-accent" : ""}>
                Tous les messages
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("unread")} className={filter === "unread" ? "bg-accent" : ""}>
                Non lus uniquement
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une conversation..."
              className="pl-9 rounded-xl bg-muted/50 border-0 h-10"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-2">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-center p-3">
                <Skeleton className="w-14 h-14 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mx-auto mb-5 flex items-center justify-center">
              <MessageCircle className="h-10 w-10 text-primary" />
            </div>
            <p className="text-lg font-bold text-foreground">
              {searchQuery ? "Aucun resultat" : t("messages.none")}
            </p>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              {searchQuery 
                ? "Essayez avec d'autres mots-cles" 
                : t("messages.appear")
              }
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((convo, index) => (
              <ConversationItem 
                key={convo.id} 
                conversation={convo} 
                onSelect={onSelect}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function ConversationItem({ 
  conversation, 
  onSelect,
  index 
}: { 
  conversation: Conversation; 
  onSelect: (c: Conversation) => void;
  index: number;
}) {
  const otherId = conversation.buyer_id === conversation.seller_id 
    ? conversation.seller_id 
    : conversation.buyer_id;
  const { isOnline } = useUserPresence(otherId);
  const hasUnread = (conversation.unread_count || 0) > 0;

  return (
    <button
      onClick={() => onSelect(conversation)}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left",
        "hover:bg-accent/50 active:scale-[0.98]",
        hasUnread && "bg-primary/5",
        "animate-fade-in"
      )}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Avatar with presence indicator */}
      <div className="relative flex-shrink-0">
        <img 
          src={conversation.other_user_avatar || "/placeholder.svg"} 
          alt="" 
          className={cn(
            "w-14 h-14 rounded-full object-cover bg-muted",
            hasUnread && "ring-2 ring-primary ring-offset-2 ring-offset-background"
          )}
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className={cn(
            "text-sm truncate",
            hasUnread ? "font-bold text-foreground" : "font-semibold text-foreground"
          )}>
            {conversation.other_user_name}
          </p>
          {conversation.last_message_at && (
            <span className={cn(
              "text-[10px] shrink-0 ml-2",
              hasUnread ? "text-primary font-semibold" : "text-muted-foreground"
            )}>
              {formatMessageTime(conversation.last_message_at)}
            </span>
          )}
        </div>
        
        {/* Listing reference */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <img 
            src={conversation.listing_image} 
            alt="" 
            className="w-4 h-4 rounded object-cover bg-muted" 
          />
          <p className="text-xs text-muted-foreground truncate">
            {conversation.listing_title}
          </p>
        </div>

        {/* Last message preview */}
        {conversation.last_message && (
          <div className="flex items-center justify-between">
            <p className={cn(
              "text-xs truncate flex-1",
              hasUnread ? "text-foreground font-medium" : "text-muted-foreground"
            )}>
              {conversation.last_message}
            </p>
            {hasUnread && (
              <span className="ml-2 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {conversation.unread_count}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

function ChatView({ conversation, userId, onBack }: { conversation: Conversation; userId: string; onBack: () => void }) {
  const { data: messages = [], isLoading } = useMessages(conversation.id);
  const sendMessage = useSendMessage();
  const [text, setText] = useState("");
  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showRateDialog, setShowRateDialog] = useState(false);

  const otherId = conversation.buyer_id === userId ? conversation.seller_id : conversation.buyer_id;
  const isBuyer = conversation.buyer_id === userId;
  const { isOnline, lastSeen } = useUserPresence(otherId);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = "";

    messages.forEach((msg) => {
      const msgDate = format(new Date(msg.created_at), "yyyy-MM-dd");
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    const unreadIds = messages.filter((m) => !m.read && m.sender_id !== userId).map((m) => m.id);
    if (unreadIds.length > 0) {
      supabase.from("messages").update({ read: true }).in("id", unreadIds).then(() => {});
    }
  }, [messages, userId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Track scroll position for scroll-to-bottom button
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Simulate typing indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(Math.random() > 0.7);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage.mutate({ conversationId: conversation.id, content: text, senderId: userId });
    setText("");
  };

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Aujourd'hui";
    if (isYesterday(date)) return "Hier";
    return format(date, "EEEE d MMMM", { locale: fr });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Chat Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="p-1 -ml-1 rounded-full hover:bg-accent transition-colors">
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          
          {/* User info */}
          <Link to={`/vendeur/${otherId}`} className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <img 
                src={conversation.other_user_avatar || "/placeholder.svg"} 
                alt="" 
                className="w-10 h-10 rounded-full object-cover bg-muted" 
              />
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
                {conversation.other_user_name}
              </p>
              <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                {isOnline ? (
                  <>
                    <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                    En ligne
                  </>
                ) : lastSeen ? (
                  <>
                    <Clock className="h-2.5 w-2.5" />
                    Vu {formatDistanceToNow(lastSeen, { addSuffix: true, locale: fr })}
                  </>
                ) : (
                  conversation.listing_title
                )}
              </p>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Link 
              to={`/annonce/${conversation.listing_id}`}
              className="p-2 rounded-full hover:bg-accent transition-colors"
            >
              <img 
                src={conversation.listing_image} 
                alt="" 
                className="w-8 h-8 rounded-lg object-cover bg-muted" 
              />
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Phone className="h-4 w-4 mr-2" />
                  Appeler
                </DropdownMenuItem>
                {isBuyer && (
                  <DropdownMenuItem onClick={() => setShowRateDialog(true)}>
                    <Star className="h-4 w-4 mr-2" />
                    Noter le vendeur
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="text-destructive">
                  Bloquer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Rate Seller Banner - shown to buyer after messages exist */}
      {isBuyer && messages.length >= 3 && (
        <div className="mx-4 mt-3 mb-0">
          <button
            onClick={() => setShowRateDialog(true)}
            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-[hsl(var(--chad-yellow))]/10 to-[hsl(var(--chad-yellow))]/5 border border-[hsl(var(--chad-yellow))]/20 rounded-xl hover:bg-[hsl(var(--chad-yellow))]/15 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--chad-yellow))]/20 flex items-center justify-center">
                <Star className="h-5 w-5 text-[hsl(var(--chad-yellow))]" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Evaluez votre experience</p>
                <p className="text-xs text-muted-foreground">Notez {conversation.other_user_name}</p>
              </div>
            </div>
            <ChevronLeft className="h-5 w-5 text-muted-foreground rotate-180" />
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3 scroll-smooth"
      >
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
                <Skeleton className={cn("h-12 rounded-2xl", i % 2 === 0 ? "w-2/3" : "w-1/2")} />
              </div>
            ))}
          </div>
        ) : (
          <>
            {groupedMessages.map((group) => (
              <div key={group.date}>
                {/* Date separator */}
                <div className="flex items-center justify-center my-4">
                  <div className="bg-muted/80 text-muted-foreground text-[10px] font-medium px-3 py-1 rounded-full">
                    {formatDateHeader(group.date)}
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-1">
                  {group.messages.map((msg, idx) => {
                    const isMine = msg.sender_id === userId;
                    const showTail = idx === group.messages.length - 1 || 
                      group.messages[idx + 1]?.sender_id !== msg.sender_id;

                    return (
                      <MessageBubble 
                        key={msg.id} 
                        message={msg} 
                        isMine={isMine} 
                        showTail={showTail}
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start mt-2">
                <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-md">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-4 bg-background border shadow-lg rounded-full p-2 animate-fade-in"
        >
          <ArrowDown className="h-5 w-5 text-foreground" />
        </button>
      )}

      {/* Message Input */}
      <div className="border-t bg-background/95 backdrop-blur-md px-4 py-3">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("messages.placeholder")}
              className="rounded-2xl bg-muted/50 border-0 pr-20 min-h-[44px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button className="p-1.5 rounded-full hover:bg-accent transition-colors">
                <Smile className="h-5 w-5 text-muted-foreground" />
              </button>
              <button className="p-1.5 rounded-full hover:bg-accent transition-colors">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
          <Button 
            onClick={handleSend} 
            size="icon" 
            className={cn(
              "rounded-full h-11 w-11 shrink-0 transition-all",
              text.trim() ? "bg-primary" : "bg-muted text-muted-foreground"
            )}
            disabled={!text.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Rate Seller Dialog */}
      <RateSellerDialog
        isOpen={showRateDialog}
        onClose={() => setShowRateDialog(false)}
        sellerId={conversation.seller_id}
        sellerName={conversation.other_user_name || "Vendeur"}
        sellerAvatar={conversation.other_user_avatar}
        reviewerId={userId}
      />
    </div>
  );
}

function MessageBubble({ 
  message, 
  isMine, 
  showTail 
}: { 
  message: Message; 
  isMine: boolean; 
  showTail: boolean;
}) {
  return (
    <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[80%] px-3.5 py-2 text-sm",
        isMine
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-foreground",
        showTail 
          ? isMine 
            ? "rounded-2xl rounded-br-md" 
            : "rounded-2xl rounded-bl-md"
          : "rounded-2xl"
      )}>
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div className={cn(
          "flex items-center justify-end gap-1 mt-0.5",
          isMine ? "text-primary-foreground/60" : "text-muted-foreground"
        )}>
          <span className="text-[9px]">
            {format(new Date(message.created_at), "HH:mm")}
          </span>
          {isMine && (
            message.read 
              ? <CheckCheck className="h-3 w-3" />
              : <Check className="h-3 w-3" />
          )}
        </div>
      </div>
    </div>
  );
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return format(date, "HH:mm");
  }
  if (isYesterday(date)) {
    return "Hier";
  }
  return format(date, "dd/MM");
}

export default MessagesPage;
