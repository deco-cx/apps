import Plausible, { type Props } from "../../components/DecoAnalytics.tsx";

function Section(props: Props) {
  return <Plausible {...props} />;
}

export const Preview = () => (
  <iframe
    style="width: 100%; height: 100vh; border: none;"
    src="https://plausible.io/"
  />
);

export default Section;
