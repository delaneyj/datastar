export function remoteSignals(obj: Object): Object {
    const res: Record<string, any> = {};

    for (const [k, v] of Object.entries(obj)) {
        if (k.startsWith("_")) {
            continue;
        } else if (typeof v === "object" && !Array.isArray(v)) {
            res[k] = remoteSignals(v); // recurse
        } else {
            res[k] = v;
        }
    }

    return res;
}

export function storeFromPossibleContents(
    currentStore: any,
    contents: any,
    hasIfMissing: boolean,
) {
    const actual: any = {};

    if (!hasIfMissing) {
        Object.assign(actual, contents);
    } else {
        for (const key in contents) {
            const currentValue = currentStore[key]?.value;
            if (currentValue === undefined || currentValue === null) {
                actual[key] = contents[key];
            }
        }
    }

    return actual;
}
