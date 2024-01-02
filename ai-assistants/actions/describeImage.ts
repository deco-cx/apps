import OpenAI from "https://deno.land/x/openai@v4.24.1/mod.ts";
import AWS from "https://esm.sh/aws-sdk";

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") || "" });

// TODO(ItamarRocha): Move AWS code to another action
const bucketName = Deno.env.get("UPLOAD_BUCKET")!;
const awsRegion = Deno.env.get("AWS_REGION")!;
const awsAccessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID")!;
const awsSecretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY")!;

const URL_EXPIRATION_SECONDS = 1000;

const s3 = new AWS.S3({
  region: awsRegion,
  accessKeyId: awsAccessKeyId,
  secretAccessKey: awsSecretAccessKey,
});

export interface DescribeImageProps {
  file: string;
}

// TODO(ItamarRocha): Check if possible to upload straight to bucket instead of using presigned url
async function getSignedUrl(mimetype: string): Promise<string> {
  const randomID = Number(Math.random() * 10000000);
  const name = `${randomID}.${mimetype.split("/")[1]}`;

  // Get signed URL from S3
  const s3Params = {
    Bucket: bucketName,
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

  if (!response.ok) {
    throw new Error(`Failed to upload file: ${response.statusText}`);
  }
  return response;
}

function base64ToBlob(base64: string): Blob {
  // Split the base64 string into the MIME type and the base64 encoded data
  const parts = base64.match(/^data:(image\/[a-z]+);base64,(.*)$/);
  if (!parts || parts.length !== 3) {
    throw new Error("Base64 string is not properly formatted");
  }

  const mimeType = parts[1]; // e.g., 'image/png'
  const imageData = parts[2];

  // Convert the base64 encoded data to a binary string
  const binaryStr = atob(imageData);

  // Convert the binary string to an array of bytes (Uint8Array)
  const length = binaryStr.length;
  const arrayBuffer = new Uint8Array(new ArrayBuffer(length));

  for (let i = 0; i < length; i++) {
    arrayBuffer[i] = binaryStr.charCodeAt(i);
  }

  // Create and return the Blob object
  return new Blob([arrayBuffer], { type: mimeType });
}

export default async function describeImage(
  describeImageProps: DescribeImageProps,
) {
  const blobData = base64ToBlob(describeImageProps.file); // {size, type}

  const uploadURL = await getSignedUrl(blobData.type);
  console.log("uploadURL: ", uploadURL);
  const uploadResponse = await uploadFileToS3(uploadURL, blobData);
  console.log("upload response: ", uploadResponse);

  // TODO(ItamarRocha): Update api call to also use user text prompt with image
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "Describe this image in few words focus on it's main characteristics. This description will be used to search similar items in an e-commerce store, so describe name of the product and other relevant information. Use 3 words tops to describe. Avoid using colors.",
          },
          {
            type: "image_url",
            image_url: {
              "url": uploadURL.split("?")[0], // only the url without the query params
            },
          },
        ],
      },
    ],
  });
  console.log(response);
  return response;
}
