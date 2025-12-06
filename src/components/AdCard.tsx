import React from 'react';
import { Card, Button, Space, Typography } from 'antd';
import { EditOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Ad } from '../types';

const { Text } = Typography;

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
            <p>发布者:{ad.publisher}</p>
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
