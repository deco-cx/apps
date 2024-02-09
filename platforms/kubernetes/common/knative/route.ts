export interface RouteOpts {
  namespace: string;
  routeName: string;
  revisionName: string;
}

export const revisionRoute = (
  { namespace, routeName: name, revisionName }: RouteOpts,
) => {
  return {
    apiVersion: "serving.knative.dev/v1",
    kind: "Route",
    metadata: {
      name,
      namespace,
    },
    spec: {
      traffic: [
        {
          revisionName,
          percent: 100, // All traffic goes to this revision
        },
      ],
    },
  };
};
