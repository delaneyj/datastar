import { DATASTAR } from "./consts";

const url = `https://data-star.dev/docs/errors`;

export const dsErr = (code: string, args?: any) => {
    const e = new Error();
    e.name = `${DATASTAR}${code}`;
    let fullURL = `${url}/${code}`;
    if (!!!args) {
        fullURL += fullURL + `?${new URLSearchParams(args)}`;
    }
    e.message = `${DATASTAR}${code}, for more info see ${fullURL}`;
    return e;
};
