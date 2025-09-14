import { useState } from 'react'

import { Form, Input, Modal } from 'antd'

import styles from './CreateChannelModal.module.scss'

type Props = {
  open: boolean
  onCancel: () => void
  onCreate: (name: string) => Promise<void> | void
  busy?: boolean
}

// Create chat modal
export function CreateChannelModal({ open, onCancel, onCreate, busy }: Props) {
  const [form] = Form.useForm<{ name: string }>()
  const [submitting, setSubmitting] = useState(false)

  // Submit with validation
  const handleOk = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const { name } = await form.validateFields()
      await onCreate(name.trim())
      form.resetFields()
    } finally {
      setSubmitting(false)
    }
  }

  // Cancel and clear form
  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  return (
    <Modal
      title="Create chat"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okButtonProps={{ loading: !!busy || submitting }}
      okText="Create"
      cancelText="Cancel"
      destroyOnHidden
      rootClassName={styles.darkModal}
      styles={{ mask: { backgroundColor: 'rgba(0,0,0,0.6)' } }}
    >
      <Form form={form} layout="vertical" requiredMark={false} className={styles.formRow} initialValues={{ name: '' }}>
        <Form.Item
          name="name"
          label="Chat name"
          rules={[
            { required: true, message: 'Please enter a name' },
            { min: 2, message: 'At least 2 characters' },
            { max: 40, message: 'Up to 40 characters' },
          ]}
        >
          <Input autoFocus allowClear placeholder="e.g. Design team" onPressEnter={handleOk} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
