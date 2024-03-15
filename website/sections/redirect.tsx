import { scriptAsDataURI } from "../../utils/dataURI.ts";

export interface Props {
  url: string;
}

const snippet = (url: string) => {
  window.location.href = url;
};

export default function Redirect({ url }: Props) {
  return (
    <div>
        <script
            type="text/javascript"
            defer
            src={scriptAsDataURI(snippet, url)}
        />
    </div>
  );
}
