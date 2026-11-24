// `/deco/render` and the preview routes resolve section props sent in the
// request URL, so anyone can choose them. A section must not turn those props
// into third-party script loads (an attacker-chosen GTM container or tag host
// runs arbitrary JavaScript on the store's domain). On a normal page render the
// props come from the decofile instead.
const PROPS_FROM_REQUEST = /^\/(?:live|deco)\/(?:render|previews)(?:\/|$)/;

export const isRenderedFromRequestProps = (req: Request): boolean => {
  try {
    return PROPS_FROM_REQUEST.test(new URL(req.url).pathname);
  } catch {
    return true;
  }
};
