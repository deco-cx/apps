import Plausible, { loader, Props } from "../../components/Plausible.tsx";

function Section(props: Props) {
  return <Plausible domain={""} {...props} />;
}

export default Section;

export { loader };

export const Preview = () => (
  <iframe
    style="width: 100%; height: 100vh; border: none;"
    src="https://plausible.io/"
  />
);
