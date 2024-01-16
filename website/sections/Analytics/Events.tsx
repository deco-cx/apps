export interface gtagEvent {
  trigger: "click";
  cssSelector: string;
  name: string;
  extraParams?: { key: string; value: string }[];
}

interface Event {
  type: gtagEvent;
  trigger: "DOMContentLoaded" | "load";
}

export interface Props {
  events: Event[];
}

export default function AnalyticsEvent({ events }: Props) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
        
        ${
          events.map((event) => {
            return (
              `window.addEventListener('${event.trigger}', function() {
                        document.querySelector('${event.type.cssSelector}').addEventListener('${event.type.trigger}', function() {
                            console.log("clique!")
                            gtag('event', '${event.type.name}', {
                                ${
                event.type.extraParams?.map((param) => {
                  return (
                    `${param.key}: ${param.value},`
                  );
                })
              }
            
                            })
                        })
                    })`
            );
          })
        }
        `,
      }}
    >
    </script>
  );
}
