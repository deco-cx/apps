import { AppContext } from "../mod.ts";
import type { Attachment, SlackWebhookProps } from "../types.ts";
import { logger } from "@deco/deco/o11y";

const webhook = (
  props: SlackWebhookProps,
  _req: Request,
  ctx: AppContext,
): Response => {
  // Respond immediately (Slack has a 3s timeout)
  (async () => {
    // Handle Slack URL verification
    if (props.type === "url_verification" && props.challenge) {
      return new Response(props.challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const isBotMessage = props.type === "event_callback" &&
      props.event.type === "message" &&
      (
        props.event.bot_id ||
        props.event.bot_profile ||
        (props.event.bot_profile &&
          props.event.user ===
            (props.event.bot_profile as { user_id?: string }).user_id)
      );

    if (isBotMessage) {
      logger.info({ msg: "Ignored bot message", event: props.event });
      return new Response("Ignored bot message", { status: 200 });
    }

    // --- Download Slack files if present ---
    const BOT_TOKEN = ctx.botToken;

    const attachments: Attachment[] = [];

    if (
      props.type === "event_callback" &&
      props.event &&
      Array.isArray(props.event.files) &&
      props.event.files.length > 0
    ) {
      for (const file of props.event.files) {
        try {
          const fileData = await downloadSlackPrivateFile(
            file.url_private,
            BOT_TOKEN,
          );
          // Save to disk in a 'downloads' directory (ensure it exists)
          const dir = "downloads";
          await Deno.mkdir(dir, { recursive: true });
          const normalizedFileName = normalizeFileName(file.name);
          const filePath = `${dir}/${normalizedFileName}`;
          await Deno.writeFile(filePath, fileData);
          logger.info({
            msg: "Downloaded and saved file",
            fileName: normalizedFileName,
            size: fileData.length,
            path: filePath,
          });

          let publicUrlData: string | undefined = undefined;
          try {
            const { error } = await ctx.supabase.storage.from("collabs").upload(
              normalizedFileName,
              fileData,
              {
                contentType: file.mimetype,
                upsert: true,
              },
            );
            if (error) {
              logger.error({
                msg: `Failed to upload file to Supabase`,
                fileName: normalizedFileName,
                error,
              });
            } else {
              // Get public URL
              const { data } = ctx.supabase.storage.from("collabs")
                .getPublicUrl(normalizedFileName);
              publicUrlData = data.publicUrl;
              logger.info({
                msg: "Supabase public URL",
                fileName: normalizedFileName,
                publicUrl: publicUrlData,
              });

              attachments.push({
                name: normalizedFileName,
                contentType: file.mimetype,
                url: publicUrlData,
              });
            }
          } catch (err) {
            logger.error({
              msg: `Error uploading file to Supabase`,
              fileName: normalizedFileName,
              error: err,
            });
          }
        } catch (err) {
          logger.error({
            msg: `Failed to process file`,
            fileName: file.name,
            error: err,
          });
        }
      }
    }

    logger.info({
      msg: "Sending to deco.chat",
      attachmentsCount: attachments.length,
    });
    const res = await fetch(
      ctx.webhookUrl,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              id: crypto.randomUUID(),
              role: "user",
              content: JSON.stringify(props),
              ...(attachments.length > 0
                ? { experimental_attachments: attachments }
                : {}),
            },
          ],
        }),
      },
    );

    await res.text();
  })();

  return new Response("OK", { status: 200 });
};

/**
 * Downloads a private file from Slack using the bot token.
 * @param fileUrl The `url_private` or `url_private_download` from the Slack file object.
 * @param botToken Your Slack bot token (starts with "xoxb-").
 * @returns The file as a Uint8Array (binary data).
 */
export async function downloadSlackPrivateFile(
  fileUrl: string,
  botToken: string,
): Promise<Uint8Array> {
  const response = await fetch(fileUrl, {
    headers: {
      "Authorization": `Bearer ${botToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to download file: ${response.status} ${response.statusText}`,
    );
  }

  // For Deno: use .arrayBuffer() and convert to Uint8Array
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

function normalizeFileName(fileName: string): string {
  // Split into name and extension
  const lastDot = fileName.lastIndexOf(".");
  const base = lastDot !== -1 ? fileName.slice(0, lastDot) : fileName;
  const ext = lastDot !== -1 ? fileName.slice(lastDot) : "";
  // Remove accents/diacritics
  let normalized = base.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  // Replace spaces and most special chars with _
  normalized = normalized.replace(/[^a-zA-Z0-9-_]/g, "_");
  // Remove duplicate underscores
  normalized = normalized.replace(/_+/g, "_");
  // Remove leading/trailing underscores
  normalized = normalized.replace(/^_+|_+$/g, "");
  return normalized + ext;
}

export default webhook;
