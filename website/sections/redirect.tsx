import { scriptAsDataURI } from "../../utils/dataURI.ts";

export interface Props{
    url: string;
}

const snippet = (url: string) => {
    console.log("teste")
    setTimeout(() => {
        console.log("timeout")
    }, 5000);
    window.addEventListener("load", () => {
        setTimeout(() => {
            console.log("timeout load")
        }, 100);
        console.log("loaddd")
    })
    window.location.href = url
}

export default function Redirect({ url } : Props){

    return(
        <script 
            type="text/javascript"
            async
            src={scriptAsDataURI(snippet, url)}
        />
    )
}