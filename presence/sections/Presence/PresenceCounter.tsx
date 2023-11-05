import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import {
  ChatUpdate,
  Messages,
  Reaction,
  SetName,
} from "../../infra/protocol.ts";

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

function LiveChatIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="icon icon-tabler icon-tabler-message-2"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="currentColor"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M8 9h8"></path>
      <path d="M8 13h6"></path>
      <path d="M9 18h-3a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-3l-3 3l-3 -3z">
      </path>
    </svg>
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

type ChatMessage = {
  name: string;
  text: string;
};

const usePresenceRoom = (props: Props) => {
  const [count, setCount] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [name, setName] = useState("");
  const [nameWasSet, setNameWasSet] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(
      `ws://${location.host}/presence?roomId=${location.pathname}`,
    );

    setSocket(ws);

    ws.onmessage = (e) => {
      const message = Messages.deserialize(e.data);

      if (message.type === "count_update") {
        setCount(message.newCount);
      }

      if (message.type === "chat_update") {
        setMessages(
          (p) => [{ name: message.name, text: message.newMessage }, ...p],
        );
      }

      if (message.type === "reaction") {
        const container = document.querySelector("#reactions-container");
        const el = document.createElement("div");
        const offset = Math.floor(Math.random() * (50 - (-50) + 1)) - 50;
        if (container) {
          el.innerHTML = `<span 
                class="reaction-travel" 
                style="--starting-angle: ${offset}deg; --starting-position: 5px; --animation-delay: 0ms;"
              >
                ${message.emoji}
              </span>`;
          container.appendChild(el);
        }
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const label = useMemo(() => {
    const label_template = props.labelTemplate ?? defaults.labelTemplate;
    return label_template.replace("%count%", count.toString());
  }, [props.labelTemplate, count]);

  const toggleChat = useCallback(() => {
    setChatOpen((prev) => !prev);
  }, [setChatOpen]);

  const sendMessage = useCallback((text: string) => {
    const message: ChatUpdate = {
      type: "chat_update",
      newMessage: text,
      name,
    };
    socket?.send(Messages.serialize(message));
  }, [socket, name]);

  const nameInputChange = useCallback((newName: string) => {
    setName(newName);
  }, [setName]);

  const updateName = useCallback(() => {
    const message: SetName = {
      type: "set_name",
      newName: name,
    };
    socket?.send(Messages.serialize(message));
    setNameWasSet(true);
  }, [socket, name, setNameWasSet]);

  const sendReaction = useCallback((emoji: string) => {
    const message: Reaction = {
      type: "reaction",
      emoji,
    };
    socket?.send(Messages.serialize(message));
  }, [socket]);

  return {
    label,
    toggleChat,
    chatOpen,
    messages,
    sendMessage,
    name,
    nameInputChange,
    updateName,
    nameWasSet,
    sendReaction,
  };
};

type ChatProps = {
  messages: ChatMessage[];
  nameWasSet: boolean;
  updateName: () => void;
  sendMessage: (text: string) => void;
  name: string;
  nameInputChange: (newName: string) => void;
  sendReaction: (emoji: string) => void;
  chatOpen: boolean;
};

function ChatWindow({
  messages,
  sendMessage,
  name,
  nameWasSet,
  updateName,
  nameInputChange,
  sendReaction,
  chatOpen,
}: ChatProps) {
  const [text, setText] = useState("");

  if (!nameWasSet) {
    return (
      <div class="flex flex-col h-full gap-2 items-center justify-center">
        <input
          class="w-48 rounded-lg border p-1 text-sm"
          placeholder="Digite seu nome"
          type="text"
          value={name}
          onChange={(e) => {
            nameInputChange((e.target as unknown as { value: string }).value);
          }}
        />
        <button
          class="rounded-lg p-1 bg-gray-100 text-sm hover:bg-gray-200 border text-gray-700 w-1/2"
          onClick={updateName}
        >
          Pronto!
        </button>
      </div>
    );
  }

  return (
    <div class="h-full flex flex-col bg-base-100">
      <div class="h-full flex flex-col-reverse gap-2 p-6 pb-4 h-80 overflow-y-scroll custom-scroll">
        {messages.map((m) => (
          <span class="text-gray-700 text-sm">
            <span class="font-bold">{m.name}:</span> {m.text}
          </span>
        ))}
      </div>
      <div class="flex flex-col w-full justify-self-end">
        <form
          class="flex"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(text);
            setText("");
          }}
        >
          <input
            class="w-full border-t p-4 text-sm focus:outline-none"
            placeholder="Digite sua mensagem..."
            type="text"
            value={text}
            onChange={(e) =>
              setText((e.target as unknown as { value: string }).value)}
          />
          <button
            class="w-16 text-center hover:bg-gray-100 transition border-t"
            onClick={() => {
              sendReaction(`❤️`);
            }}
            type="button"
          >
            ❤️
          </button>
          {chatOpen ? <div id="reactions-container"></div> : null}
          <button
            class="w-16 text-center hover:bg-gray-100 transition border-t"
            onClick={() => {
              sendReaction(`🔥`);
            }}
            type="button"
          >
            🔥
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PresenceCounter(props: Props) {
  const {
    label,
    toggleChat,
    chatOpen,
    messages,
    sendMessage,
    nameInputChange,
    updateName,
    nameWasSet,
    name,
    sendReaction,
  } = usePresenceRoom(props);

  return (
    <div
      class="fixed z-[1000] flex flex-col items-center"
      style={calcPositionStyles(
        props.position ?? defaults.position,
        props.margin ? `${props.margin}px` : defaults.margin,
      )}
    >
      {chatOpen ? null : <div id="reactions-container"></div>}
      <div
        class={`w-80 relative rounded-t-xl bg-base-100
        ${chatOpen ? "h-96 border border-b-0 shadow" : "h-0 border-none"} 
        overflow-hidden transition-[height] transform`}
      >
        <ChatWindow
          messages={messages}
          name={name}
          nameWasSet={nameWasSet}
          updateName={updateName}
          nameInputChange={nameInputChange}
          sendMessage={sendMessage}
          sendReaction={sendReaction}
          chatOpen={chatOpen}
        />
      </div>
      <button
        onClick={toggleChat}
        class={`
        ${
          props.variant === "Day"
            ? "bg-base-100 text-primary"
            : props.variant === "Dark"
            ? "bg-primary text-base-100"
            : "bg-base-100 dark:bg-primary text-primary dark:text-base-100"
        } 
        ${chatOpen ? "w-96" : "w-60 hover:w-96"}
        border h-10 overflow-hidden text-clip hover:bg-gray-100 group transition-[width] transform shadow
        relative rounded-xl text-sm p-2 text-center z-[100] font-bold flex items-center gap-2 cursor-pointer justify-center
      `}
      >
        <span
          class={`
            text-gray-500 w-0 group-hover:w-40
            transition-[width] transform overflow-hidden flex gap-2 items-center
          `}
        >
          <LiveChatIcon />
          <span class="whitespace-nowrap">
            {chatOpen ? "Fechar" : "Abrir"} LiveChat
          </span>
        </span>
        <PingDot />
        <span>{label}</span>
      </button>
    </div>
  );
}
