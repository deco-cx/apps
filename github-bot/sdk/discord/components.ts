import {
  type ActionRow,
  type ButtonComponent,
  MessageComponentTypes,
} from "../../deps/discordeno.ts";

export function createActionRow(
  components: ActionRow["components"],
): ActionRow {
  return {
    type: MessageComponentTypes.ActionRow,
    components,
  };
}

export function createButton(
  data: Omit<ButtonComponent, "type">,
): ButtonComponent {
  return {
    type: MessageComponentTypes.Button,
    ...data,
  };
}
