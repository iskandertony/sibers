import { Dropdown, Layout, Typography } from 'antd'
import type { MenuProps } from 'antd'

import s from './AppHeader.module.scss'
import UserAvatar from '@/entities/user/ui/UserAvatar'
import { useSessionStore } from '@/features/auto-signin/model/session.store'
import { notify } from '@/shared/lib/notify'

const { Header } = Layout
const { Text } = Typography

// Top app bar: title + current profile actions
export function AppHeader() {
  const profile = useSessionStore((s) => s.profile)
  const clearProfile = useSessionStore((s) => s.clearProfile)

  // Reset profile on this device
  const handleResetProfile = () => {
    clearProfile()
    notify.success('Profile reset')
  }

  const menuItems: MenuProps['items'] = [
    { key: 'reset', label: 'Reset profile', onClick: handleResetProfile },
  ]

  return (
    <Header className={s.header}>
      <Text className={s.title}>Realtime Chat</Text>

      <div className={s.right}>
        {profile && (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <div className={s.trigger}>
              <UserAvatar name={profile.name} src={profile.avatar} size="sm" />
              <Text className={s.name}>{profile.name}</Text>
            </div>
          </Dropdown>
        )}
      </div>
    </Header>
  )
}
