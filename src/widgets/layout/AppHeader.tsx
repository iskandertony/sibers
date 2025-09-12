import { Layout, Typography, Avatar, Dropdown } from "antd";
import { useSessionStore } from "@/features/auto-signin/model/session.store";

const { Header } = Layout;
const { Text } = Typography;

/** Simple header with current profile and actions (switch/reset placeholders). */
export function AppHeader() {
  const profile = useSessionStore(s => s.profile);
  const clearProfile = useSessionStore(s => s.clearProfile);

  const items = [
    { key: "switch", label: "Switch profile… (coming soon)" },
    { key: "reset", label: "Reset profile", onClick: () => clearProfile() }
  ];

  return (
    <Header style={{ display: "flex", alignItems: "center", gap: 12, background: "#0b0c0e" }}>
      <Text style={{ color: "#fff", fontWeight: 600 }}>Realtime Chat</Text>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        {profile && (
          <Dropdown menu={{ items }} trigger={["click"]}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <Avatar src={profile.avatar} />
              <Text style={{ color: "#bdbdbd" }}>{profile.name}</Text>
            </div>
          </Dropdown>
        )}
      </div>
    </Header>
  );
}
