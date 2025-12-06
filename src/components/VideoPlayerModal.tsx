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
      cancelText="取消"
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
