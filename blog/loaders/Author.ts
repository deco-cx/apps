import { Author } from "../types.ts";

const loader = ({ author }: { author: Author }): Author => author;

export default loader;
