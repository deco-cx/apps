import { Head } from "$fresh/runtime.ts";
import { scriptAsDataURI } from "../../utils/dataURI.ts";

export interface Cookie {
  name: string;
  value: unknown;
  path: string;
}

const tracking = () => {
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
      | "smarthint_timestamp",
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
      | "smarthint_timestamp",
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
  verifyCookies();
};

export default function () {
  return (
    <Head>
      <script src={scriptAsDataURI(tracking)} defer type="text/javascript" />
    </Head>
  );
}
