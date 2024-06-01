import "npm:@graphql-codegen/typescript";
import "npm:@graphql-codegen/typescript-operations";

import { type CodegenConfig, generate } from "npm:@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "https://storefront-api.fbits.net/graphql",
  documents: "./checkout/graphql/queries.ts",
  generates: {
    "./checkout/graphql/storefront.graphql.gen.ts": {
      // This order matters
      plugins: [
        "typescript",
        "typescript-operations",
      ],
      config: {
        skipTypename: true,
        enumsAsTypes: true,
      },
    },
  },
};

await generate({ ...config }, true);
