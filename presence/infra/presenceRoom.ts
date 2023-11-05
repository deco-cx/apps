import { HandlerContext } from "$fresh/server.ts";
import { Messages } from "./protocol.ts";
import { Broadcast, NamedSocket, Room } from "./rooms.ts";

/**
 * Global store that tracks all of our rooms and connections
 */
const rooms: Room[] = [];

const getRoom = (id: string) => rooms.find((room) => room.id == id);

type CreatePresenceHandlerConfig = {
  onError?: (this: WebSocket, ev: Event) => void;
  onRoomStateChange?: (room: Room) => void;
  roomIdParam?: string;
};

const defaults: CreatePresenceHandlerConfig = {
  onError: (e) => {
    console.error(`Error [Presence] - ${e}`);
  },
  roomIdParam: "roomId",
};

export function createPresenceHandler({
  onError,
  onRoomStateChange,
  roomIdParam,
}: CreatePresenceHandlerConfig) {
  const after = onRoomStateChange ?? function (_room: Room) {};

  const onOpen = (socket: WebSocket, roomId: string) => {
    let currentRoom = getRoom(roomId);
    if (!currentRoom) {
      currentRoom = {
        connections: [socket],
        id: roomId,
      };
      rooms.push(currentRoom);
    } else {
      currentRoom.connections.push(socket);
    }

    // Wait until Socket is fully connected.
    while (socket.readyState !== socket.OPEN);
    Broadcast.count(currentRoom, after);
  };

  const onClose = (socket: WebSocket) => {
    let foundConnection = false;
    for (const room of rooms) {
      room.connections.forEach((conn, idx) => {
        // Here we find the socket comparing by reference
        if (conn == socket) {
          room.connections.splice(idx, 1);
          foundConnection = true;
        }
      });
      if (foundConnection) {
        Broadcast.count(room, after);
        break;
      }
    }
  };

  const onMessage = (socket: NamedSocket, roomId: string, data: string) => {
    const message = Messages.deserialize(data);
    const room = getRoom(roomId);

    if (!room) return;

    if (message.type === "chat_update") {
      Broadcast.chatMessage(room, message.newMessage, socket.name, after);
    }

    if (message.type === "set_name") {
      socket.name = message.newName;
    }

    if (message.type === "reaction") {
      Broadcast.reaction(room, message.emoji, after);
    }
  };

  // deno-lint-ignore require-await
  return async (req: Request, _ctx: HandlerContext): Promise<Response> => {
    if (req.headers.get("upgrade") != "websocket") {
      return new Response("Protocol not supported");
    }

    const url = new URL(req.url);
    const queryParam = roomIdParam ?? (defaults.roomIdParam as string);
    const roomId = url.searchParams.get(queryParam) ?? "global";

    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.onopen = () => {
      onOpen(socket, roomId);
    };
    socket.onmessage = (e) => {
      onMessage(socket, roomId, e.data);
    };
    socket.onclose = () => {
      onClose(socket);
    };
    socket.onerror = onError ??
      (defaults.onError as (typeof socket)["onerror"]);

    return response;
  };
}
