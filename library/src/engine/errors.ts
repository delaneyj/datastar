import { kebabize } from "../utils/text";
import { DATASTAR } from "./consts";

const url = `https://data-star.dev/docs/errors`;

export const hasValNonExpr = /([\w0-9.]+)\.value/gm;

export const dsErr = (code: string, args?: any) => {
    const e = new Error();
    e.name = `${DATASTAR}${code}`;
    const fullURL = `${url}/${kebabize(code)}?${new URLSearchParams(args)}`;
    e.message = `${DATASTAR}${code}, for more info see ${fullURL}`;
    return e;
};
