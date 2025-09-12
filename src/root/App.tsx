import { Layout, message } from "antd";
import { useEffect } from "react";
import { ensureIdentity } from "@/features/auto-signin/model/ensureIdentity";
import { AppHeader } from "@/widgets/layout/AppHeader";
import { Sidebar } from "@/widgets/sidebar/Sidebar";
import { ChatPage } from "@/pages/chat/ChatPage";
import { useSessionStore } from "@/features/auto-signin/model/session.store";

const { Sider, Content } = Layout;

export function App() {
  const setProfile = useSessionStore(s => s.setProfile);

  useEffect(() => {
    (async () => {
      const result = await ensureIdentity();
      setProfile(result.profile);
      if (result.justSignedIn) {
        message.success(`Signed in as ${result.profile.name}`);
      }
    })();
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }} className="app-shell">
      <AppHeader />
      <Layout>
        <Sider theme="dark" width={280}>
          <Sidebar />
        </Sider>
        <Content>
          <ChatPage />
        </Content>
      </Layout>
    </Layout>
  );
}
