import Text, { IText } from "../Text.tsx";
import { useId } from "preact/hooks";

interface IIcon {
  id: string;
  size: number;
  /**
   * @format color
   */
  color: string;
  /**
   * @format color
   */
  onHoverColor?: string;
}

interface IStyle {
  /**
   * @default 12
   */
  gap: number;
}

/**
 * @title {{{name}}}
 */
export interface ICard {
  name: string;
  title: IText;
  subtitle: IText | null;
  icon: IIcon;
  href: string;
  style?: IStyle;
}

export default function Card({ title, subtitle, icon, href, style }: ICard) {
  const id = useId();

  return (
    <a
      id={id}
      style={{ ...style }}
      href={href}
      class="bg-white rounded md:flex-col flex md:justify-center items-center p-5"
    >
      {/* <Icon id={icon.id} size={icon.size} /> */}
      <Text {...title} rootId={id} />
      {subtitle && (
        <div class="hidden md:inline">
          <Text {...subtitle} rootId={id} />
        </div>
      )}
    </a>
  );
}
