import { BlogPost } from "../types.ts";

const loader = ({ post }: { post: BlogPost }): BlogPost => post;

export default loader;
