import { scriptAsDataURI } from "../../utils/dataURI.ts";

export const SendEventOnClick = ({
  event,
  id,
}: {
  event: E
  id: string
}) => (
  <script
      defer
      src={scriptAsDataURI(
          (id: string, event: AnalyticsEvent) => {
              const elem = document.getElementById(id)

              if (!elem) {
                  return console.warn(
                      `Could not find element ${id}. Click event will not be send. This will cause loss in analytics`,
                  )
              }

              elem.addEventListener('click', () => {
                  window.DECO.events.dispatch(event)
              })
          },
          id,
          event,
      )}
  />
)