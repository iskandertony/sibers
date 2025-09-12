import { create } from "zustand";
import { supabase } from "@/shared/api/supabase";

export type Message = {
  id: string;
  channel_id: string;
  author_id: string;
  content: string;
  created_at: string;
  optimistic?: boolean;
};

type MessagesState = {
  messages: Message[];
  loadHistory: (channelId: string) => Promise<void>;
  subscribeToChannel: (channelId: string) => () => void;
  sendMessage: (channelId: string, content: string) => Promise<boolean>;
};

export const useMessagesStore = create<MessagesState>((set, get) => ({
  messages: [],

  async loadHistory(channelId) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true });
    if (error) { console.error(error); return; }
    set({ messages: data ?? [] });
  },

  /** Subscribe to new messages via Postgres Changes. */
  subscribeToChannel(channelId) {
    const sub = supabase
      .channel(`messages:${channelId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `channel_id=eq.${channelId}`
      }, (payload) => {
        const row = payload.new as Message;
        set({ messages: [...get().messages, row] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  },

  /** Insert a message (optimistic UI). */
  async sendMessage(channelId, content) {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return false;

    const optimistic: Message = {
      id: `local-${Math.random().toString(36).slice(2)}`,
      channel_id: channelId,
      author_id: uid,
      content,
      created_at: new Date().toISOString(),
      optimistic: true
    };
    set({ messages: [...get().messages, optimistic] });

    const { data, error } = await supabase
      .from("messages")
      .insert({ channel_id: channelId, author_id: uid, content })
      .select("*")
      .single();

    if (error || !data) {
      console.error(error);
      // remove optimistic message
      set({ messages: get().messages.filter(m => m.id !== optimistic.id) });
      return false;
    }

    // Replace optimistic with real message (or keep; realtime will also deliver)
    set({
      messages: get().messages.map(m => m.id === optimistic.id ? data : m)
    });
    return true;
  }
}));
