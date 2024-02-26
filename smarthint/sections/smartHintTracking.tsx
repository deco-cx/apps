import { Head } from "$fresh/runtime.ts";
import { scriptAsDataURI } from "../../utils/dataURI.ts";
import { AppContext } from "../mod.ts"

export type PageType = "category" |
   "search" |
    "searchWithResult" |
    "home" |
    "cart" |
    "emptycart" |
    "checkout" |
    "notfound" |
    "product" |
    "other"

export interface Page {
  /** 
   * @format dynamic-options 
   * @options website/loaders/options/routes.ts
  */
  page: string, 
  pageType: PageType 
}

export interface Props {
  pages: Page[]
  
};
interface Cookie {
 name: string;
 value: unknown;
 path: string;
}

export const loader = (props: Props, req: Request, ctx: AppContext) => {
  return { shcode: ctx.shcode, ...props}
}

const tracking = (props: ReturnType<typeof loader>) => {
  function diffInSeconds(timestamp: number): string {
    // Obtém o timestamp atual em milissegundos
    const currentTimestamp = new Date().getTime();
    
    // Calcula a diferença entre os timestamps em milissegundos
    const differenceInMillis = currentTimestamp - timestamp;
    
    // Converte a diferença de milissegundos para segundos
    const differenceInSeconds = Math.floor(differenceInMillis / 1000);
    
    return differenceInSeconds.toString();
  }

  const getData = () => {
    const dataWithComma = new Date().toLocaleString("pt-BR");
    const data = dataWithComma.replace(",", "")
    return data
  }

  function parse(cookieString: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    const cookiePairs = cookieString.split(";");

    for (const pair of cookiePairs) {
      const [name, value] = pair.trim().split("=");
      cookies[name] = value;
    }

    return cookies;
  }

  const setCookie = ({ name, value, path }: Cookie) => {
    document.cookie = `${name}=${value};path=${path};`;
  };

  const getSegmentFromCookie = (
    type:
      | "smarthint_anonymous_consumer"
      | "smarthint_session"
      | "smarthint_timestamp"
      | "smarthint_origin",
  ): string | undefined => {
    const cookies = parse(document.cookie);
    const cookie = cookies[type];
    return cookie;
  };

  const setSegmentCookie = (
    segment: string,
    type:
      | "smarthint_anonymous_consumer"
      | "smarthint_session"
      | "smarthint_timestamp"
      | "smarthint_origin",
  ) => {
    setCookie({
      value: segment,
      name: type,
      path: "/",
    });
  };

  async function sha256Hash(input: string) {
    const utf8Encoder = new TextEncoder();
    const inputBytes = utf8Encoder.encode(input);

    const hashBuffer = await crypto.subtle.digest("SHA-256", inputBytes);

    return Array.prototype.map.call(new Uint8Array(hashBuffer), (byte) => {
      return ("00" + byte.toString(16)).slice(-2);
    }).join("");
  }

  async function generateUniqueIdentifier() {
    const timestamp = new Date().getTime();
    const randomComponent = Math.floor(Math.random() * 1000000);
    const inputForHash = `${timestamp}${randomComponent}`;
    const sha256 = await sha256Hash(inputForHash);
    return { hash: sha256, timestamp };
  }

  function checkDurationOrDayChange(currentTime?: string): boolean {
    if (!currentTime) {
      return true;
    }
    const currentTimeObj = new Date(currentTime);
    const now = new Date();

    if (currentTimeObj.getDate() !== now.getDate()) {
      return true;
    }

    // Check for 30 minutes of duration
    const timeDifferenceMs = now.getTime() - currentTimeObj.getTime();
    const timeDifferenceMin = timeDifferenceMs / (1000 * 60);
    if (timeDifferenceMin >= 30) {
      return true;
    }

    return false;
  }

  const verifyCookies = async () => {
    const anonymous_cookie = getSegmentFromCookie(
      "smarthint_anonymous_consumer",
    );
    if (!anonymous_cookie) {
      const { hash } = await generateUniqueIdentifier();
      setSegmentCookie(hash, "smarthint_anonymous_consumer");
    }
    const session_cookie = getSegmentFromCookie("smarthint_session");
    const session_timestamp = getSegmentFromCookie("smarthint_timestamp");
    if (
      !session_cookie || !session_timestamp ||
      checkDurationOrDayChange(session_timestamp)
    ) {
      const { hash, timestamp } = await generateUniqueIdentifier();
      setSegmentCookie(hash, "smarthint_session");
      setSegmentCookie(timestamp.toString(), "smarthint_timestamp");
    }
  };

  const pageView = async ({shcode, pages}: ReturnType<typeof loader>) => {
    const smarthint_anonymous_consumer = getSegmentFromCookie("smarthint_anonymous_consumer") as string
    const smarthint_session = getSegmentFromCookie("smarthint_session") as string
    const smarthint_timestamp = getSegmentFromCookie("smarthint_timestamp")
    const smarthint_origin = getSegmentFromCookie("smarthint_origin")

    const page = pages.find(({page}) => new URLPattern({ pathname: page}).test(window.location.href) )

    const apiEndpoint = `https://recs.smarthint.co/track/pageView?anonymousConsumer=${encodeURIComponent(smarthint_anonymous_consumer)}&session=${encodeURIComponent(smarthint_session)}&shcode=${encodeURIComponent(shcode)}&url=${encodeURIComponent(window.location.href)}&date=${encodeURIComponent(getData())}&pageType=${encodeURIComponent(page?.pageType ?? "other")}&elapsedTime=${encodeURIComponent(diffInSeconds(Number(smarthint_timestamp)))}&origin=${encodeURIComponent(smarthint_origin ?? window.location.href)}`;

    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    };

try {
  await fetch(apiEndpoint, requestOptions);

} catch (error) {
  console.error("Error sending request:", error);
}

    setSegmentCookie(window.location.href, "smarthint_origin")
  }

  verifyCookies();
  console.log(props)
  pageView(props)
};

export default function (props: ReturnType<typeof loader>) {
  return (
    <Head>
      <script src={scriptAsDataURI(tracking, props)} defer type="text/javascript" />
    </Head>
  );
}
