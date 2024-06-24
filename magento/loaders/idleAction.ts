import { AppContext } from "../mod.ts";

interface ReloadPageOnIdle {
    reloadPage: boolean;
}

function loader(
    _props: unknown,
    _req: Request,
    ctx: AppContext,
): ReloadPageOnIdle {
    const { idleAction } = ctx.cartConfigs;
    return { reloadPage: idleAction ?? true };
}

export default loader;
