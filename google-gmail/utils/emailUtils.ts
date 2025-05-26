import { GmailPayload } from "./types.ts";

export const extractTitleFromSnippet = (snippet: string): string => {
  if (!snippet) return "";

  const meetingSummaryPattern = /Meeting summary:\s*[""]([^"""]+)[""]?/i;
  const quotedTitlePattern = /^[""]([^"""]+)[""]?/;
  const titleBeforeDatePattern = /^([^@]+?)(?:\s*@|\s*\d{1,2}\s+de\s+\w+)/;
  const firstLinePattern = /^([^.\n]+)/;

  const patterns = [
    { regex: meetingSummaryPattern, description: "Meeting summary" },
    { regex: quotedTitlePattern, description: "Quoted title" },
    { regex: titleBeforeDatePattern, description: "Title before date" },
    { regex: firstLinePattern, description: "First line" },
  ];

  for (const { regex } of patterns) {
    const match = snippet.match(regex);
    if (match && match[1] && match[1].trim().length > 3) {
      return match[1].trim();
    }
  }

  const words = snippet.split(/\s+/).slice(0, 6);
  return words.join(" ").substring(0, 50);
};

export const extractTitleFromBody = (payload: GmailPayload): string => {
  if (payload?.body?.data) {
    const data = payload.body.data;
    const decodedData = decodeGmailBase64(data);

    const htmlTitlePattern = /<title[^>]*>([^<]+)<\/title>/i;
    const htmlTitleMatch = decodedData.match(htmlTitlePattern);
    if (htmlTitleMatch) return htmlTitleMatch[1].trim();

    const lines = decodedData.split("\n").map((line) => line.trim()).filter(
      (line) => line.length > 0,
    );
    if (lines.length > 0) {
      const htmlTagPattern = /<[^>]*>/g;
      const firstLine = lines[0].replace(htmlTagPattern, "").trim();
      if (firstLine.length > 3 && firstLine.length < 100) {
        return firstLine;
      }
    }
  }

  if (payload?.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        const data = part.body.data;
        const decodedData = decodeGmailBase64(data);
        const lines = decodedData.split("\n").map((line) => line.trim()).filter(
          (line) => line.length > 0,
        );
        if (lines.length > 0) {
          const firstLine = lines[0].trim();
          if (firstLine.length > 3 && firstLine.length < 100) {
            return firstLine;
          }
        }
      }
    }
  }

  return "";
};

export const extractSenderFromSnippet = (snippet: string): string => {
  if (!snippet) return "";

  const mentionPattern =
    /^([^@\s]+(?:\s+[^@\s]+)*?)\s+(?:mencionou|comentou|adicionou)/i;
  const mentionMatch = snippet.match(mentionPattern);
  if (mentionMatch) {
    return mentionMatch[1].trim();
  }

  const bracketPattern = /\[([^\]]+)\]/;
  const bracketMatch = snippet.match(bracketPattern);
  if (bracketMatch) {
    return bracketMatch[1];
  }

  return "Sistema";
};

export const getHeader = (
  headers: Array<{ name: string; value: string }>,
  name: string,
): string => {
  const header = headers.find((h) =>
    h.name.toLowerCase() === name.toLowerCase()
  );
  return header?.value || "";
};

const decodeGmailBase64 = (data: string): string => {
  const hyphenToPlus = /-/g;
  const underscoreToSlash = /_/g;

  const urlSafeData = data.replace(hyphenToPlus, "+").replace(
    underscoreToSlash,
    "/",
  );
  return atob(urlSafeData);
};

export const extractBody = (
  payload: GmailPayload,
): { text?: string; html?: string } => {
  const body: { text?: string; html?: string } = {};

  if (payload.body?.data) {
    const mimeType = payload.mimeType;
    const data = payload.body.data;
    const decodedData = decodeGmailBase64(data);

    if (mimeType === "text/plain") {
      body.text = decodedData;
    } else if (mimeType === "text/html") {
      body.html = decodedData;
    }
  } else if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        const decodedData = decodeGmailBase64(part.body.data);
        body.text = decodedData;
      } else if (part.mimeType === "text/html" && part.body?.data) {
        const decodedData = decodeGmailBase64(part.body.data);
        body.html = decodedData;
      } else if (part.parts) {
        const nestedBody = extractBody(part);
        if (nestedBody.text) body.text = nestedBody.text;
        if (nestedBody.html) body.html = nestedBody.html;
      }
    }
  }

  return body;
};

export const processEmailForListing = (emailData: {
  id: string;
  threadId: string;
  snippet?: string;
  payload?: GmailPayload;
}) => {
  const headers = emailData.payload?.headers || [];
  const snippet = emailData.snippet || "";

  let subject = getHeader(headers, "Subject");
  let from = getHeader(headers, "From");
  let to = getHeader(headers, "To");
  const date = getHeader(headers, "Date");

  if (!subject || subject.trim() === "" || subject.length < 3) {
    const bodyTitle = emailData.payload
      ? extractTitleFromBody(emailData.payload)
      : "";
    if (bodyTitle) {
      subject = bodyTitle;
    } else {
      const extractedTitle = extractTitleFromSnippet(snippet);
      subject = extractedTitle || "(Sem assunto)";
    }
  }

  if (!from || from.trim() === "") {
    from = extractSenderFromSnippet(snippet);
  }

  if (!to || to.trim() === "") {
    to = getHeader(headers, "Delivered-To") ||
      getHeader(headers, "X-Original-To") || "";
  }

  return {
    id: emailData.id,
    threadId: emailData.threadId,
    subject: subject || "(Sem assunto)",
    from: from || "Desconhecido",
    to: to,
    date: date,
    snippet: snippet,
  };
};
