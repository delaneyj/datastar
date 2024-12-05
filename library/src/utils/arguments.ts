export function argsMs(args: Set<string>) {
    if (!args || args.size <= 0) return 0;
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
    args: Set<string>,
    arg: string,
    defaultValue = false,
) {
    if (!args) return defaultValue;
    return args.has(arg);
}
