import base64ToBlob from "../utils/blobConversion.ts";
import { AssistantIds } from "../types.ts";
import { AppContext } from "../mod.ts";
import { logger } from "@deco/deco/o11y";
import {
  ATTR_ASSISTANT_ID,
  ATTR_ASSISTANT_OPERATION,
  stats,
} from "../observability.ts";
export interface AWSUploadImageProps {
  file: string | ArrayBuffer | null;
  assistantIds?: AssistantIds;
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
// TODO(ItamarRocha): Rate limit
export default async function awsUploadImage(
  awsUploadImageProps: AWSUploadImageProps,
  _req: Request,
  ctx: AppContext,
) {
  const assistantId = awsUploadImageProps.assistantIds?.assistantId;
  const threadId = awsUploadImageProps.assistantIds?.threadId;
  const blobData = base64ToBlob(
    awsUploadImageProps.file,
    "image",
    awsUploadImageProps.assistantIds,
  );
  const uploadURL = await getSignedUrl(blobData.type, ctx);
  const uploadResponse = await uploadFileToS3(uploadURL, blobData);
  if (!uploadResponse.ok) {
    stats.errors.add(1, {
      [ATTR_ASSISTANT_OPERATION]: "aws_upload",
      [ATTR_ASSISTANT_ID]: assistantId,
    });
    throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
  }
  logger.info({
    assistantId: assistantId,
    threadId: threadId,
    context: "awsUploadImage",
    response: JSON.stringify(uploadResponse),
    uploadUrl: uploadURL,
  });
  const imageUrl = new URL(uploadURL);
  return `${imageUrl.origin}${imageUrl.pathname}`;
}
