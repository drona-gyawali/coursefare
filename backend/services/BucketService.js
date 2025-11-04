import { S3, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../core/conf.js";
import { constructFileUrl } from "../utils.js";

class Bucket {
  static instance;

  constructor() {
    if (Bucket.instance) return Bucket.instance;

    this.Client = new S3({
      endpoint: env.getEndpointBucket(),
      credentials: {
        accessKeyId: env.getAccessKeyBucket(),
        secretAccessKey: env.getSecretAcessBucket(),
      },
      forcePathStyle: true,
    });

    this.generatePresignedUrl = this.generatePresignedUrl.bind(this);
    Bucket.instance = this;
  }

  async generatePresignedUrl(req, filename) {
    try {
      if (!req.user || !req.user.userId) {
        return { success: false, message: "Unauthorized user" };
      }

      if (!filename) {
        return { success: false, message: "Filename not given" };
      }

      const key = `${req.user.userId}-${filename}`;
      const command = new PutObjectCommand({
        Bucket: env.getBucketName(),
        Key: key,
      });

      const presignedUrl = await getSignedUrl(this.Client, command, {
        expiresIn: 3600,
      });

      const Objecturl = constructFileUrl(key);

      return {
        presignedUrl,
        Objecturl,
      };
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }
}

export default new Bucket();
