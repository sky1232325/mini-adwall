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

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(UPLOADS_DIR));

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

const saveAds = (ads) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(ads, null, 2));
};

const calculateScore = (ad) => {
    return ad.price + ad.price * ad.clicks * 0.42;
};

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

app.get('/api/ads', (req, res) => {
    const ads = readAds();
    ads.sort((a, b) => calculateScore(b) - calculateScore(a));
    res.json(ads);
});

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

app.put('/api/ads/:id', upload.array('videos'), (req, res) => {
    try {
        const { id } = req.params;
        const ads = readAds();
        const index = ads.findIndex((a) => a.id === id);

        if (index === -1) {
            return res.status(404).json({ error: '广告未找到' });
        }

        const updatedAd = {
            ...ads[index],
            title: req.body.title,
            publisher: req.body.publisher,
            content: req.body.content,
            landingUrl: req.body.landingUrl,
            price: parseFloat(req.body.price),
        };

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