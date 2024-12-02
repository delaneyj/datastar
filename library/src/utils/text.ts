export const isBoolString = (str: string) => str.trim() === "true";

export const kebabize = (str: string) =>
    str.replace(
        /[A-Z]+(?![a-z])|[A-Z]/g,
        ($, ofs) => (ofs ? "-" : "") + $.toLowerCase(),
    );
