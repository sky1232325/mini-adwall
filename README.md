# Mini广告墙 开发文档

## 项目概述
- 目标：极简广告墙，支持广告 CRUD、竞价排序、视频上传/播放、动态表单配置。
- 技术栈：React 19 + TypeScript + Vite、Ant Design 6、Express、Multer、CORS、文件存储。
- 状态：基础功能与三项进阶任务（视频、多视频上传、动态表单）均已完成。

## 功能清单
- 广告：创建、编辑、复制、删除。
- 竞价排序：`score = price + price * clicks * 0.42`，后端统一排序返回。
- 点击计数：点击广告后 +1 并刷新列表。
- 视频：多文件上传，随机播放一条，播放结束跳转落地页。
- 动态表单：表单项由后端 `/api/form-config` 下发并渲染。
- 本地化：操作按钮与弹窗均为中文。

## 目录结构
```
miniAdWall_rebuild/
├─ src/
│  ├─ components/AdCard.tsx         # 广告卡片、操作下拉
│  ├─ components/AdModal.tsx        # 动态表单弹窗+上传
│  ├─ components/VideoPlayerModal.tsx
│  ├─ services/api.ts               # 前端 API 封装
│  ├─ utils/ranking.ts              # 排序算法
│  ├─ types.ts                      # Ad / FormFieldConfig 类型
│  ├─ App.tsx, main.tsx, App.css
├─ server/
│  ├─ index.js                      # Express API + Multer
│  └─ uploads/                      # 视频文件存储
├─ package.json, tsconfig.*, vite.config.ts
```

## 快速开始
```bash
# 安装依赖
npm install

# 启动后端
cd server
node index.js   # http://localhost:3001

# 启动前端（新终端）
cd ..
npm run dev     # http://localhost:5173
```

## 环境变量
- 当前前端 `API_BASE` 写死为 `http://localhost:3001/api`（见 `src/services/api.ts`）。
- 部署时请改为环境变量（如 `VITE_API_BASE_URL`），并在 `api.ts` 中读取。

## 前端说明
- UI：Ant Design 6；主要用 Modal、Upload、Form、Input、InputNumber、Dropdown。
- 状态：React hooks 本地状态；数据全量来自后端 API。
- 动态表单：`AdModal` 请求 `/api/form-config` 并按配置渲染；上传字段独立处理。
- 视频播放：如有 `videoUrls` 则随机取一条播放，结束后跳转 `landingUrl`。
- 排序：使用后端排序结果直接展示。

## 后端说明（`server/index.js`）
- 依赖：express, cors, body-parser, multer, fs, path。
- 数据：`ads.json` 文件存储；视频落盘 `uploads/`，静态路径 `/uploads/<file>`。
- 路由：
  - `GET /api/form-config` 获取表单配置。
  - `GET /api/ads` 获取列表（已按竞价分数排序）。
  - `POST /api/ads` 创建广告（支持多视频）。
  - `PUT /api/ads/:id` 更新广告（可追加视频）。
  - `DELETE /api/ads/:id` 删除广告。
  - `POST /api/ads/:id/click` 点击+1。

## 数据结构
```ts
// Ad
{
  id: string;
  title: string;
  publisher: string;
  content: string;
  landingUrl: string;
  price: number;
  clicks: number;
  videoUrls?: string[];
  createdAt?: string;
}

// FormFieldConfig（后端下发）
{
  field: string;
  label: string;
  component: 'Input' | 'TextArea' | 'InputNumber' | 'Upload';
  props?: Record<string, any>;
  rules?: any[]; // 兼容后端返回的校验
}
```

## 关键流程
- 动态表单：
  1) 弹窗开启 → 请求 `/api/form-config`；
  2) 按配置渲染表单；
  3) 提交：非上传字段写入 FormData，上传文件逐个 append `videos`；
  4) 调用创建/更新 API，成功后刷新列表。
- 视频上传/播放：
  1) Upload 选择文件，`beforeUpload={() => false}` 阻止自动传；
  2) 提交时随 FormData 发送，Multer 落盘并返回可访问 URL；
  3) 点击广告随机播放一条，播放结束跳转落地页。

## 测试要点
- CRUD：创建/编辑/复制/删除成功并刷新列表。
- 排序：调价或点击后顺序随分数变化。
- 点击：点击计数 +1 并实时展示。
- 上传：多视频成功上传且可播放。
- 动态表单：配置字段正确渲染，校验按配置生效。
- 本地化：操作/弹窗按钮均为中文。

## 部署建议
### 后端（Render / Railway）
- 环境变量：可选 `PORT`（默认 3001）。
- 持久化：`uploads/` 为本地存储，免费方案重启会丢失；如需持久化请挂载卷或换对象存储。
- CORS：允许前端域名；示例 `origin` 添加 Vercel / GitHub Pages 域。
- 部署产出：`https://<backend-domain>/api` 作为 API Base，`https://<backend-domain>/uploads/<file>` 提供视频。

### 前端（Vercel / GitHub Pages）
- 环境变量：在构建时设置 `VITE_API_BASE_URL=https://<backend-domain>/api`。
- 构建：`npm run build`，产出 `dist/`。
- 部署：
  - Vercel：导入 repo，设置环境变量，选择 `npm run build` + `dist`。
  - GitHub Pages：将 `dist` 推到 `gh-pages` 分支或用 Actions 自动部署。

### 验收与可访问链接
- 后端示例：`https://your-backend.example.com/api`（请替换为实际 Render/Railway 域名）。
- 前端示例：`https://your-frontend.example.com`（请替换为实际 Vercel/Pages 域名）。
- 验收 checklist：CRUD、上传与播放、动态表单加载、跨域请求、`/uploads` 资源可访问。

## 后续优化
- 将 `rules` 收敛为 antd `Rule[]` 类型并做枚举映射。
- 统一读取环境变量，去除 API 硬编码。
- 增加上传大小/类型限制提示、错误边界和加载骨架。
- 补充自动化测试与 CI/CD（GitHub Actions），可添加 VS Code tasks 便捷启动。
