export const validJSIdentifier = `[a-zA-Z_$]+`;
export const validNestedJSIdentifier = validJSIdentifier + `[0-9a-zA-Z_$.]*`;

export function wholePrefixSuffix(
    rune: string,
    prefix: string,
    suffix: string,
    nestable = true,
) {
    const identifier = nestable ? validNestedJSIdentifier : validJSIdentifier;
    return new RegExp(
        `(?<whole>${rune}(?<${prefix}>${identifier})${suffix})`,
        `g`,
    );
}
