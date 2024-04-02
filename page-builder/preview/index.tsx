import { JSX } from "preact/jsx-runtime";
import { state } from "../mod.ts";
import Theme from "../../website/components/Theme.tsx";
// import pageManifest from "manifest";

// deno-lint-ignore no-explicit-any
const styles: Record<string, any> = {
  parent: {
    padding: "1rem",
    margin: "2rem auto",
    maxWidth: "42rem",
    backgroundColor: "#ffffff",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "1rem",
  },
  section: {
    width: "100%",
    marginTop: "1rem",
  },
  sectionTitle: {
    marginBottom: "1rem",
    fontSize: "1.25rem",
    lineHeight: "1.75rem",
    fontWeight: 600,
  },
  colorsContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
} as const;

export default function Preview() {
  const fontFamily = state?.fontFamily ?? "Roboto";

  return (
    <>
      <Theme
        colorScheme="light"
        fonts={[{
          family: fontFamily,
          styleSheet:
            `@import url('https://fonts.googleapis.com/css2?family=${fontFamily}:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap');body{font-family: '${fontFamily}', sans-serif;}`,
        }]}
      />
      <div style={styles.parent}>
        <div style={styles.container}>
          <img src={state?.icon} style={{ width: "64px" }} />
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>COLOR PALETTE</h2>
            <div style={styles.colorsContainer}>
              <div style={{ width: "100%" }}>
                <div
                  style={{
                    backgroundColor: state?.colors.primary.hex,
                    height: "96px",
                  }}
                />
                <p
                  style={{
                    marginTop: "8px",
                    fontSize: "12px",
                    textAlign: "start",
                  }}
                >
                  Primary: {state?.colors.primary.hex}
                </p>
              </div>
              <div style={{ width: "100%" }}>
                <div
                  style={{
                    backgroundColor: state?.colors.secondary.hex,
                    height: "96px",
                  }}
                />
                <p
                  style={{
                    marginTop: "8px",
                    fontSize: "12px",
                    textAlign: "end",
                  }}
                >
                  Secondary: {state?.colors.secondary.hex}
                </p>
              </div>
            </div>
          </div>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>FONT SELECTION</h2>
            <div>
              <h3 class="font-medium mb-2">{fontFamily}</h3>
              <p class="text-sm leading-tight">
                ABCDEFGHIJKLMNOPQRSTUVWXYZ
                <br />
                abcdefghijklmnopqrstuvwxyz
                <br />
                1234567890
              </p>
            </div>
          </div>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>MOODBOARD</h2>
            <div class="grid grid-cols-3 gap-4">
              <img
                alt="Moodboard image"
                class="w-full h-auto"
                height="100"
                src="https://fakeimg.pl/512x512?text=+"
                style={{
                  aspectRatio: "100/100",
                  objectFit: "cover",
                }}
                width="100"
              />
              <img
                alt="Moodboard image"
                class="w-full h-auto"
                height="100"
                src="https://fakeimg.pl/512x512?text=+"
                style={{
                  aspectRatio: "100/100",
                  objectFit: "cover",
                }}
                width="100"
              />
              <img
                alt="Moodboard image"
                class="w-full h-auto"
                height="100"
                src="https://fakeimg.pl/512x512?text=+"
                style={{
                  aspectRatio: "100/100",
                  objectFit: "cover",
                }}
                width="100"
              />
              <img
                alt="Moodboard image"
                class="w-full h-auto"
                height="100"
                src="https://fakeimg.pl/512x512?text=+"
                style={{
                  aspectRatio: "100/100",
                  objectFit: "cover",
                }}
                width="100"
              />
              <img
                alt="Moodboard image"
                class="w-full h-auto"
                height="100"
                src="https://fakeimg.pl/512x512?text=+"
                style={{
                  aspectRatio: "100/100",
                  objectFit: "cover",
                }}
                width="100"
              />
              <img
                alt="Moodboard image"
                class="w-full h-auto"
                height="100"
                src="https://fakeimg.pl/512x512?text=+"
                style={{
                  aspectRatio: "100/100",
                  objectFit: "cover",
                }}
                width="100"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ReplaceIcon(props: JSX.SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 4c0-1.1.9-2 2-2" />
      <path d="M20 2c1.1 0 2 .9 2 2" />
      <path d="M22 8c0 1.1-.9 2-2 2" />
      <path d="M16 10c-1.1 0-2-.9-2-2" />
      <path d="m3 7 3 3 3-3" />
      <path d="M6 10V5c0-1.7 1.3-3 3-3h1" />
      <rect width="8" height="8" x="2" y="14" rx="2" />
    </svg>
  );
}
