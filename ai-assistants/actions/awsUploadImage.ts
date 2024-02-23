import { logger } from "deco/observability/otel/config.ts";
import base64ToBlob from "../utils/blobConversion.ts";
import { Ids } from "../types.ts";
import { AppContext } from "../mod.ts";

const URL_EXPIRATION_SECONDS = 2 * 60 * 60; // 2 hours

export interface AWSUploadImageProps {
  file: string | ArrayBuffer | null;
  ids?: Ids;
}

// TODO(ItamarRocha): Check if possible to upload straight to bucket instead of using presigned url
async function getSignedUrl(
  mimetype: string,
  ctx: AppContext,
): Promise<string> {
  const randomID = crypto.randomUUID();
  const name = `${randomID}.${mimetype.split("/")[1]}`;

  // Get signed URL from S3
  const s3Params = {
    Bucket: ctx.assistantAwsProps?.assistantBucketName.get?.() ?? "",
    Key: name,
    Expires: URL_EXPIRATION_SECONDS,
    ContentType: mimetype,
    ACL: "public-read",
  };

  const uploadURL = await ctx.s3?.getSignedUrlPromise("putObject", s3Params);
  return uploadURL as string;
}

async function uploadFileToS3(presignedUrl: string, data: Blob) {
  const response = await fetch(presignedUrl, { method: "PUT", body: data });
  return response;
}

export default async function awsUploadImage(
  awsUploadImageProps: AWSUploadImageProps,
  _req: Request,
  ctx: AppContext,
) {
  const blobData = base64ToBlob(
    awsUploadImageProps.file,
    "image",
    awsUploadImageProps.ids,
  );
  const uploadURL = await getSignedUrl(blobData.type, ctx);
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
