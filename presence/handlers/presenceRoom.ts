import { HandlerContext } from "$fresh/server.ts";

/**
 *  Room
 *
 *  A room contains a unique Id and a pool of connections.
 *  Represents a Realtime Presence Group of people.
 */
type Room = {
  connections: WebSocket[];
  id: string;
};

/**
 * Global store that tracks all of our rooms and connections
 */
const rooms: Room[] = [];

/**
 *  Receives a Presence Room and broadcast its current State (Number of connections)
 */
function broadcastRoomState(room: Room) {
  const count = room.connections.length.toString();
  for (const socket of room.connections) {
    socket.send(count);
  }
}

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
  const broadcast = (room: Room) => {
    broadcastRoomState(room);
    if (onRoomStateChange) {
      onRoomStateChange(room);
    }
  };

  const onOpen = (socket: WebSocket, roomId: string) => {
    let currentRoom = rooms.find((room) => room.id == roomId);
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
    broadcast(currentRoom);
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
        broadcast(room);
        break;
      }
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
    socket.onclose = () => {
      onClose(socket);
    };
    socket.onerror = onError ??
      (defaults.onError as (typeof socket)["onerror"]);

    return response;
  };
}
