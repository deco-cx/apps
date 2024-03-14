import { state } from "../mod.ts";

export default function preview() {
    return (
        <div class="flex flex-col items-center container">
            <div class="w-52 h-4" style={{ backgroundColor: state?.primary }} />
            <div class="w-52 h-4" style={{ backgroundColor: state?.secondary }} />
        </div>
    )
}