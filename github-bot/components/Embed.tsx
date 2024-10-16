/**
 * @title Embed
 */
export interface Props {
  title?: string;
  description?: string;
  url?: string;
  /**
   * @description Check to show the current time in the footer
   */
  timestamp?: boolean;
  /**
   * @format color-input
   * @default #27b470
   */
  color?: string;
  footer?: Footer;
  image?: Media;
  thumbnail?: Media;
  video?: Media;
  author?: Author;
  fields?: Field[];
}

interface Footer {
  text?: string;
  icon_url?: string;
}

interface Field {
  name: string;
  value: string;
  inline?: boolean;
}

interface Media {
  url?: string;
  height?: number;
  width?: number;
}

export interface Author {
  name?: string;
  url?: string;
  icon_url?: string;
}

export default function Embed({
  author,
  color,
  description,
  fields,
  footer,
  thumbnail,
  timestamp,
  title,
  url,
}: Props) {
  return (
    <div style="display: flex; max-width: 512px">
      <div
        class="side-colored"
        style={`background-color: ${color};`}
      >
      </div>
      <div class="card embed">
        <div class="card-block">
          <div class="embed-inner">
            {!!author?.name && (
              <div class="embed-author">
                {!!author?.icon_url && (
                  <img
                    class="embed-author-icon"
                    src={author.icon_url}
                  />
                )}
                <a
                  class="embed-author-name"
                  href="https://google.com"
                >
                  {author?.name}
                </a>
              </div>
            )}
            {title && (
              <div class="embed-title">
                <a href={url}>{title}</a>
              </div>
            )}
            {description && <div class="embed-description">{description}</div>}
            {!!fields?.length && (
              <div class="fields">
                {fields.map(({ name, value }) => (
                  <div class="field inline">
                    <div class="field-name">{name}</div>
                    <div class="field-value">{value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {thumbnail && (
            <img
              class="embed-thumb"
              src={thumbnail.url}
              style="height: 128px;"
            />
          )}
        </div>
        {(!!footer?.text || timestamp) && (
          <div class="embed-footer">
            {timestamp && (
              <span>
                Hoje as{" "}
                {new Date().toLocaleTimeString("pt-BR", { timeStyle: "short" })}
              </span>
            )}
            {!!footer?.text && timestamp && <span>·</span>}
            {!!footer?.text && <span>{footer?.text}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
