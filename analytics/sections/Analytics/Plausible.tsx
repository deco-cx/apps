import Plausible, { Props } from "../../components/Plausible.tsx";

function Section(props: Props) {
  return <Plausible {...props} />;
}

export default Section;

export const Preview = () => (
  <iframe
    style="width: 100%; height: 100vh; border: none;"
    src="https://plausible.io/"
  />
);
