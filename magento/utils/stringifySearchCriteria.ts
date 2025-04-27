interface Filter {
  field: string;
  value: string;
}

interface FilterGroup {
  [key: string]: Filter[];
}

interface SearchCriteria {
  [key: string]: string | number | FilterGroup[];
}

type Path = string;
type TraverseObj = SearchCriteria | FilterGroup[];

function traverse(data: TraverseObj, result: Record<Path, string>, path: Path) {
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      traverse(item as unknown as TraverseObj, result, `${path}[${index}]`);
    });
  } else if (typeof data === "object" && data !== null) {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // @ts-ignore recursive function
        traverse(data[key], result, `${path}[${key}]`);
      }
    }
  } else {
    result[path] = data;
  }
}

export default function stringifySearchCriteria(
  searchCriteriaObj: SearchCriteria,
) {
  const result: Record<Path, string> = {};
  traverse(searchCriteriaObj, result, "searchCriteria");
  return result;
}
