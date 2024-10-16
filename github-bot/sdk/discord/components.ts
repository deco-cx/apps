import {
  type ActionRow,
  type ButtonComponent,
  MessageComponentTypes,
} from "https://deno.land/x/discordeno@18.0.1/mod.ts";

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
