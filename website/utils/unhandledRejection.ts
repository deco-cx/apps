globalThis.addEventListener(
  "unhandledrejection",
  (event: PromiseRejectionEvent) => {
    event.preventDefault();

    console.error("Unhandled Rejection", event.reason);
  },
  { capture: true },
);
