import PostHog, { type Props } from "../../components/PostHog.tsx";

function Section(props: Props) {
  return <PostHog {...props} />;
}

export const Preview = () => (
  <iframe
    style="width: 100%; height: 100vh; border: none;"
    src="https://posthog.com/"
  />
);

export default Section;
