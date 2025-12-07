# Mini 广告墙

一个极简版的广告投放和管理平台，基于 React + TypeScript + Express 实现的全栈应用。

**在线演示**: [https://miniadwall.1232325.xyz/](https://miniadwall.1232325.xyz/)

## 📊 项目完成度

- ✅ **基础任务**：纯前端版本 mini 广告墙 (100%)
- ✅ **进阶任务 1**：前后端分离版本 (100%)
- ✅ **进阶任务 2**：视频上传和播放功能 (100%)
- ✅ **进阶任务 3**：动态表单渲染 (100%)

## ✨ 核心功能

### 广告管理
- 📝 **创建广告** - 支持表单填写和多视频上传
- ✏️ **编辑广告** - 在线修改广告信息
- 📋 **复制广告** - 快速复制现有广告
- 🗑️ **删除广告** - 删除不需要的广告及关联文件

### 竞价排名系统
- 🏆 **智能排序** - 基于出价和点击数的竞价算法
- 📈 **实时更新** - 每次点击后自动重新排序
- 💰 **竞价公式**: `score = price + (price × clicks × 0.42)`

### 视频功能
- 🎬 **多视频上传** - 每个广告支持上传多个视频
- ▶️ **视频播放器** - HTML5 原生播放器
- 🔄 **自动跳转** - 播放完成后自动跳转到落地页
- 🎲 **随机播放** - 多视频时随机选择播放

### 动态表单
- ⚙️ **配置驱动** - 表单完全由后端配置决定
- 🎨 **动态渲染** - 根据配置自动生成表单字段
- ✅ **智能验证** - 支持多种验证规则（必填、长度、类型等）
- 🔧 **灵活扩展** - 无需修改代码即可添加新字段

## 🛠️ 技术栈

### 前端
- **框架**: React 19 + TypeScript 5.9
- **UI 库**: Ant Design 6.0
- **构建工具**: Vite 7.2
- **状态管理**: React Hooks (useState, useEffect)
- **HTTP 客户端**: Fetch API

### 后端
- **运行时**: Node.js 18+
- **框架**: Express 5.2
- **文件上传**: Multer 2.0
- **跨域处理**: CORS 2.8
- **数据存储**: JSON 文件 (可扩展为数据库)

### 部署
- **Web 服务器**: Nginx
- **进程管理**: PM2
- **HTTPS**: Let's Encrypt SSL
- **服务器**: 宝塔面板

## 🚀 快速开始

### 环境要求
- Node.js >= 16
- npm >= 8

### 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/sky1232325/mini-adwall.git
cd mini-adwall

# 2. 安装依赖
npm install
cd server && npm install && cd ..

# 3. 启动后端 (终端1)
cd server
npm start
# 后端运行在 http://localhost:3001

# 4. 启动前端 (终端2)
npm run dev
# 前端运行在 http://localhost:5173
```

访问 [http://localhost:5173](http://localhost:5173) 查看应用

### 生产部署

详细的部署步骤请参考 [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)

```bash
# 构建前端
npm run build

# 使用 PM2 启动后端
cd server
pm2 start index.js --name mini-adwall-server

# 配置 Nginx 反向代理（参考部署文档）
```

## 📁 项目结构

```
mini-adwall/
├── src/                          # 前端源代码
│   ├── components/               # React 组件
│   │   ├── AdCard.tsx           # 广告卡片组件
│   │   ├── AdModal.tsx          # 动态表单弹窗
│   │   └── VideoPlayerModal.tsx # 视频播放器
│   ├── services/
│   │   └── api.ts               # API 接口封装
│   ├── utils/
│   │   └── ranking.ts           # 竞价排名算法
│   ├── types.ts                 # TypeScript 类型定义
│   ├── App.tsx                  # 主应用组件
│   └── main.tsx                 # 应用入口
├── server/                       # 后端源代码
│   ├── index.js                 # Express 服务器
│   ├── ads.json                 # 广告数据存储
│   ├── uploads/                 # 视频文件目录
│   └── package.json             # 后端依赖
├── public/                       # 静态资源
├── dist/                         # 构建产物
├── package.json                  # 前端依赖
├── vite.config.ts               # Vite 配置
├── tsconfig.json                # TypeScript 配置
└── README.md                     # 项目文档
```

## 🎯 核心实现

### 竞价排名算法

```typescript
// 计算广告竞价分数
const calculateScore = (ad: Ad): number => {
  return ad.price + (ad.price * ad.clicks * 0.42);
};

// 按分数降序排序
const sortAdsByScore = (ads: Ad[]): Ad[] => {
  return [...ads].sort((a, b) => calculateScore(b) - calculateScore(a));
};
```

**示例**:
- 广告 A: 出价 5 元, 点击 10 次 → score = 5 + (5 × 10 × 0.42) = **26**
- 广告 B: 出价 10 元, 点击 2 次 → score = 10 + (10 × 2 × 0.42) = **18.4**
- 结果: 广告 A 排名更靠前

### 动态表单渲染

后端配置示例:
```json
{
  "field": "title",
  "label": "广告标题",
  "component": "Input",
  "rules": [
    { "required": true, "message": "请输入广告标题" },
    { "max": 50, "message": "最多50个字符" }
  ]
}
```

前端自动渲染:
```typescript
const renderFormField = (config: FormFieldConfig) => (
  <Form.Item label={config.label} name={config.field} rules={config.rules}>
    {config.component === 'Input' && <Input />}
    {config.component === 'TextArea' && <Input.TextArea rows={4} />}
    {config.component === 'InputNumber' && <InputNumber />}
  </Form.Item>
);
```

## 📡 API 接口

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/form-config` | 获取表单配置 |
| GET | `/api/ads` | 获取广告列表 |
| POST | `/api/ads` | 创建广告 |
| PUT | `/api/ads/:id` | 更新广告 |
| DELETE | `/api/ads/:id` | 删除广告 |
| POST | `/api/ads/:id/click` | 增加点击数 |
| POST | `/api/upload` | 上传文件 |
| GET | `/api/health` | 健康检查 |

详细的 API 文档请参考源代码注释。

## 🎨 功能演示

### 1. 创建广告
1. 点击右上角"新增广告"按钮
2. 系统自动从后端加载表单配置
3. 填写广告信息（标题、发布人、内容、落地页、出价）
4. 可选：上传多个视频文件
5. 点击"确定"提交

### 2. 点击广告
- **有视频**: 播放视频 → 自动跳转落地页
- **无视频**: 直接跳转落地页
- 同时点击数 +1，列表自动重新排序

### 3. 编辑/复制/删除
- **编辑**: 修改现有广告信息
- **复制**: 快速创建相似广告
- **删除**: 删除广告及其关联的视频文件

## 📈 性能优化

- ✅ 静态资源缓存（图片 30 天，JS/CSS 12 小时）
- ✅ Gzip 压缩
- ✅ HTTP/2 + QUIC 支持
- ✅ CDN 友好的资源组织
- ✅ 懒加载和代码分割建议

## 🔒 安全特性

- ✅ HTTPS 强制加载 (HSTS)
- ✅ CORS 跨域保护
- ✅ 文件上传大小限制（100MB）
- ✅ 文件类型验证
- ✅ SQL 注入防护（文件存储方案）
- ✅ XSS 防护（React 自动转义）


## 👨‍💻 作者

**sky1232325**
- GitHub: [@sky1232325](https://github.com/sky1232325)
- Email: liuchun1232325@outlook.com

## 🙏 致谢

- [React](https://react.dev/) - 前端框架
- [Ant Design](https://ant.design/) - UI 组件库
- [Vite](https://vitejs.dev/) - 构建工具
- [Express](https://expressjs.com/) - 后端框架
- 字节跳动 - 项目灵感来源

## 📚 相关文档

- [项目开发文档](./DEVELOPMENT.md) - 详细的开发文档
- [部署指南](./IMPLEMENTATION_GUIDE.md) - 宝塔面板部署教程
- [API 文档](./server/index.js) - 后端接口说明

---

**在线演示**: [https://miniadwall.1232325.xyz/](https://miniadwall.1232325.xyz/)