import { RateLimiterRedis } from "rate-limiter-flexible";
import RedisService from "../services/RedisService.js";

class RateLimit {
  static instance;

  constructor() {
    if (RateLimit.instance) return RateLimit.instance;

    this.connection = RedisService.getConection();
    this.limiter = new RateLimiterRedis({
      storeClient: this.connection,
      points: 100,
      duration: 60,
      keyPrefix: "rate_limit",
    });

    this.rateLimiter = this.rateLimiter.bind(this);
    this.rateLimiterUser = this.rateLimiterUser.bind(this);

    RateLimit.instance = this;
  }

  async rateLimiter(req, res, next) {
    try {
      const key = req.ip || req.connection.remoteAddress;
      await this.limiter.consume(key);
      next();
    } catch (error) {
      if (error && typeof error.msBeforeNext === "number") {
        return res.status(429).json({
          success: false,
          message: "Too many requests, please try again later.",
          retryAfter: Math.ceil(error.msBeforeNext / 1000),
        });
      }
      console.error("Rate limiter error (allowing request):", error);
      next();
    }
  }

  async rateLimiterUser(req, res, next) {
    try {
      const key = req.user && req.user.userId ? req.user.userId : req.ip;
      await this.limiter.consume(key);
      next();
    } catch (error) {
      if (error && typeof error.msBeforeNext === "number") {
        return res.status(429).json({
          success: false,
          message: "Too many requests, please try again later.",
          retryAfter: Math.ceil(error.msBeforeNext / 1000),
        });
      }
      console.error("Rate limiter error (allowing request):", error);
      next();
    }
  }
}

export default new RateLimit();
