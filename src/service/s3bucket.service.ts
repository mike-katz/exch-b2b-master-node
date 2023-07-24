import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import httpStatus from "http-status";

import s3configs from "@/config/config";
import ApiError from "@/utils/ApiError";
import messages from "@/utils/messages";

const { bucketName, proposalBucket, accessKey, secretKey, region } = s3configs;
const s3bucket = new S3Client({
  region,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
});
const S3BucketService = {
  async uploadFile(
    buffer: string | Buffer,
    fileName: string,
    isProposal: boolean,
    mimetype: string
  ): Promise<{ data: { Key: string } }> {
    const bucket: string = isProposal ? proposalBucket : bucketName;
    const params = {
      Bucket: bucket,
      Key: fileName,
      Body: buffer,
      ContentType: mimetype,
    };
    const command = new PutObjectCommand(params);
    return new Promise((resolve, reject) => {
      s3bucket.send(command, err => {
        if (err) reject(err);
        const data: { Key: string } = { Key: "" };
        data.Key = params.Key;
        resolve({ data });
      });
    });
  },

  async getFile(key: string): Promise<string> {
    const params = {
      Bucket: bucketName,
      Key: key,
    };
    const command = new GetObjectCommand(params);
    // Get the bucket name from the command
    const bucket = command.input.Bucket;
    return `https://${
      bucket as string
    }.s3.${region}.amazonaws.com/${encodeURIComponent(key)}`;
  },

  async deleteFile(key: string): Promise<void> {
    const params = {
      Bucket: bucketName,
      Key: key,
    };
    const command = new DeleteObjectCommand(params);
    s3bucket
      .send(command)
      .then(
        data =>
          // console.log(`File delete successfully. ETag: ${JSON.stringify(data)}`);
          data
      )
      .catch((error: Error) => {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, {
          msg: messages.SOMETHING_WENT_WRONG,
          message: error.message,
        });
      });
  },
};

export default S3BucketService;
