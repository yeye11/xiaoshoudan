/**
 * 设备检测工具函数
 * 基于 User-Agent 和屏幕宽度的综合判断
 */

/**
 * 检测是否为移动设备
 * @returns boolean - 是否为移动设备
 */
export function isMobileDevice(): boolean {
  const userAgent = navigator.userAgent;
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 768;

  // 只有在真实移动设备 OR 开发者工具模拟移动设备时才认为是移动设备
  return isMobileUA || (isSmallScreen && userAgent.includes('Chrome'));
}

