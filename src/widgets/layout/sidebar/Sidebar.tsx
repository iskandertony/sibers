import { useEffect, useState } from "react";
import { List, Typography } from "antd";

import styles from "./Sidebar.module.scss";
import { useChannelsStore } from "@/entities/channel/model/channels.store";
import { CreateChannelModal } from "@/features/create-channel/ui/CreateChannelModal";
import { DiscoverChannelsModal } from "@/features/discover-channel/ui/DiscoverChannelsModal";
import { MyInvites } from "@/features/invite-user/ui/MyInvites";
import { notify } from "@/shared/lib/notify";
import AppButton from "@/shared/ui/app-button/AppButton";
import UserAvatar from '@/entities/user/ui/UserAvatar'

const { Text } = Typography;

export function Sidebar() {
  const {
    channels,
    fetchMyChannels,
    createChannel,
    setActiveChannelId,
    activeChannelId,
  } = useChannelsStore();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchMyChannels().catch(() => notify.error("Failed to load chats"));
  }, [fetchMyChannels]);

  async function handleCreateChat(name: string) {
    setCreating(true);
    const ok = await createChannel(name);
    setCreating(false);
    if (ok) {
      setCreateModalOpen(false);
      notify.success("Chat created", name);
    } else {
      notify.error("Failed to create chat");
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.actions}>
        <AppButton className={styles.newChat} onClick={() => setCreateModalOpen(true)} loading={creating}>
          New chat
        </AppButton>
        <AppButton className={styles.discover} onClick={() => setDiscoverOpen(true)}>
          Discover
        </AppButton>
      </div>

      <div className={styles.headRow}>
        <Text className={styles.muted}>My chats</Text>
      </div>

      <List
        size="small"
        className={styles.list}
        dataSource={channels}
        rowKey={(channel) => channel.id}
        locale={{ emptyText: "No chats yet" }}
        renderItem={(channel) => {
          const isActive = activeChannelId === channel.id;
          return (
            <List.Item
              className={`${styles.itemRow} ${isActive ? styles.itemActive : ""}`}
              onClick={() => setActiveChannelId(channel.id)}
            >
              <div className={styles.itemLeft}>
                <UserAvatar name={channel.name} size={28} />
                <div className={styles.itemText}>
                  <div className={styles.channelName}>{channel.name}</div>
                  <div className={styles.channelMeta}>Open chat</div>
                </div>
              </div>
            </List.Item>
          );
        }}
      />

      <MyInvites />

      <CreateChannelModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onCreate={handleCreateChat}
        busy={creating}
      />
      <DiscoverChannelsModal open={discoverOpen} onClose={() => setDiscoverOpen(false)} />
    </div>
  );
}
