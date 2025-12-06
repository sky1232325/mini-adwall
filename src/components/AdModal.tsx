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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      // 动态加载表单配置
      setLoading(true);
      fetchFormConfig()
        .then((config) => {
          setFormConfig(config);
          setLoading(false);
        })
        .catch((err) => {
          console.error('加载表单配置失败:', err);
          setLoading(false);
        });

      if (mode === 'create') {
        form.resetFields();
        setFileList([]);
      } else if (initialValues) {
        form.setFieldsValue(initialValues);
        setFileList([]);
      }
    }
  }, [visible, mode, initialValues, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      const formData = new FormData();

      // 动态添加表单字段
      formConfig.forEach((config) => {
        if (config.component !== 'Upload') {
          const value = values[config.field];
          if (value !== undefined && value !== null) {
            formData.append(config.field, value.toString());
          }
        }
      });

      // 原方式（注释掉）
      // Object.keys(values).forEach((key) => {
      //   if (values[key] !== undefined && values[key] !== null) {
      //     formData.append(key, values[key].toString());
      //   }
      // });

      // 添加视频文件
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('videos', file.originFileObj);
        }
      });

      onSubmit(formData);
      form.resetFields();
      setFileList([]);
    });
  };

  const renderFormItem = (config: FormFieldConfig) => {
    const { field, label, component, props = {}, rules = [] } = config;

    let inputNode;
    switch (component) {
      case 'Input':
        inputNode = <Input {...props} placeholder={`请输入${label}`} />;
        break;
      case 'TextArea':
        inputNode = <Input.TextArea {...props} placeholder={`请输入${label}`} />;
        break;
      case 'InputNumber':
        inputNode = <InputNumber {...props} style={{ width: '100%' }} />;
        break;
      case 'Upload':
        inputNode = (
          <Upload
            beforeUpload={() => false}
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            {...props}
          >
            <Button icon={<UploadOutlined />}>选择文件</Button>
          </Upload>
        );
        break;
      default:
        inputNode = <Input {...props} />;
    }

    if (component === 'Upload') {
      return (
        <Form.Item key={field} label={label}>
          {inputNode}
        </Form.Item>
      );
    }

    return (
      <Form.Item key={field} label={label} name={field} rules={rules}>
        {inputNode}
      </Form.Item>
    );
  };

  return (
    <Modal
      title={mode === 'create' ? '新增广告' : '编辑广告'}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="确定"
      cancelText="取消"
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical">
          {formConfig.map((config) => renderFormItem(config))}
        </Form>
      </Spin>
      {/* 原静态表单（注释掉）
      <Form form={form} layout="vertical">
        <Form.Item
          label="广告标题"
          name="title"
          rules={[{ required: true, message: '请输入广告标题' }]}
        >
          <Input placeholder="请输入广告标题" />
        </Form.Item>

        <Form.Item
          label="发布人"
          name="publisher"
          rules={[{ required: true, message: '请输入发布人' }]}
        >
          <Input placeholder="请输入发布人" />
        </Form.Item>

        <Form.Item
          label="内容文案"
          name="content"
          rules={[{ required: true, message: '请输入内容文案' }]}
        >
          <Input.TextArea rows={4} placeholder="请输入内容文案" />
        </Form.Item>

        <Form.Item
          label="落地页"
          name="landingUrl"
          rules={[
            { required: true, message: '请输入落地页URL' },
            { type: 'url', message: '请输入有效的URL' },
          ]}
        >
          <Input placeholder="https://example.com" />
        </Form.Item>

        <Form.Item
          label="出价"
          name="price"
          rules={[{ required: true, message: '请输入出价' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="上传视频">
          <Upload
            beforeUpload={() => false}
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            accept="video/*"
            multiple
          >
            <Button icon={<UploadOutlined />}>选择视频文件</Button>
          </Upload>
        </Form.Item>
      </Form>
      */}
    </Modal>
  );
};

export default AdModal;
