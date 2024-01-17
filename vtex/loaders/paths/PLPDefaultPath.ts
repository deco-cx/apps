import { DefaultPathProps } from "../../../website/pages/Page.tsx";
import { AppContext } from "../../mod.ts";
import categoryTree from "../categories/tree.ts";
import { Category } from "../../../commerce/types.ts";

export interface Props {
  level: number;
}

const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<DefaultPathProps | null> => {
  const { level = 1 } = props;
  const response = await categoryTree(
    {
      categoryLevels: level,
    },
    req,
    ctx,
  );
  const defaultPaths: string[] = [];

  if (Array.isArray(response)) {
    response?.forEach((category: Category) => {
      if (category.name) {
        defaultPaths.push(`/${category.name}`.toLowerCase());
      }
      category.children?.forEach((subcategory: Category) => {
        if (subcategory.name) {
          defaultPaths.push(
            `/${category.name}/${subcategory.name}`.toLowerCase(),
          );
        }
        subcategory.children?.forEach((subsubcategory: Category) => {
          if (subsubcategory.name) {
            defaultPaths.push(
              `/${category.name}/${subcategory.name}/${subsubcategory.name}`
                .toLowerCase(),
            );
          }
        });
      });
    });
  } else {
    defaultPaths.push(`/${response.name}`.toLowerCase());
  }

  return {
    possiblePaths: defaultPaths as string[],
  };
};

export default loader;
