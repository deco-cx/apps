import SecretLoader, { Secret, Props, } from "../../../website/loaders/secret.ts";

/**
 * @deprecated true
 */
export default function Secret(props : Props) : Promise<Secret>{

    return SecretLoader(props);
}