import { useId } from "preact/hooks";

export interface ITextStyleWithoutDefault {
  /**
   * @format color
   */
  color?: string;
  fontSize?: number;
  fontWeight?:
    | "Thin"
    | "Extra Light"
    | "Light"
    | "Regular"
    | "Medium"
    | "Semi Bold"
    | "Bold"
    | "Extra Bold";
  letterSpacing?: number;
  textAlign?: "left" | "center" | "right";
  lineHeight?: number;
}

/**
 * @title Add Text
 */
export interface IText {
  /**
   * @format html
   * @default <p>Title</p>
   */
  text: string;
  /**
   * @format color
   */
  onHoverColor?: string;
  /**
   * @ignore
   */
  rootId?: string;
}

export default function Text({ text, rootId, onHoverColor }: IText) {
  const id = useId();

  return (
    <>
      {onHoverColor
        ? (
          <style
            dangerouslySetInnerHTML={{
              __html: `${rootId ? `#${rootId}:hover ` : ""}#${id}${
                rootId ? "" : ":hover"
              } * { color: ${onHoverColor} !important }`,
            }}
          />
        )
        : null}
      <div id={id} dangerouslySetInnerHTML={{ __html: text }} />
    </>
  );
}
