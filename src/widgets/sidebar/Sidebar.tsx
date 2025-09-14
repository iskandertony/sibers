import { useEffect, useState } from "react";
import { Button, List, Typography } from "antd";
import { useChannelsStore } from "@/entities/channel/model/channels.store";
import { CreateChannelModal } from "@/features/create-channel/ui/CreateChannelModal";
import { notify } from "@/shared/lib/notify";
import s from "./Sidebar.module.scss";

const { Text } = Typography;

/** Left sidebar: my chats + "New chat" via modal. */
export function Sidebar() {
  const { channels, fetchMyChannels, createChannel, setActiveChannelId, activeChannelId } =
    useChannelsStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchMyChannels().catch(() => notify.error("Failed to load chats"));
  }, []);

  async function handleCreate(name: string) {
    setBusy(true);
    const ok = await createChannel(name);
    setBusy(false);
    if (ok) {
      setModalOpen(false);
      notify.success("Chat created", name);
    } else {
      notify.error("Failed to create chat");
    }
  }

  return (
    <div className={s.wrap}>
      <Button className={s.newChat} onClick={() => setModalOpen(true)} loading={busy}>
        New chat
      </Button>

      <div style={{ marginTop: 12 }}>
        <Text style={{ color: "var(--text-muted)" }}>My chats</Text>
        <List
          size="small"
          style={{ marginTop: 6 }}
          dataSource={channels}
          locale={{ emptyText: "No chats yet" }}
          renderItem={(ch) => (
            <List.Item className={s.item} onClick={() => setActiveChannelId(ch.id)}>
              <Text style={{ color: activeChannelId === ch.id ? "var(--brand)" : "var(--text)" }}>
                {ch.name}
              </Text>
            </List.Item>
          )}
        />
      </div>

      <CreateChannelModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onCreate={handleCreate}
        busy={busy}
      />
    </div>
  );
}
