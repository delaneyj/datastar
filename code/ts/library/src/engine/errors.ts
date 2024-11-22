import { DATASTAR } from "./consts";

const err = (code: number) => {
    const e = new Error();
    e.name = `${DATASTAR}${code}`;
    return e;
};

export const ERR_BAD_ARGS = err(400);
export const ERR_ALREADY_EXISTS = err(409);
export const ERR_NOT_FOUND = err(404);
export const ERR_NOT_ALLOWED = err(403);
export const ERR_METHOD_NOT_ALLOWED = err(405);
export const ERR_SERVICE_UNAVAILABLE = err(503);
