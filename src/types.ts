// 广告数据结构
export interface Ad {
  id: string;
  title: string;           // 广告标题
  publisher: string;       // 发布者
  content: string;        // 内容文案
  landingUrl: string;     // 落地页URL
  price: number;          // 出价
  clicks: number;         // 点击数
  videoUrls?: string[];   // 视频URL列表
  createdAt?: string;     // 创建时间
}

// 表单字段配置（动态表单用）
export interface FormFieldRule {
  required?: boolean;
  message?: string;
  type?: 'string' | 'number' | 'url';
  max?: number;
  min?: number;
}

export interface FormFieldConfig {
  field: string;          // 字段名
  label: string;          // 标签名
  component: 'Input' | 'TextArea' | 'InputNumber' | 'Upload';
  props?: Record<string, any>;
  rules?: FormFieldRule[];
}
