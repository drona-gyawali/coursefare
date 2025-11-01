import dotenv from "dotenv";

dotenv.config({ path: ".env", quiet: true });

class EnvLoad {
  getConnectionString() {
    return process.env.DBURL;
  }

  getJwtSecret() {
    return process.env.JWTSECRET;
  }

  getPort() {
    return process.env.PORT;
  }

  getRedisUrl() {
    return process.env.REDISURL;
  }

  getStripeSecretKey() {
    return process.env.STRIPESECERT;
  }

  getStripeWebhookSecret() {
    return process.env.STRIPE_WEBHOOK_SECRET;
  }

  getEmailpass() {
    return process.env.BREVO_PASS;
  }

  getEmail() {
    return process.env.BREVO_EMAIL;
  }

  getemailPort() {
    return process.env.BREVO_PORT;
  }

  getemailhost() {
    return process.env.BREVO_HOST;
  }
}

export const env = new EnvLoad();
