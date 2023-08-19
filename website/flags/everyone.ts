import { FlagObj } from "https://denopkg.com/deco-cx/deco@0fd9f2975afa29f9c1b7763ccea704157012912e/blocks/flag.ts";
import { asResolved } from "https://denopkg.com/deco-cx/deco@0fd9f2975afa29f9c1b7763ccea704157012912e/engine/core/resolver.ts";
import Audience, {
  Route,
  Routes,
} from "https://denopkg.com/deco-cx/deco@0fd9f2975afa29f9c1b7763ccea704157012912e/flags/audience.ts";
import MatchAlways from "https://denopkg.com/deco-cx/deco@0fd9f2975afa29f9c1b7763ccea704157012912e/matchers/MatchAlways.ts";

export interface EveryoneConfig {
  routes?: Routes;
}

/**
 * @title Audience Everyone
 * @description Always match regardless of the current user
 */
export default function Everyone(
  { routes }: EveryoneConfig,
): FlagObj<Route[]> {
  return Audience({
    matcher: MatchAlways,
    routes: routes ?? [],
    name: "Everyone",
  });
}

export const onBeforeResolveProps = <T extends { routes?: Routes }>(
  props: T,
): T => {
  if (Array.isArray(props?.routes)) {
    const newRoutes: T = { ...props, routes: [] };
    for (const route of (props?.routes ?? [])) {
      newRoutes.routes!.push({
        ...route,
        handler: {
          value: asResolved(route.handler.value, true),
        },
      });
    }
    return newRoutes;
  }
  return props;
};
