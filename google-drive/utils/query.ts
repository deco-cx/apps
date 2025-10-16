import { QueryCondition } from "./types.ts";

/**
 * Builds a Google Drive API query string from an array of query conditions.
 *
 * @param queries Array of query conditions
 * @returns Formatted query string for Google Drive API
 *
 * @example
 * ```typescript
 * const queries = [
 *   { term: "trashed", operator: "=", value: "false", combinator: "and" },
 *   { term: "mimeType", operator: "contains", value: "image/" }
 * ];
 * buildQueryString(queries); // Returns: "trashed = false and mimeType contains 'image/'"
 * ```
 */
export function buildQueryString(queries: QueryCondition[]): string {
  if (!queries || queries.length === 0) {
    throw new Error("At least one query condition is required");
  }

  return queries.map((condition, index) => {
    const { term, operator, value, combinator, negate } = condition;

    // Build the basic condition
    let conditionStr = "";

    // Special handling for 'in' operator - value goes in quotes for certain terms
    if (operator === "in") {
      // For 'in' operator with collections like owners, writers, readers
      // Format: 'value' in term
      conditionStr = `'${value}' ${operator} ${term}`;
    } else if (operator === "has") {
      // For 'has' operator with properties/appProperties
      // Value should already be formatted like: { key='dept' and value='sales' }
      conditionStr = `${term} ${operator} ${value}`;
    } else {
      // Standard format: term operator 'value'
      // Check if value needs quotes (strings, dates) or not (booleans, numbers in some cases)
      const needsQuotes = !["true", "false"].includes(value.toLowerCase()) &&
        isNaN(Number(value));

      const formattedValue = needsQuotes ? `'${value}'` : value;
      conditionStr = `${term} ${operator} ${formattedValue}`;
    }

    // Apply negation if specified
    if (negate) {
      conditionStr = `not ${conditionStr}`;
    }

    // Add combinator if not the last condition
    if (index < queries.length - 1) {
      if (!combinator) {
        throw new Error(
          `Combinator is required for condition at index ${index} (not the last condition)`,
        );
      }
      conditionStr += ` ${combinator}`;
    }

    return conditionStr;
  }).join(" ");
}
