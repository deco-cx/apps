import {
  ChatUpdate,
  CountUpdate,
  Message,
  Messages,
  Reaction,
} from "./protocol.ts";

export type NamedSocket = WebSocket & { name?: string };

/**
 *  Room
 *
 *  A room contains a unique Id and a pool of connections.
 *  Represents a Realtime Presence Group of people.
 */
export type Room = {
  connections: NamedSocket[];
  id: string;
};

type OnRoomChange = (room: Room) => void;

/**
 *  Receives a Presence Room and broadcasts a message.
 *  Can receive a exception connection name so that self-broadcasts do not occur.
 */
function broadcast(room: Room, message: Message, exception?: string) {
  for (const socket of room.connections) {
    if (exception && socket.name === exception) {
      continue;
    }
    socket.send(Messages.serialize(message));
  }
}

/**
 * Collection of functions for broadcasting a type of message to a room.
 */
export const Broadcast = Object.freeze({
  count: (room: Room, after: OnRoomChange) => {
    const message: CountUpdate = {
      type: "count_update",
      newCount: room.connections.length,
    };
    broadcast(room, message);
    after(room);
  },
  chatMessage: (
    room: Room,
    text: string,
    exception: string | undefined,
    after: OnRoomChange,
  ) => {
    const message: ChatUpdate = {
      type: "chat_update",
      newMessage: text,
      name: exception ?? "",
    };
    broadcast(room, message);
    after(room);
  },
  reaction: (room: Room, emoji: string, after: OnRoomChange) => {
    const message: Reaction = {
      type: "reaction",
      emoji,
    };
    broadcast(room, message);
    after(room);
  },
});
