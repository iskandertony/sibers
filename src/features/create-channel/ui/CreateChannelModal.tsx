import { useState } from "react";
import { Modal, Input, Form } from "antd";
import s from "./CreateChannelModal.module.scss";

export function CreateChannelModal({
                                     open, onCancel, onCreate, busy,
                                   }: {
  open: boolean;
  onCancel: () => void;
  onCreate: (name: string) => Promise<void> | void;
  busy?: boolean;
}) {
  const [form] = Form.useForm<{ name: string }>();

  const handleOk = async () => {
    const { name } = await form.validateFields();
    await onCreate(name.trim());
    form.resetFields();
  };

  return (
    <Modal
      title="Create chat"
      open={open}
      onOk={handleOk}
      onCancel={() => { form.resetFields(); onCancel(); }}
      okButtonProps={{ loading: !!busy }}
      okText="Create"
      cancelText="Cancel"
      destroyOnClose
      rootClassName={s.darkModal}
      styles={{ mask: { backgroundColor: "rgba(0,0,0,0.6)" } }} // darker backdrop
    >
      <Form form={form} layout="vertical" className={s.formRow} initialValues={{ name: "" }}>
        <Form.Item
          name="name"
          label="Chat name"
          rules={[
            { required: true, message: "Please enter a name" },
            { min: 2, message: "At least 2 characters" },
            { max: 40, message: "Up to 40 characters" },
          ]}
        >
          <Input autoFocus placeholder="e.g. Design team" onPressEnter={handleOk} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
