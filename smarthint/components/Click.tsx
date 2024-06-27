import { scriptAsDataURI } from "../../utils/dataURI.ts";
import { Props as ClickProps } from "../actions/click.ts";

export const SmarthintSendEventOnClick = ({
  event,
  id,
}: {
  event: Omit<ClickProps, "pageType">;
  id: string;
}) => (
  <script
    defer
    src={scriptAsDataURI(
      (id: string, event: Omit<ClickProps, "pageType">) => {
        const elem = document.getElementById(id);

        if (!elem) {
          return console.warn(
            `SmartHint - Could not find element ${id}.Click event will not be send. This will cause loss in analytics`,
          );
        }

        elem.addEventListener("click", () => {
          window.smarthint.click(event);
        });
      },
      id,
      event,
    )}
  />
);
