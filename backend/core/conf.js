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

  getAccessKeyBucket() {
    return process.env.STORJ_ACCESS_KEY_ID;
  }

  getSecretAcessBucket() {
    return process.env.STORJ_SECRET_ACCESS_KEY;
  }

  getEndpointBucket() {
    return process.env.STORJ_ENDPOINT;
  }

  getBucketName() {
    return process.env.STORJ_BUCKET_NAME;
  }

  getObejctEndpointBucket() {
    return process.env.STORJ_BUCKET_OBJECT_URL;
  }
}

export const env = new EnvLoad();
