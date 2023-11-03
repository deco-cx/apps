import { useEffect, useState } from "preact/hooks";

type Position = "Bottom Right" | "Bottom Left" | "Top Right" | "Top Left";

export interface Props {
  /**
   * @description The counter position, relative to the page.
   */
  position: Position;
  /**
   * @description Margin from the counter to the edge of the screen in Pixels
   */
  margin?: number;
  /**
   * @description Counter label template - Type in %count% and it will be replaced with the counter value.
   */
  labelTemplate?: string;
  /**
   * @description Toast style variants. If System is selected, the browser will try to adapt to the user's operating system.
   */
  variant: "Day" | "Dark" | "System";
}

const defaults = {
  labelTemplate: "%count% Pessoas nesta página",
  margin: "2rem",
  position: "Bottom Right",
};

function PingDot() {
  return (
    <span class="relative flex h-3 w-3">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75">
      </span>
      <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500">
      </span>
    </span>
  );
}

function calcPositionStyles(position: Position, margin: string) {
  return {
    bottom: position.includes("Bottom") ? margin : "",
    top: position.includes("Top") ? margin : "",
    right: position.includes("Right") ? margin : "",
    left: position.includes("Left") ? margin : "",
  };
}

export default function PresenceCounter(props: Props) {
  const [count, setCount] = useState(0);
  const label_template = props.labelTemplate ?? defaults.labelTemplate;
  const label = label_template.replace("%count%", count.toString());

  useEffect(() => {
    const ws = new WebSocket(
      `ws://${location.host}/presence?roomId=${location.pathname}`,
    );

    ws.onmessage = (e) => {
      setCount(parseInt(e.data));
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <span
      style={calcPositionStyles(
        props.position ?? defaults.position,
        props.margin ? `${props.margin}px` : defaults.margin,
      )}
      class={`
        ${
        props.variant === "Day"
          ? "bg-base-100 text-primary"
          : props.variant === "Dark"
          ? "bg-primary text-base-100"
          : "bg-base-100 dark:bg-primary text-primary dark:text-base-100"
      } 
        border shadow fixed rounded-xl text-sm p-2 text-center z-[100] font-bold flex items-center gap-2
      `}
    >
      <PingDot />
      <span>{label}</span>
    </span>
  );
}
