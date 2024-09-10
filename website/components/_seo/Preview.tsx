import { Head } from "$fresh/runtime.ts";
import type { ComponentChildren, ComponentProps } from "preact";
import { useMemo } from "preact/hooks";
import { ImageWidget } from "../../../admin/widgets.ts";
import type Seo from "../Seo.tsx";
import { OGType } from "../Seo.tsx";
import Discord from "./Discord.tsx";
import Facebook from "./Facebook.tsx";
import Google from "./Google.tsx";
import LinkedIn from "./LinkedIn.tsx";
import Slack from "./Slack.tsx";
import Telegram from "./Telegram.tsx";
import Twitter from "./Twitter.tsx";
import WhatsApp from "./WhatsApp.tsx";
import instructions from "./instructions.json" with { type: "json" };
import {
  DiscordIcon,
  FacebookIcon,
  GoogleIcon,
  LinkedInIcon,
  SlackIcon,
  TelegramIcon,
  WhatsAppIcon,
  XIcon,
} from "./Icons.tsx";

export type SeoProps = ComponentProps<typeof Seo>;

export interface PreviewItem {
  title: string;
  description: string;
  image: ImageWidget;
  type: OGType;
  themeColor: string;
  width: number;
  height: number;
  path: string;
}

const tailwind = {
  theme: {
    extend: {
      colors: {
        primary: "#2FD180",
        "primary-dark": "#003232",
        "primary-light": "#C5FFE9",
        secondary: "#F5F6F6",
        "divider-blue": "#2E6ED9",
        divider: "#D4DBD7",
        transparent: "transparent",
        "linkedin-bg": "#EFF3F8",
        "facebook-bg": "#F0F2F5",
        "discord-bg": "#EEEFF1",
      },
      textColor: {
        primary: "#2F3031",
        secondary: "#161616",
        third: "#2E6ED9",
        common: "#66736C",
      },
      borderColor: {
        "light-border": "#D4DBD7",
      },
    },
  },
};

const DEFAULT_ITEM: PreviewItem = {
  title: "",
  description: "",
  image: "",
  type: "website",
  themeColor: "",
  width: 120,
  height: 120,
  path: "website.com",
};

function PreviewItem(
  { title, children, instructions, icon }: {
    title: string;
    children: ComponentChildren;
    instructions: string[];
    icon?: ComponentChildren;
  },
) {
  return (
    <div class="w-[400px] flex flex-col h-full gap-[16px] sm:w-[522px]">
      <div class="flex items-center gap-2">
        {icon}
        <h2 class="uppercase text-[13px] text-primary  pr-4 leading-4 font-semibold">
          {title}
        </h2>
        <div class="flex-grow h-px bg-divider"></div>
      </div>
      {children}
      <div class="text-primary text-[13px] leading-[20px]">
        <ul>
          {instructions.map((instruction) => (
            <li class="list-disc list-inside">{instruction}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Preview(props: SeoProps) {
  const path = useMemo(() => globalThis.window.location?.host, []);

  return (
    <>
      <Head>
        <script id="cdn.tailwindcss.com" src="https://cdn.tailwindcss.com" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              `document.getElementById("cdn.tailwindcss.com").addEventListener('load', () => { tailwind.config = ${
                JSON.stringify(tailwind)
              }})
            `,
          }}
        />
      </Head>
      <section class="flex flex-col items-center p-4">
        <div class="flex flex-col max-w-6xl items-center">
          <div class="flex flex-col items-center gap-8 mb-5 lg:grid lg:grid-cols-2 lg:justify-center">
            <PreviewItem
              instructions={instructions.google}
              title="Google"
              icon={<GoogleIcon />}
            >
              <Google {...DEFAULT_ITEM} {...props} />
            </PreviewItem>
            <PreviewItem
              instructions={instructions.whatsapp}
              title="Whatsapp"
              icon={<WhatsAppIcon />}
            >
              <WhatsApp {...DEFAULT_ITEM} {...props} />
            </PreviewItem>

            <PreviewItem
              instructions={instructions.facebook}
              title="Facebook"
              icon={<FacebookIcon />}
            >
              <Facebook {...DEFAULT_ITEM} {...props} path={path} />
            </PreviewItem>
            <PreviewItem
              instructions={instructions.twitter}
              title="X (Former Twitter)"
              icon={<XIcon />}
            >
              <Twitter {...DEFAULT_ITEM} {...props} path={path} />
            </PreviewItem>

            <PreviewItem
              instructions={instructions.telegram}
              title="Telegram"
              icon={<TelegramIcon />}
            >
              <Telegram {...DEFAULT_ITEM} {...props} path={path} />
            </PreviewItem>
            <PreviewItem
              instructions={instructions.linkedin}
              title="Linkedin"
              icon={<LinkedInIcon />}
            >
              <LinkedIn {...DEFAULT_ITEM} {...props} />
            </PreviewItem>

            <PreviewItem
              instructions={instructions.slack}
              title="Slack"
              icon={<SlackIcon />}
            >
              <Slack {...DEFAULT_ITEM} {...props} path={path} />
            </PreviewItem>
            <PreviewItem
              instructions={instructions.discord}
              title="Discord"
              icon={<DiscordIcon />}
            >
              <Discord {...DEFAULT_ITEM} {...props} path={path} />
            </PreviewItem>
          </div>
        </div>
      </section>
    </>
  );
}

export default Preview;
