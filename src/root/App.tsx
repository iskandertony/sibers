import { useEffect } from 'react'

import { Layout, message } from 'antd'

import { ensureIdentity } from '@/features/auto-signin/model/ensureIdentity'
import { useSessionStore } from '@/features/auto-signin/model/session.store'
import { ChatPage } from '@/pages/chat/ChatPage'
import { AppHeader } from '@/widgets/layout/AppHeader'
import { Sidebar } from '@/widgets/sidebar/Sidebar'

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
  )
}
