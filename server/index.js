const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 加载环境变量（可选）
try {
  require('dotenv').config();
} catch (e) {
  console.log('dotenv not installed, using default environment variables');
}

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '127.0.0.1';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');

// 表单配置（可扩展/替换为数据库读取）
const formConfig = [
  {
    field: 'title',
    label: '广告标题',
    component: 'Input',
    rules: [
      { required: true, message: '请输入广告标题' },
      { max: 50, message: '标题不超过50字符' }
    ]
  },
  {
    field: 'publisher',
    label: '发布人',
    component: 'Input',
    rules: [
      { required: true, message: '请输入发布人' },
      { max: 30, message: '发布人不超过30字符' }
    ]
  },
  {
    field: 'content',
    label: '内容文案',
    component: 'TextArea',
    props: { rows: 4 },
    rules: [
      { required: true, message: '请输入内容文案' },
      { max: 200, message: '内容不超过200字符' }
    ]
  },
  {
    field: 'landingUrl',
    label: '落地页',
    component: 'Input',
    rules: [
      { required: true, message: '请输入落地页URL' },
      { type: 'url', message: '请输入有效的URL' }
    ]
  },
  {
    field: 'price',
    label: '出价',
    component: 'InputNumber',
    props: { min: 0, style: { width: '100%' } },
    rules: [
      { required: true, message: '请输入出价' }
    ]
  },
  {
    field: 'videoUrls',
    label: '上传视频',
    component: 'Upload',
    props: { accept: 'video/*', multiple: true },
    rules: []
  }
];

console.log(`[${new Date().toISOString()}] Starting server...`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Upload directory: ${UPLOAD_DIR}`);
console.log(`CORS origin: ${CORS_ORIGIN}`);

// 配置 multer 用于文件上传
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log(`Created upload directory: ${UPLOAD_DIR}`);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // 获取文件扩展名
    const ext = path.extname(file.originalname);
    // 使用 UUID 或 uniqueSuffix 作为文件名，避免中文文件名问题
    cb(null, 'video-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || 52428800) // 50MB default
  }
});

// 中间件
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// 静态文件服务
app.use('/uploads', express.static(UPLOAD_DIR));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============ API 路由 ============

// 动态表单配置
app.get('/api/form-config', (req, res) => {
  res.json(formConfig);
});

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 上传接口
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({
      success: true,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// 广告接口 - 读取 ads.json 文件
app.get('/api/ads', (req, res) => {
  try {
    const adsPath = path.join(__dirname, 'ads.json');
    const adsData = fs.readFileSync(adsPath, 'utf8');
    const ads = JSON.parse(adsData);
    res.json(ads);
  } catch (error) {
    console.error('Error reading ads:', error);
    res.status(500).json({ error: 'Failed to read ads', details: error.message });
  }
});

// 辅助函数：读写 ads.json
const getAds = () => {
  const adsPath = path.join(__dirname, 'ads.json');
  const adsData = fs.readFileSync(adsPath, 'utf8');
  return JSON.parse(adsData);
};

const saveAds = (ads) => {
  const adsPath = path.join(__dirname, 'ads.json');
  fs.writeFileSync(adsPath, JSON.stringify(ads, null, 2), 'utf8');
};

// 创建广告 - POST /api/ads
app.post('/api/ads', upload.array('videoUrls', 10), (req, res) => {
  try {
    const ads = getAds();
    const { title, publisher, content, landingUrl, price } = req.body;
    
    const videoUrls = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        videoUrls.push(`/uploads/${file.filename}`);
      });
    }

    const newAd = {
      id: Date.now().toString(),
      title: title || '',
      publisher: publisher || '',
      content: content || '',
      landingUrl: landingUrl || '',
      price: parseFloat(price) || 0,
      clicks: 0,
      videoUrls: videoUrls
    };

    ads.push(newAd);
    saveAds(ads);
    res.json(newAd);
  } catch (error) {
    console.error('Create ad error:', error);
    res.status(500).json({ error: 'Failed to create ad', details: error.message });
  }
});

// 更新广告 - PUT /api/ads/:id
app.put('/api/ads/:id', upload.array('videoUrls', 10), (req, res) => {
  try {
    const ads = getAds();
    const { id } = req.params;
    const { title, publisher, content, landingUrl, price } = req.body;
    
    const adIndex = ads.findIndex(a => a.id === id);
    if (adIndex === -1) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    const videoUrls = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        videoUrls.push(`/uploads/${file.filename}`);
      });
    } else if (ads[adIndex].videoUrls) {
      // 保留原有视频
      videoUrls.push(...ads[adIndex].videoUrls);
    }

    ads[adIndex] = {
      ...ads[adIndex],
      title: title || ads[adIndex].title,
      publisher: publisher || ads[adIndex].publisher,
      content: content || ads[adIndex].content,
      landingUrl: landingUrl || ads[adIndex].landingUrl,
      price: parseFloat(price) || ads[adIndex].price,
      videoUrls: videoUrls.length > 0 ? videoUrls : ads[adIndex].videoUrls
    };

    saveAds(ads);
    res.json(ads[adIndex]);
  } catch (error) {
    console.error('Update ad error:', error);
    res.status(500).json({ error: 'Failed to update ad', details: error.message });
  }
});

// 删除广告 - DELETE /api/ads/:id
app.delete('/api/ads/:id', (req, res) => {
  try {
    const ads = getAds();
    const { id } = req.params;
    
    const filteredAds = ads.filter(a => a.id !== id);
    if (filteredAds.length === ads.length) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    saveAds(filteredAds);
    res.json({ success: true, message: 'Ad deleted successfully' });
  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json({ error: 'Failed to delete ad', details: error.message });
  }
});

// 点赞接口 - POST /api/ads/:id/click
app.post('/api/ads/:id/click', (req, res) => {
  try {
    const ads = getAds();
    const { id } = req.params;
    
    const adIndex = ads.findIndex(a => a.id === id);
    if (adIndex === -1) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    ads[adIndex].clicks = (ads[adIndex].clicks || 0) + 1;
    saveAds(ads);
    res.json({ clicks: ads[adIndex].clicks });
  } catch (error) {
    console.error('Click ad error:', error);
    res.status(500).json({ error: 'Failed to click ad', details: error.message });
  }
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()}:`, err);
  res.status(err.status || 500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Unknown error'
  });
});

// ============ 启动服务器 ============
app.listen(PORT, HOST, () => {
  console.log(`✓ Server is running on http://${HOST}:${PORT}`);
  console.log(`✓ API base: http://${HOST}:${PORT}/api`);
  console.log(`✓ Uploads: http://${HOST}:${PORT}/uploads`);
  console.log(`✓ Ready to accept connections...`);
});
