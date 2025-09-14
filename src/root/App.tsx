import { useEffect } from 'react'

import { Layout, message } from 'antd'

import { ensureIdentity } from '@/features/auto-signin/model/ensureIdentity'
import { useSessionStore } from '@/features/auto-signin/model/session.store'
import { ChatPage } from '@/pages/chat/ChatPage'
import { AppHeader } from '@/widgets/layout/header/AppHeader'
import { Sidebar } from '@/widgets/layout/sidebar/Sidebar'

const { Sider, Content } = Layout

export function App() {
  const setProfile = useSessionStore((s) => s.setProfile)

  useEffect(() => {
    ;(async () => {
      const result = await ensureIdentity()
      setProfile(result.profile)
      if (result.justSignedIn) {
        message.success(`Signed in as ${result.profile.name}`)
      }
    })()
  }, [])

  return (
    <Layout style={{ minHeight: '100vh' }} className="app-shell">
      <Layout>
        <Sider theme="dark" width={280}>
          <Sidebar />
        </Sider>
        <Content>
          <AppHeader />
          <ChatPage />
        </Content>
      </Layout>
    </Layout>
  )
}
