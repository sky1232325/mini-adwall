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
