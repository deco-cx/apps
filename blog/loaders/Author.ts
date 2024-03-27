
/**
 * @titleBy name
 */
export interface Author {
  name: string;
  email: string;
}

const loader = ({ author }: { author: Author }): Author => author;

export default loader;
