// TODO: set to https://data-star.dev/
const url = `http://localhost:8080/errors`;

export const hasValNonExpr = /([\w0-9.]+)\.value/gm;

export const dsErr = (code: string, args?: any) => {
    const e = new Error();
    e.name = `error ${code}`;
    const fullURL = `${url}/${code}?${new URLSearchParams(args)}`;
    e.message = `for more info see ${fullURL}`;
    return e;
};
