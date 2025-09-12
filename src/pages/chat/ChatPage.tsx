import { Empty, Flex, Input, List, Typography, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { useChannelsStore } from "@/entities/channel/model/channels.store";
import { useMessagesStore } from "@/entities/message/model/messages.store";

const { Text } = Typography;

/** Main chat area: message list + input. */
export function ChatPage() {
  const activeChannelId = useChannelsStore(s => s.activeChannelId);
  const activeChannel = useChannelsStore(s => s.channels.find(c => c.id === s.activeChannelId));
  const { messages, subscribeToChannel, loadHistory, sendMessage } = useMessagesStore();
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!activeChannelId) return;
    loadHistory(activeChannelId).catch(() => message.error("Failed to load history"));
    const unsub = subscribeToChannel(activeChannelId);
    return () => unsub?.();
  }, [activeChannelId]);

  useEffect(() => {
    // scroll to bottom on updates
    listRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [messages.length, activeChannelId]);

  async function handleSend() {
    const text = input.trim();
    if (!text || !activeChannelId) return;
    setInput("");
    const ok = await sendMessage(activeChannelId, text);
    if (!ok) message.error("Failed to send");
  }

  if (!activeChannelId) {
    return (
      <Flex align="center" justify="center" style={{ height: "100%" }}>
        <Empty description="Select or create a channel" />
      </Flex>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateRows: "1fr auto", height: "calc(100vh - 64px)" }}>
      <div ref={listRef} style={{ overflow: "auto", padding: "12px 16px" }}>
        <Text style={{ color: "#9aa0a6" }}>#{activeChannel?.name}</Text>
        <List
          dataSource={messages}
          renderItem={(m) => (
            <List.Item style={{ border: 0, padding: "6px 0" }}>
              <div>
                <Text style={{ color: "#e0e0e0" }}>[{new Date(m.created_at).toLocaleTimeString()}]</Text>{" "}
                <Text style={{ color: "#e0e0e0" }}>{m.content}</Text>
                {m.optimistic && <Text type="secondary" style={{ marginLeft: 8 }}>(sending…)</Text>}
              </div>
            </List.Item>
          )}
        />
      </div>
      <div style={{ padding: 12, background: "#0b0c0e", borderTop: "1px solid #111" }}>
        <Input.Search
          placeholder="Type a message and press Enter"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onSearch={handleSend}
          enterButton="Send"
        />
      </div>
    </div>
  );
}
