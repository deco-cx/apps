import { useId } from "preact/hooks";

export interface Props {
  /**
   * @title Spire Blog Slug
   * @description Your Spire account blog slug (e.g., "miess")
   */
  blogSlug: string;
  /**
   * @title Spire Dashboard Base URL
   * @description The base URL of your Spire instance (default: https://spire.blog)
   */
  spireUrl?: string;
  /**
   * @title Container Height
   * @description Height of the embedded dashboard (default: 800px)
   */
  height?: string;
}

/**
 * @title Spire Dashboard
 * @description Embeds your Spire AI Blog Dashboard natively inside Deco Admin for seamless content generation and campaign management.
 */
export default function SpireDashboard({
  blogSlug,
  spireUrl = "https://spire.blog",
  height = "800px",
}: Props) {
  const id = useId();

  if (!blogSlug) {
    return (
      <div class="max-w-6xl mx-auto my-8 p-8 text-center bg-gray-900 text-white rounded-xl border border-gray-800">
        <h3 class="text-lg font-bold text-red-400">Configuration Required</h3>
        <p class="text-sm text-gray-400 mt-2">
          Please configure your Spire Blog Slug in the section properties to embed the dashboard.
        </p>
      </div>
    );
  }

  // Construct the embedded URL passing the embed=true search param
  const embeddedUrl = `${spireUrl}/app/${blogSlug}?embed=true`;

  return (
    <div 
      id={id} 
      class="max-w-7xl mx-auto my-6 bg-black rounded-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Seamless Iframe container */}
      <div class="w-full relative" style={{ height }}>
        <iframe
          src={embeddedUrl}
          title="Spire Dashboard"
          class="w-full h-full border-none bg-black"
          allow="clipboard-write; camera; microphone; geolocation"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
        />
      </div>
    </div>
  );
}
