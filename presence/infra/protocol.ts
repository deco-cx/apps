export type CountUpdate = {
  type: "count_update";
  newCount: number;
};

export type ChatUpdate = {
  type: "chat_update";
  newMessage: string;
  name: string;
};

export type SetName = {
  type: "set_name";
  newName: string;
};

export type Reaction = {
  type: "reaction";
  emoji: string;
};

export type Message = CountUpdate | ChatUpdate | SetName | Reaction;

export const Messages = Object.freeze({
  serialize: (message: Message) => JSON.stringify(message),
  deserialize: (data: string) => JSON.parse(data) as Message,
});
