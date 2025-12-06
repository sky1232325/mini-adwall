# Mini广告墙 - 从零开始完整实施指南

> 这是一份完整的项目重建指南，涵盖所有基础任务和进阶任务的实施步骤。

---

## 🎯 项目概览

**项目名称：** Mini广告墙  
**项目类型：** 全栈Web应用  
**技术栈：** React + TypeScript + Vite（前端）+ Node.js + Express（后端）  
**预计工时：** 40-60小时（含所有进阶任务）

### 项目分阶段目标
1. ✅ **基础阶段**（6-8小时）：纯前端广告墙
2. ✅ **中级阶段**（8-10小时）：前后端分离
3. ✅ **进阶阶段**（20-30小时）：视频功能 + 动态表单

---

## 📋 第一阶段：项目初始化（1-2小时）

### 步骤 1.1：创建项目目录结构

```bash
# 创建项目根目录
mkdir mini_adwall
cd mini_adwall

# 初始化 Git 仓库
git init
git config user.email "your-email@example.com"
git config user.name "Your Name"
```

### 步骤 1.2：初始化前端项目（React + Vite + TypeScript）

```bash
# 使用 npm create 创建 Vite 项目
npm create vite@latest . -- --template react-ts

# 安装基础依赖
npm install

# 安装 Ant Design UI库
npm install antd @ant-design/icons

# 安装工具库
npm install uuid
npm install --save-dev @types/uuid

# 验证前端项目
npm run dev  # 访问 http://localhost:5173
```

### 步骤 1.3：初始化后端项目（Node.js + Express）

```bash
# 创建后端目录
mkdir server
cd server

# 初始化 Node.js 项目
npm init -y

# 安装后端依赖
npm install express cors body-parser multer

# 返回项目根目录
cd ..
```

### 步骤 1.4：配置版本控制

创建 `.gitignore` 文件：
```
node_modules/
dist/
dist-ssr/
*.local
.env
.vite/
*.log
```

创建初始提交：
```bash
git add .
git commit -m "初始化：前后端项目骨架"
```

---

## 📱 第二阶段：前端基础开发（6-8小时）

### 步骤 2.1：定义数据类型（TypeScript）

**文件：** `src/types.ts`

```typescript
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
export interface FormFieldConfig {
  field: string;          // 字段名
  label: string;          // 标签名
  component: 'Input' | 'TextArea' | 'InputNumber' | 'Upload';
  props?: Record<string, any>;
  rules?: Array<{
    required?: boolean;
    message?: string;
    type?: string;
  }>;
}
```

### 步骤 2.2：实现排序算法

**文件：** `src/utils/ranking.ts`

```typescript
import type { Ad } from '../types';

// 竞价公式：出价 + (出价 * 点击数 * 0.42)
export const calculateScore = (ad: Ad): number => {
  return ad.price + (ad.price * ad.clicks * 0.42);
};

// 排序函数
export const sortAdsByScore = (ads: Ad[]): Ad[] => {
  return [...ads].sort((a, b) => calculateScore(b) - calculateScore(a));
};
```

### 步骤 2.3：创建 AdCard 组件（卡片展示）

**文件：** `src/components/AdCard.tsx`

```typescript
import React from 'react';
import { Card, Button, Space, Text } from 'antd';
import { EditOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Ad } from '../types';

interface AdCardProps {
  ad: Ad;
  onEdit: (ad: Ad) => void;
  onCopy: (ad: Ad) => void;
  onDelete: (ad: Ad) => void;
  onClick: (ad: Ad) => void;
}

const AdCard: React.FC<AdCardProps> = ({
  ad,
  onEdit,
  onCopy,
  onDelete,
  onClick,
}) => {
  return (
    <Card
      style={{ cursor: 'pointer', height: '100%' }}
      onClick={() => onClick(ad)}
    >
      <Card.Meta
        title={ad.title}
        description={
          <div>
            <p>发布者：{ad.publisher}</p>
            <p>{ad.content}</p>
            <Space>
              <Text type="danger">热度: {ad.clicks}</Text>
              <Text strong>出价: {ad.price}</Text>
            </Space>
            <Space
              style={{ marginTop: '10px', width: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(ad);
                }}
              >
                编辑
              </Button>
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  onCopy(ad);
                }}
              >
                复制
              </Button>
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(ad);
                }}
              >
                删除
              </Button>
            </Space>
          </div>
        }
      />
    </Card>
  );
};

export default AdCard;
```

### 步骤 2.4：创建 AdModal 组件（编辑弹窗）

**文件：** `src/components/AdModal.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Upload,
  Button,
  message,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { Ad, FormFieldConfig } from '../types';

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

  useEffect(() => {
    if (visible) {
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

      // 添加表单字段
      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key].toString());
        }
      });

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

  return (
    <Modal
      title={mode === 'create' ? '新增广告' : '编辑广告'}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
    >
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
    </Modal>
  );
};

export default AdModal;
```

### 步骤 2.5：创建 VideoPlayerModal 组件

**文件：** `src/components/VideoPlayerModal.tsx`

```typescript
import React, { useEffect, useRef } from 'react';
import { Modal } from 'antd';

interface VideoPlayerModalProps {
  visible: boolean;
  videoUrl: string | null;
  onClose: () => void;
  onFinish: () => void;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  visible,
  videoUrl,
  onClose,
  onFinish,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (visible && videoRef.current) {
      videoRef.current.play().catch((e) => console.error('自动播放失败:', e));
    }
  }, [visible]);

  const handleVideoEnd = () => {
    onFinish();
  };

  return (
    <Modal
      title="广告视频"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          style={{ width: '100%' }}
          onEnded={handleVideoEnd}
        />
      ) : (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          暂无视频
        </div>
      )}
    </Modal>
  );
};

export default VideoPlayerModal;
```

### 步骤 2.6：创建主应用组件

**文件：** `src/App.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Layout, Button, Row, Col, message, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import AdCard from './components/AdCard';
import AdModal from './components/AdModal';
import VideoPlayerModal from './components/VideoPlayerModal';
import type { Ad } from './types';
import { sortAdsByScore } from './utils/ranking';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Layout;

const App: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'copy'>('create');
  const [currentAd, setCurrentAd] = useState<Ad | undefined>(undefined);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [playingAd, setPlayingAd] = useState<Ad | null>(null);
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);

  // 从 localStorage 加载广告
  const loadAds = () => {
    const stored = localStorage.getItem('ads');
    const data = stored ? JSON.parse(stored) : [];
    setAds(sortAdsByScore(data));
  };

  useEffect(() => {
    loadAds();
  }, []);

  // 保存广告到 localStorage
  const saveAds = (newAds: Ad[]) => {
    localStorage.setItem('ads', JSON.stringify(newAds));
    setAds(sortAdsByScore(newAds));
  };

  const handleCreate = () => {
    setModalMode('create');
    setCurrentAd(undefined);
    setIsModalVisible(true);
  };

  const handleEdit = (ad: Ad) => {
    setModalMode('edit');
    setCurrentAd(ad);
    setIsModalVisible(true);
  };

  const handleCopy = (ad: Ad) => {
    setModalMode('copy');
    setCurrentAd(ad);
    setIsModalVisible(true);
  };

  const handleDelete = (ad: Ad) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除广告 "${ad.title}" 吗？`,
      onOk: () => {
        const newAds = ads.filter((a) => a.id !== ad.id);
        saveAds(newAds);
        message.success('删除成功');
      },
    });
  };

  const handleClick = (ad: Ad) => {
    // 增加点击数
    const updatedAds = ads.map((a) =>
      a.id === ad.id ? { ...a, clicks: a.clicks + 1 } : a
    );
    saveAds(updatedAds);

    // 如果有视频则播放，否则直接跳转
    if (ad.videoUrls && ad.videoUrls.length > 0) {
      const randomIndex = Math.floor(Math.random() * ad.videoUrls.length);
      setPlayingAd(ad);
      setPlayingVideoUrl(ad.videoUrls[randomIndex]);
      setIsVideoModalVisible(true);
    } else {
      window.open(ad.landingUrl, '_blank');
    }
  };

  const handleVideoFinish = () => {
    setIsVideoModalVisible(false);
    if (playingAd) {
      window.open(playingAd.landingUrl, '_blank');
    }
  };

  const handleModalSubmit = (formData: FormData) => {
    const title = formData.get('title') as string;
    const publisher = formData.get('publisher') as string;
    const content = formData.get('content') as string;
    const landingUrl = formData.get('landingUrl') as string;
    const price = parseFloat(formData.get('price') as string);

    if (!title || !publisher || !content || !landingUrl || isNaN(price)) {
      message.error('请填写所有必填项');
      return;
    }

    if (modalMode === 'create' || modalMode === 'copy') {
      const newAd: Ad = {
        id: uuidv4(),
        title,
        publisher,
        content,
        landingUrl,
        price,
        clicks: 0,
        videoUrls: [],
      };
      saveAds([...ads, newAd]);
      message.success('创建成功');
    } else if (modalMode === 'edit' && currentAd) {
      const newAds = ads.map((a) =>
        a.id === currentAd.id
          ? { ...a, title, publisher, content, landingUrl, price }
          : a
      );
      saveAds(newAds);
      message.success('更新成功');
    }

    setIsModalVisible(false);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff',
          boxShadow: '0 2px 8px #f0f1f2',
        }}
      >
        <Title level={3} style={{ margin: 0 }}>Mini广告墙</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新增广告
        </Button>
      </Header>
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <Row gutter={[16, 16]}>
          {ads.map((ad) => (
            <Col xs={24} sm={12} md={8} lg={6} key={ad.id}>
              <AdCard
                ad={ad}
                onEdit={handleEdit}
                onCopy={handleCopy}
                onDelete={handleDelete}
                onClick={handleClick}
              />
            </Col>
          ))}
        </Row>
      </Content>
      <AdModal
        visible={isModalVisible}
        mode={modalMode}
        initialValues={currentAd}
        onCancel={() => setIsModalVisible(false)}
        onSubmit={handleModalSubmit}
      />
      <VideoPlayerModal
        visible={isVideoModalVisible}
        videoUrl={playingVideoUrl}
        onClose={() => setIsVideoModalVisible(false)}
        onFinish={handleVideoFinish}
      />
    </Layout>
  );
};

export default App;
```

### 步骤 2.7：样式配置

**文件：** `src/App.css`

```css
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
```

### 步骤 2.8：测试前端

```bash
npm run dev
# 访问 http://localhost:5173
# 测试：创建、编辑、删除广告；点击广告检查排序
```

**提交代码：**
```bash
git add src/
git commit -m "前端：完成纯React广告墙（基础任务）"
```

---

## 🔌 第三阶段：后端开发（8-10小时）

### 步骤 3.1：创建 Express 服务器

**文件：** `server/index.js`

```javascript
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'ads.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// 确保上传目录存在
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// 配置 Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// 读取广告数据
const readAds = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data || '[]');
    }
    return [];
  } catch (e) {
    console.error('读取数据失败:', e);
    return [];
  }
};

// 保存广告数据
const saveAds = (ads) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(ads, null, 2));
};

// 计算竞价分数
const calculateScore = (ad) => {
  return ad.price + ad.price * ad.clicks * 0.42;
};

// ====== API 接口 ======

// 1. 获取表单配置
app.get('/api/form-config', (req, res) => {
  const config = [
    {
      field: 'title',
      label: '广告标题',
      component: 'Input',
      rules: [{ required: true, message: '请输入广告标题' }],
    },
    {
      field: 'publisher',
      label: '发布人',
      component: 'Input',
      rules: [{ required: true, message: '请输入发布人' }],
    },
    {
      field: 'content',
      label: '内容文案',
      component: 'TextArea',
      props: { rows: 4 },
      rules: [{ required: true, message: '请输入内容文案' }],
    },
    {
      field: 'landingUrl',
      label: '落地页',
      component: 'Input',
      rules: [
        { required: true, message: '请输入落地页URL' },
        { type: 'url', message: '请输入有效的URL' },
      ],
    },
    {
      field: 'price',
      label: '出价',
      component: 'InputNumber',
      rules: [{ required: true, message: '请输入出价' }],
    },
    {
      field: 'videos',
      label: '上传视频',
      component: 'Upload',
      props: { multiple: true, accept: 'video/*' },
    },
  ];
  res.json(config);
});

// 2. 获取广告列表
app.get('/api/ads', (req, res) => {
  const ads = readAds();
  ads.sort((a, b) => calculateScore(b) - calculateScore(a));
  res.json(ads);
});

// 3. 创建广告
app.post('/api/ads', upload.array('videos'), (req, res) => {
  try {
    const newAd = {
      id: Date.now().toString(),
      title: req.body.title,
      publisher: req.body.publisher,
      content: req.body.content,
      landingUrl: req.body.landingUrl,
      price: parseFloat(req.body.price),
      clicks: 0,
      videoUrls: req.files
        ? req.files.map((f) => `http://localhost:${PORT}/uploads/${f.filename}`)
        : [],
    };

    // 验证
    if (!newAd.title || !newAd.publisher || !newAd.content || !newAd.landingUrl) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    const ads = readAds();
    ads.push(newAd);
    saveAds(ads);
    res.status(201).json(newAd);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. 编辑广告
app.put('/api/ads/:id', upload.array('videos'), (req, res) => {
  try {
    const { id } = req.params;
    const ads = readAds();
    const index = ads.findIndex((a) => a.id === id);

    if (index === -1) {
      return res.status(404).json({ error: '广告未找到' });
    }

    // 保留原有数据，更新字段
    const updatedAd = {
      ...ads[index],
      title: req.body.title,
      publisher: req.body.publisher,
      content: req.body.content,
      landingUrl: req.body.landingUrl,
      price: parseFloat(req.body.price),
    };

    // 如果上传了新视频，追加
    if (req.files && req.files.length > 0) {
      const newUrls = req.files.map((f) => `http://localhost:${PORT}/uploads/${f.filename}`);
      updatedAd.videoUrls = [...(updatedAd.videoUrls || []), ...newUrls];
    }

    ads[index] = updatedAd;
    saveAds(ads);
    res.json(updatedAd);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. 删除广告
app.delete('/api/ads/:id', (req, res) => {
  const { id } = req.params;
  let ads = readAds();
  const initialLength = ads.length;
  ads = ads.filter((a) => a.id !== id);

  if (ads.length === initialLength) {
    return res.status(404).json({ error: '广告未找到' });
  }

  saveAds(ads);
  res.status(204).send();
});

// 6. 点击广告（增加点击数）
app.post('/api/ads/:id/click', (req, res) => {
  const { id } = req.params;
  const ads = readAds();
  const index = ads.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ error: '广告未找到' });
  }

  ads[index].clicks += 1;
  saveAds(ads);
  res.json({ clicks: ads[index].clicks });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`✅ 服务器运行在 http://localhost:${PORT}`);
});
```

### 步骤 3.2：安装后端依赖

```bash
cd server
npm install
cd ..
```

### 步骤 3.3：测试后端

```bash
# 启动后端服务
cd server
node index.js

# 在另一个终端测试 API
curl http://localhost:3001/api/ads
```

**提交代码：**
```bash
git add server/
git commit -m "后端：完成Express服务器和CRUD接口（进阶任务1）"
```

---

## 🔗 第四阶段：前后端连接（2-3小时）

### 步骤 4.1：创建 API 服务层

**文件：** `src/services/api.ts`

```typescript
import type { Ad, FormFieldConfig } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export const fetchFormConfig = async (): Promise<FormFieldConfig[]> => {
  const response = await fetch(`${API_BASE_URL}/form-config`);
  return response.json();
};

export const fetchAds = async (): Promise<Ad[]> => {
  const response = await fetch(`${API_BASE_URL}/ads`);
  return response.json();
};

export const createAd = async (formData: FormData): Promise<Ad> => {
  const response = await fetch(`${API_BASE_URL}/ads`, {
    method: 'POST',
    body: formData,
  });
  return response.json();
};

export const updateAd = async (id: string, formData: FormData): Promise<Ad> => {
  const response = await fetch(`${API_BASE_URL}/ads/${id}`, {
    method: 'PUT',
    body: formData,
  });
  return response.json();
};

export const deleteAd = async (id: string): Promise<void> => {
  await fetch(`${API_BASE_URL}/ads/${id}`, {
    method: 'DELETE',
  });
};

export const clickAd = async (id: string): Promise<{ clicks: number }> => {
  const response = await fetch(`${API_BASE_URL}/ads/${id}/click`, {
    method: 'POST',
  });
  return response.json();
};
```

### 步骤 4.2：修改 App.tsx 使用后端 API

将 `src/App.tsx` 中的 `loadAds` 和 `saveAds` 改为使用后端 API：

```typescript
// 导入 API
import { fetchAds, createAd, updateAd, deleteAd, clickAd } from './services/api';

// 修改 loadAds
const loadAds = async () => {
  try {
    const data = await fetchAds();
    setAds(data);
  } catch (error) {
    message.error('加载广告失败');
  }
};

// 修改 handleModalSubmit
const handleModalSubmit = async (formData: FormData) => {
  try {
    if (modalMode === 'create' || modalMode === 'copy') {
      await createAd(formData);
      message.success('创建成功');
    } else if (modalMode === 'edit' && currentAd) {
      await updateAd(currentAd.id, formData);
      message.success('更新成功');
    }
    setIsModalVisible(false);
    loadAds();
  } catch (error) {
    message.error('操作失败');
  }
};

// 修改 handleDelete
const handleDelete = (ad: Ad) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除广告 "${ad.title}" 吗？`,
    onOk: async () => {
      try {
        await deleteAd(ad.id);
        message.success('删除成功');
        loadAds();
      } catch (error) {
        message.error('删除失败');
      }
    },
  });
};

// 修改 handleClick
const handleClick = async (ad: Ad) => {
  try {
    await clickAd(ad.id);
    loadAds();
  } catch (error) {
    console.error('更新点击数失败', error);
  }

  // 处理视频播放逻辑...
};
```

### 步骤 4.3：启动前后端

```bash
# 终端1：启动后端
cd server
node index.js

# 终端2：启动前端
npm run dev

# 访问 http://localhost:5173 进行测试
```

**提交代码：**
```bash
git add src/
git commit -m "前端：集成后端API服务"
```

---

## 🎬 第五阶段：动态表单渲染（进阶任务3，6-8小时）

### 步骤 5.1：改造 AdModal 支持动态表单

**修改文件：** `src/components/AdModal.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Upload, Button, message, Spin } from 'antd';
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
      setLoading(true);
      fetchFormConfig()
        .then((config) => {
          setFormConfig(config);
          setLoading(false);
        })
        .catch((err) => {
          console.error('加载表单配置失败:', err);
          message.error('加载表单配置失败');
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
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical">
          {formConfig.map((config) => renderFormItem(config))}
        </Form>
      </Spin>
    </Modal>
  );
};

export default AdModal;
```

**提交代码：**
```bash
git add src/components/
git commit -m "前端：实现动态表单渲染（进阶任务3）"
```

---

## 📝 第六阶段：项目文档和优化（4-6小时）

### 步骤 6.1：创建 README.md

**文件：** `README.md` - 参考项目根目录的 README.md

### 步骤 6.2：配置 GitHub Actions 自动部署

**文件：** `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 步骤 6.3：配置 VS Code 任务

**文件：** `.vscode/tasks.json`

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Backend",
      "type": "shell",
      "command": "cd server && node index.js",
      "isBackground": true,
      "group": "build"
    },
    {
      "label": "Start Frontend",
      "type": "shell",
      "command": "npm run dev",
      "isBackground": true,
      "group": "build"
    },
    {
      "label": "Start All",
      "dependsOn": ["Start Backend", "Start Frontend"],
      "group": {
        "kind": "build",
        "isDefault": true
      }
    }
  ]
}
```

**提交代码：**
```bash
git add .github/ .vscode/ README.md
git commit -m "项目：添加文档、CI/CD配置和开发任务"
```

---

## 🧪 第七阶段：测试和验证（3-4小时）

### 步骤 7.1：完整功能测试

**基础功能：**
- [ ] 创建广告
- [ ] 编辑广告
- [ ] 复制广告
- [ ] 删除广告
- [ ] 点击广告（出价排序）

**进阶功能：**
- [ ] 上传视频
- [ ] 播放视频（自动播放）
- [ ] 视频完成自动跳转
- [ ] 动态表单加载
- [ ] 表单验证

### 步骤 7.2：性能优化

- [ ] 清理无用依赖
- [ ] 优化 TypeScript 配置
- [ ] 检查 ESLint 错误
- [ ] 测试响应式设计

### 步骤 7.3：部署测试

```bash
# 构建前端
npm run build

# 测试后端部署（Render / Railway）
# 遵循 README.md 中的部署步骤
```

**提交最终代码：**
```bash
git add .
git commit -m "测试和验证：所有功能完成"
```

---

## 🚀 第八阶段：部署到生产环境（2-4小时）

### 步骤 8.1：部署前端到 GitHub Pages

1. 推送代码到 main 分支
2. 在 GitHub Pages 设置中启用 GitHub Actions
3. 自动构建并部署

### 步骤 8.2：部署后端到云平台

**Render 部署步骤：**

1. 登录 [render.com](https://render.com)
2. 新建 Web Service
3. 连接 GitHub 账户和本仓库
4. 配置参数：
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `node index.js`
5. 得到后端 URL（例如：`https://mini-adwall-backend.onrender.com`）
6. 在 GitHub Secrets 中设置 `VITE_API_BASE_URL`

### 步骤 8.3：验证部署

```bash
# 前端地址
https://[your-username].github.io/mini_adwall/

# 后端地址
https://[your-backend-url].onrender.com/api/ads
```

---

## 📊 学习检查清单

完成以上所有步骤后，你应该掌握了：

### 前端技能
- [ ] React 函数组件和 Hooks
- [ ] TypeScript 类型系统
- [ ] Ant Design UI 组件库
- [ ] 状态管理（useState）
- [ ] 网络请求（fetch API）
- [ ] 响应式设计（Vite + CSS）
- [ ] 表单处理和验证
- [ ] 文件上传

### 后端技能
- [ ] Express.js 服务器搭建
- [ ] RESTful API 设计
- [ ] 中间件使用（CORS、body-parser）
- [ ] 文件上传处理（Multer）
- [ ] 数据持久化（文件 I/O）
- [ ] 错误处理

### 全栈技能
- [ ] 前后端数据通信
- [ ] 环境变量管理
- [ ] Git 版本控制
- [ ] GitHub Actions CI/CD
- [ ] 云平台部署
- [ ] API 文档设计

---

## 📚 额外学习资源

### 推荐阅读
1. [React 官方文档](https://react.dev)
2. [Express.js 指南](https://expressjs.com)
3. [Ant Design 组件库](https://ant.design)
4. [MDN Web Docs](https://developer.mozilla.org)

### 推荐工具
- Postman / Insomnia - API 测试
- VS Code - 代码编辑
- GitHub - 版本控制和部署

---

## 💡 常见问题

**Q1：前后端通信失败？**  
A：检查后端是否启动在 3001 端口，确认 CORS 配置正确。

**Q2：视频无法上传？**  
A：确保 `server/uploads` 目录存在且有写入权限。

**Q3：localStorage 和后端数据冲突？**  
A：改为纯后端 API 后，删除所有 localStorage 相关代码。

**Q4：如何部署到生产环境？**  
A：参考第八阶段的部署步骤，使用 GitHub Actions + Render。

---

## 🎓 预期时间分配

| 阶段 | 预计时间 | 优先级 |
|------|--------|--------|
| 第一阶段：项目初始化 | 1-2小时 | 必须 |
| 第二阶段：前端开发 | 6-8小时 | 必须 |
| 第三阶段：后端开发 | 8-10小时 | 必须 |
| 第四阶段：前后端连接 | 2-3小时 | 必须 |
| 第五阶段：动态表单 | 6-8小时 | 进阶 |
| 第六阶段：文档和配置 | 4-6小时 | 建议 |
| 第七阶段：测试和验证 | 3-4小时 | 建议 |
| 第八阶段：生产部署 | 2-4小时 | 建议 |
| **总计** | **32-45小时** | - |

---

**祝你开发顺利！如有任何问题，请参考项目中的 COMPLETION_REPORT.md 了解完整的实现细节。** 🎉
