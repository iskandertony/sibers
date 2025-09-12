import { useEffect } from "react";
import { Button, List, Typography, message } from "antd";
import { useChannelsStore } from "@/entities/channel/model/channels.store";

const { Text } = Typography;

/** Left sidebar with channels and quick create button. */
export function Sidebar() {
  const { channels, fetchMyChannels, createChannel, setActiveChannelId } = useChannelsStore();

  useEffect(() => {
    fetchMyChannels().catch(() => message.error("Failed to load channels"));
  }, []);

  async function handleCreate() {
    const name = prompt("Channel name");
    if (!name) return;
    const ok = await createChannel(name);
    if (ok) {
      message.success(`Channel "${name}" created`);
    } else {
      message.error("Failed to create channel");
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <Button type="primary" block onClick={handleCreate}>New channel</Button>
      <List
        size="small"
        style={{ marginTop: 12 }}
        dataSource={channels}
        renderItem={(ch) => (
          <List.Item
            style={{
              cursor: "pointer",
              background: "#111418",
              borderRadius: 8,
              marginBottom: 6,
              padding: "8px 10px"
            }}
            onClick={() => setActiveChannelId(ch.id)}
          >
            <Text style={{ color: "#e0e0e0" }}>{ch.name}</Text>
          </List.Item>
        )}
      />
    </div>
  );
}
