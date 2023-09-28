import Jitsu, { Props as JitsuProps } from "../../components/Jitsu.tsx";

type Props = JitsuProps;

function Section(props: Props) {
  return <Jitsu domain={""} path={""} {...props} />;
}

export default Section;

export const Preview = () => (
  <iframe
    style="width: 100%; height: 100vh; border: none;"
    src="https://jitsu.com/"
  />
);
