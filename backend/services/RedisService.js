import Redis from "ioredis";
import { env } from "../core/conf.js";

class RedisService {
  static instance;

  constructor() {
    if (RedisService.instance) {
      return RedisService.instance;
    }
    this.redis = new Redis(env.getRedisUrl());
    this.ready = new Promise((resolve, reject) => {
      this.redis.once("ready", () => {
        console.log("Redis client connection established");
        resolve();
      });
      this.redis.once("error", (e) => {
        console.log(`Falied Redis Connection error error=${e}`);
        reject(e);
      });
    });

    RedisService.instance = this;
  }

  getConection() {
    return this.redis;
  }

  async setCache(key, value, expriesSecond = null) {
    if (typeof value === "object") {
      value = JSON.stringify(value);
    }
    if (expriesSecond) {
      await this.redis.set(key, value, "EX", expriesSecond);
    } else {
      await this.redis.set(key, value);
    }
  }

  async getCache(key) {
    const value = await this.redis.get(key);
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  async delCache(pattern) {
    const keys = await this.redis.keys(pattern);
    if (keys.length) {
      return await this.redis.del(keys);
    }
  }
}

export default new RedisService();
