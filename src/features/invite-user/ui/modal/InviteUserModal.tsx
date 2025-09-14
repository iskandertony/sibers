import { useEffect, useMemo, useState } from "react";
import { Modal, Input, List, Avatar, Button } from "antd";
import { fetchUsers } from "@/entities/user/api/fetchUsers";
import { createInvite } from "@/features/invite-user/model/invites.api";
import { notify } from "@/shared/lib/notify";
import s from "./InviteUserModal.module.scss";

/** Shape we render in the modal (flattened for safe rendering). */
type UserVM = {
  id: number;
  name: string;
  username: string;
  email: string;
  avatar: string;
  city: string;
  country: string;
  companyName: string;
};

/** Normalize raw users.json row into a flat VM. */
function toVM(u: any): UserVM {
  return {
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    avatar: u.avatar,
    city: u.address?.city ?? u.city ?? "",
    country: u.address?.country ?? u.country ?? "",
    companyName:
      typeof u.company === "string" ? u.company : (u.company?.name ?? ""),
  };
}

export function InviteUserModal({
                                  open,
                                  onClose,
                                  channelId,
                                }: {
  open: boolean;
  onClose: () => void;
  channelId: string;
}) {
  const [all, setAll] = useState<UserVM[]>([]);
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    // Load users and flatten fields so UI renders only strings
    fetchUsers()
      .then((rows) => setAll(rows.map(toVM)))
      .catch(() => notify.error("Failed to load users"));
  }, [open]);

  const data = useMemo(() => {
    const sterm = q.trim().toLowerCase();
    if (!sterm) return all;
    return all.filter((u) =>
      u.name.toLowerCase().includes(sterm) ||
      u.username.toLowerCase().includes(sterm) ||
      u.email.toLowerCase().includes(sterm) ||
      u.city.toLowerCase().includes(sterm) ||
      u.country.toLowerCase().includes(sterm) ||
      u.companyName.toLowerCase().includes(sterm)
    );
  }, [all, q]);

  async function handleInvite(userId: number) {
    try {
      setBusyId(userId);
      await createInvite(channelId, userId);
      notify.success("Invite sent");
      onClose();
    } catch {
      notify.error("Failed to send invite");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Modal
      title="Invite user"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Input
        className={s.search}
        placeholder="Search by name, username, email, city, country, company"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
      />

      <List
        dataSource={data}
        locale={{ emptyText: "No users" }}
        renderItem={(u) => (
          <List.Item
            className={s.item}
            actions={[
              <Button
                key="invite"
                type="primary"
                size="small"
                onClick={() => handleInvite(u.id)}
                loading={busyId === u.id}
              >
                Invite
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar src={u.avatar} />}
              title={`${u.name} (${u.username})`}
              description={
                <span className={s.meta}>
                  {u.email} • {u.city}, {u.country}
                  {u.companyName ? ` • ${u.companyName}` : ""}
                </span>
              }
            />
          </List.Item>
        )}
      />
    </Modal>
  );
}
