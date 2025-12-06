import type { Ad } from '../types';

// 竞价公式：出价 + (出价 * 点击数 * 0.42)
export const calculateScore = (ad: Ad): number => {
  return ad.price + (ad.price * ad.clicks * 0.42);
};

// 排序函数
export const sortAdsByScore = (ads: Ad[]): Ad[] => {
  return [...ads].sort((a, b) => calculateScore(b) - calculateScore(a));
};
