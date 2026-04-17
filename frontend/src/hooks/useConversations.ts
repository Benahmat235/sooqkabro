import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  listing_title?: string;
  listing_image?: string;
  other_user_name?: string;
  other_user_avatar?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: convos, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Enrich with listing info, other user info, and last message
      const enriched: Conversation[] = await Promise.all(
        (convos || []).map(async (c: any) => {
          const otherId = c.buyer_id === user.id ? c.seller_id : c.buyer_id;

          const [listingRes, profileRes, msgRes, unreadRes] = await Promise.all([
            supabase.from("listings").select("title, listing_images(image_url, position)").eq("id", c.listing_id).maybeSingle(),
            supabase.from("profiles").select("display_name, avatar_url").eq("id", otherId).maybeSingle(),
            supabase.from("messages").select("content, created_at").eq("conversation_id", c.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
            supabase.from("messages").select("id", { count: "exact", head: true }).eq("conversation_id", c.id).eq("read", false).neq("sender_id", user.id),
          ]);

          const images = (listingRes.data as any)?.listing_images || [];
          const sortedImages = [...images].sort((a: any, b: any) => a.position - b.position);

          return {
            ...c,
            listing_title: listingRes.data?.title || "Annonce",
            listing_image: sortedImages[0]?.image_url || "/placeholder.svg",
            other_user_name: profileRes.data?.display_name || "Utilisateur",
            other_user_avatar: profileRes.data?.avatar_url,
            last_message: msgRes.data?.content,
            last_message_at: msgRes.data?.created_at,
            unread_count: unreadRes.count || 0,
          };
        })
      );

      return enriched;
    },
    enabled: !!user,
  });
}

export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []) as Message[];
    },
    enabled: !!conversationId,
    refetchInterval: 3000,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, content, senderId }: { conversationId: string; content: string; senderId: string }) => {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content.trim(),
      });
      if (error) throw error;
      // Update conversation timestamp
      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["messages", vars.conversationId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ listingId, buyerId, sellerId }: { listingId: string; buyerId: string; sellerId: string }) => {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("listing_id", listingId)
        .eq("buyer_id", buyerId)
        .maybeSingle();

      if (existing) return existing.id;

      const { data, error } = await supabase
        .from("conversations")
        .insert({ listing_id: listingId, buyer_id: buyerId, seller_id: sellerId })
        .select("id")
        .single();

      if (error) throw error;
      return data.id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useUnreadCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["unread-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      // Get all conversations where user is participant
      const { data: convos } = await supabase
        .from("conversations")
        .select("id")
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

      if (!convos?.length) return 0;

      const ids = convos.map((c: any) => c.id);
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .in("conversation_id", ids)
        .eq("read", false)
        .neq("sender_id", user.id);

      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 10000,
  });
}
