export function argsToMs(args: string[] | undefined) {
    if (!args || args?.length === 0) return 0;

    for (const arg of args) {
        if (arg.endsWith("ms")) {
            return Number(arg.replace("ms", ""));
        } else if (arg.endsWith("s")) {
            return Number(arg.replace("s", "")) * 1000;
        }

        try {
            return parseFloat(arg);
        } catch (e) {}
    }

    return 0;
}

export function argsHas(
    args: string[] | undefined,
    arg: string,
    defaultValue = false,
) {
    if (!args) return false;
    return args.includes(arg) || defaultValue;
}
