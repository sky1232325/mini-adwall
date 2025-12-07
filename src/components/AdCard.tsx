import React from 'react';
import { Card, Button, Typography, Dropdown } from 'antd';
import {
  EditOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownOutlined,
} from '@ant-design/icons';
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
  const actionItems = [
    {
      key: 'edit',
      label: '编辑广告',
      icon: <EditOutlined />,
      onClick: () => onEdit(ad),
    },
    {
      key: 'copy',
      label: '复制广告',
      icon: <CopyOutlined />,
      onClick: () => onCopy(ad),
    },
    {
      key: 'delete',
      label: '删除广告',
      icon: <DeleteOutlined />,
      onClick: () => onDelete(ad),
    },
  ];

  return (
    <Card
      style={{ cursor: 'pointer', height: '100%', position: 'relative' }}
      onClick={() => onClick(ad)}
    >
      <div
        style={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          menu={{
            items: actionItems,
            onClick: ({ key, domEvent }) => {
              domEvent.stopPropagation();
              const action = actionItems.find((item) => item.key === key);
              action?.onClick();
            },
          }}
        >
          <Button type="primary">
            操作 <DownOutlined />
          </Button>
        </Dropdown>
      </div>
      <Card.Meta
        title={ad.title}
        description={
          <div>
            <p>发布者:{ad.publisher}</p>
            <p>{ad.content}</p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 24,
              }}
            >
              <Text type="danger">热度：{ad.clicks}</Text>
              <Text strong>出价：{ad.price}</Text>
            </div>
          </div>
        }
      />
    </Card>
  );
};

export default AdCard;
