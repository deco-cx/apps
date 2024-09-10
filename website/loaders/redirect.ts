import { Redirect } from "../../compat/std/loaders/x/redirects.ts";

export interface Props {
  redirect: Redirect;
}

const routeRedirectLoader = (props: Props): Redirect => {
  return props.redirect;
};

export default routeRedirectLoader;
