import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Upload,
  Button,
  Spin,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { Ad, FormFieldConfig } from '../types';
import { fetchFormConfig } from '../services/api';

interface AdModalProps {
  visible: boolean;
  mode: 'create' | 'edit' | 'copy';
  initialValues?: Partial<Ad>;
  onCancel: () => void;
  onSubmit: (values: FormData) => void;
}

const AdModal: React.FC<AdModalProps> = ({
  visible,
  mode,
  initialValues,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [formConfig, setFormConfig] = useState<FormFieldConfig[]>([]);
  const [configLoading, setConfigLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;

    setConfigLoading(true);
    fetchFormConfig()
      .then((config) => setFormConfig(config))
      .catch(() => setFormConfig([]))
      .finally(() => setConfigLoading(false));

    if (mode === 'create') {
      form.resetFields();
      setFileList([]);
    } else if (initialValues) {
      form.setFieldsValue(initialValues);
      setFileList([]);
    }
  }, [visible, mode, initialValues, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      const formData = new FormData();

      // 添加表单字段
      Object.keys(values).forEach((key) => {
        if (key === 'videoUrls') return;
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key].toString());
        }
      });

      // 添加视频文件
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('videoUrls', file.originFileObj);
        }
      });

      onSubmit(formData);
      form.resetFields();
      setFileList([]);
    });
  };

  const renderField = (field: FormFieldConfig) => {
    switch (field.component) {
      case 'Input':
        return (
          <Form.Item
            key={field.field}
            label={field.label}
            name={field.field}
            rules={field.rules}
          >
            <Input {...field.props} placeholder={`请输入${field.label}`} />
          </Form.Item>
        );
      case 'TextArea':
        return (
          <Form.Item
            key={field.field}
            label={field.label}
            name={field.field}
            rules={field.rules}
          >
            <Input.TextArea {...field.props} placeholder={`请输入${field.label}`} />
          </Form.Item>
        );
      case 'InputNumber':
        return (
          <Form.Item
            key={field.field}
            label={field.label}
            name={field.field}
            rules={field.rules}
          >
            <InputNumber {...field.props} />
          </Form.Item>
        );
      case 'Upload':
        return (
          <Form.Item
            key={field.field}
            label={field.label}
            name={field.field}
            rules={field.rules}
            valuePropName="fileList"
            getValueFromEvent={({ fileList: fl }) => fl}
          >
            <Upload
              beforeUpload={() => false}
              fileList={fileList}
              onChange={({ fileList: fl }) => setFileList(fl)}
              accept={field.props?.accept || 'video/*'}
              multiple={field.props?.multiple}
            >
              <Button icon={<UploadOutlined />}>选择视频文件</Button>
            </Upload>
          </Form.Item>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      title={mode === 'create' || mode === 'copy' ? '新增广告' : '编辑广告'}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="确定"
      cancelText="取消"
    >
      <Spin spinning={configLoading} tip="加载表单配置...">
        <Form form={form} layout="vertical">
          {formConfig.map((field) => renderField(field))}
        </Form>
      </Spin>
    </Modal>
  );
};

export default AdModal;
