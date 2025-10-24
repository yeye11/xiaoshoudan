/**
 * CacheManager - 数据缓存管理工具
 * 
 * 功能：
 * - 实现内存缓存策略
 * - 支持 TTL（生存时间）
 * - 减少重复的 localStorage 读取
 * - 提高数据访问速度
 */

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

export class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 默认 5 分钟

  /**
   * 获取缓存数据
   * @param key 缓存键
   * @returns 缓存的值，如果过期或不存在则返回 null
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // 检查是否过期
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * 设置缓存数据
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 生存时间（毫秒），默认 5 分钟
   */
  set<T>(key: string, value: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * 检查缓存是否存在且未过期
   * @param key 缓存键
   * @returns 是否有效
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * 删除指定缓存
   * @param key 缓存键
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   * @returns 缓存条目数
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 清理过期的缓存
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * 获取或设置缓存（如果不存在则调用 getter 函数）
   * @param key 缓存键
   * @param getter 获取数据的函数
   * @param ttl 生存时间
   * @returns 缓存的值
   */
  getOrSet<T>(key: string, getter: () => T, ttl: number = this.defaultTTL): T {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = getter();
    this.set(key, value, ttl);
    return value;
  }
}

// 创建全局缓存实例
export const globalCache = new CacheManager();

/**
 * 定期清理过期缓存（每分钟执行一次）
 */
if (typeof window !== 'undefined') {
  setInterval(() => {
    globalCache.cleanup();
  }, 60 * 1000);
}

