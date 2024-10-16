export const userMention = (userId: string) => {
  return `<@${userId}>`;
};

export const roleMention = (roleId: string) => {
  return `<@&${roleId}>`;
};

export const channelMention = (channelId: string) => {
  return `<#${channelId}>`;
};

export function codeBlock(content: string | number | boolean, lang?: string) {
  return `\`\`\`${lang ?? ""}\n${content}\n\`\`\``;
}

export function inlineCode(content: string) {
  return `\`${content}\``;
}

export function bold(content: string) {
  return `**${content}**`;
}

type TimestampFormat = "t" | "T" | "d" | "D" | "f" | "F" | "R";

export function timestamp(seconds: number, format: TimestampFormat = "f") {
  return `<t:${seconds}:${format}>`;
}
