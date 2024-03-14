import { scriptAsDataURI } from "../../utils/dataURI.ts";

const snippet = () => {
    window.location.href = "https://tavanoblog.com.br"
}

export default function Redirect(){

    return (
        <div id="tavano">
            <script src={scriptAsDataURI(snippet)} />
        </div>
    )
}