import Card, { ICard } from "../Cards/Card.tsx";

interface Columns {
  /**
   * @default 3
   */
  desktop: number;
  /**
   * @default 1
   */
  mobile: number;
}

interface Padding {
  /**
   * @default 12
   */
  top: number;
  /**
   * @default 12
   */
  right: number;
  /**
   * @default 12
   */
  bottom: number;
  /**
   * @default 12
   */
  left: number;
}

interface Style {
  /**
   * @title Spacing
   * @default 12
   */
  gap: number;
  container?: boolean;
  /**
   * @format color
   * @default #fff
   */
  backgroundColor?: string;
  padding?: Padding;
}

interface Props {
  cards: ICard[];
  columns: Columns;
  style?: Style;
}

export default function Cards({ cards, columns, style: style }: Props) {
  const { container, backgroundColor, ..._style } = style ?? ({} as Style);

  return (
    <div style={{ backgroundColor }}>
      <ul
        class={"grid grid-cols-[var(--m-cols)] md:grid-cols-[var(--d-cols)]" +
          (container ? " container" : "")}
        style={{
          ..._style,
          padding: `${_style.padding?.top ?? 0}px ${
            _style.padding?.right ?? 0
          }px ${_style.padding?.bottom ?? 0}px ${_style.padding?.left ?? 0}px`,
          gap: _style.gap ?? 12,
          "--d-cols": `repeat(${columns.desktop}, 1fr)`,
          "--m-cols": `repeat(${columns.mobile}, 1fr)`,
        }}
      >
        {cards.map((card, index) => (
          <li key={index}>
            <Card {...card} />
          </li>
        ))}
      </ul>
    </div>
  );
}
