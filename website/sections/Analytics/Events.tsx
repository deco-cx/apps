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
  const groupedEvents = events.reduce(
    (acc: Record<string, Event[]>, event: Event) => {
      (acc[event.trigger] = acc[event.trigger] || []).push(event);
      return acc;
    },
    {},
  );

  const renderEventListeners = () => {
    return Object.entries(groupedEvents).map(([trigger, events]) => `
        window.addEventListener('${trigger}', function() {
          ${
      events.map((event) => `
            document.querySelector('${event.type.cssSelector}').addEventListener('${event.type.trigger}', function() {
              console.log("Click detected on ${event.type.name}!");
              gtag('event', '${event.type.name}', {
                ${
        event.type.extraParams?.map((param) => `${param.key}: ${param.value},`)
          .join("\n")
      }
              });
            });
          `).join("\n")
    }
        });
      `).join("\n");
  };

  return (
    <script dangerouslySetInnerHTML={{ __html: renderEventListeners() }}>
    </script>
  );
}
