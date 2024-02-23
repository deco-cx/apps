import AWS from "https://esm.sh/aws-sdk";
import { logger } from "deco/observability/otel/config.ts";
import base64ToBlob from "../utils/blobConversion.ts";
import { Ids } from "../types.ts";

const assistantBucketName = Deno.env.get("ASSISTANT_BUCKET_NAME")!;
const assistantBucketRegion = Deno.env.get("ASSISTANT_BUCKET_REGION")!;
const awsAccessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID")!;
const awsSecretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY")!;

const URL_EXPIRATION_SECONDS = 2 * 60 * 60; // 2 hours

export interface AWSUploadImageProps {
  file: string | ArrayBuffer | null;
  ids?: Ids;
}

const s3 = new AWS.S3({
  region: assistantBucketRegion,
  accessKeyId: awsAccessKeyId,
  secretAccessKey: awsSecretAccessKey,
});

// TODO(ItamarRocha): Check if possible to upload straight to bucket instead of using presigned url
async function getSignedUrl(mimetype: string): Promise<string> {
  const randomID = crypto.randomUUID();
  const name = `${randomID}.${mimetype.split("/")[1]}`;

  // Get signed URL from S3
  const s3Params = {
    Bucket: assistantBucketName,
    Key: name,
    Expires: URL_EXPIRATION_SECONDS,
    ContentType: mimetype,
    ACL: "public-read",
  };

  const uploadURL = await s3.getSignedUrlPromise("putObject", s3Params);
  return uploadURL;
}

async function uploadFileToS3(presignedUrl: string, data: Blob) {
  const response = await fetch(presignedUrl, { method: "PUT", body: data });
  return response;
}

export default async function awsUploadImage(
  awsUploadImageProps: AWSUploadImageProps,
) {
  const blobData = base64ToBlob(
    awsUploadImageProps.file,
    "image",
    awsUploadImageProps.ids,
  );
  const uploadURL = await getSignedUrl(blobData.type);
  const uploadResponse = await uploadFileToS3(uploadURL, blobData);

  if (!uploadResponse.ok) {
    logger.error(`${
      JSON.stringify({
        assistantId: awsUploadImageProps.ids?.assistantId,
        threadId: awsUploadImageProps.ids?.threadId,
        context: "awsUploadImage",
        error: `Failed to upload file: ${uploadResponse.statusText}`,
      })
    }`);
    throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
  }
  logger.info({
    assistantId: awsUploadImageProps.ids?.assistantId,
    threadId: awsUploadImageProps.ids?.threadId,
    context: "awsUploadImage",
    subcontext: "uploadResponse",
    response: JSON.stringify(uploadResponse),
    uploadUrl: uploadURL,
  });
  const imageUrl = new URL(uploadURL);
  return `${imageUrl.origin}${imageUrl.pathname}`;
}
