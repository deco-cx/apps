import SecretLoader, {
  Props,
  Secret,
} from "../../../website/loaders/secret.ts";

/**
 * @deprecated true
 */
export default function Secret(props: Props): Promise<Secret> {
  return SecretLoader(props);
}
