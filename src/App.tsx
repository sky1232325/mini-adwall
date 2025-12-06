import React, { useState, useEffect } from 'react';
import { Layout, Button, Row, Col, message, Modal, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import AdCard from './components/AdCard';
import AdModal from './components/AdModal';
import VideoPlayerModal from './components/VideoPlayerModal';
import type { Ad } from './types';
import { sortAdsByScore } from './utils/ranking';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

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
