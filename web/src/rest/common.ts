import {CANCEL} from "redux-saga";

declare global {
    const API_BASE_URL: string;
}

export type AbortablePromise<T> = Promise<T> & {
    abort: () => void;
};

function baseFetch<T>(api: string, method: string, body?: any): AbortablePromise<T> {
    const abortController = new AbortController();
    const config: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        signal: abortController.signal,
    };
    if (body != undefined) {
        config.body = JSON.stringify(body);
    }

    const promise: Promise<T> = async function() {
        const response = await fetch(`${API_BASE_URL}/${api}`, config);
        if (response.status == 404) {
            throw new NotFoundError(response.statusText);
        } else if (response.status != 200) {
            throw new HttpStatusError(response.status, response.statusText);
        }
        return await response.json() as T;
    }();
    const abortFunc = () => abortController.abort();
    return Object.assign(promise, {
        abort: abortFunc,
        [CANCEL]: abortFunc // For Redux-Saga: See https://redux-saga.js.org/docs/api/#canceltask
    });
}

export function get<T>(api: string): AbortablePromise<T> {
    return baseFetch<T>(api, 'GET');
}

export function post<T>(api: string, body?: any): AbortablePromise<T> {
    return baseFetch<T>(api, 'POST', body);
}

export function patch<T>(api: string, body?: any): AbortablePromise<T> {
    return baseFetch<T>(api, 'PATCH', body);
}

export function del<T>(api: string, body?: any): AbortablePromise<T> {
    return baseFetch<T>(api, 'DELETE', body);
}

export class HttpStatusError {
    readonly statusCode: number;
    readonly message: string;

    constructor(statusCode: number, message: string) {
        this.statusCode = statusCode;
        this.message = message;
    }
}

export class NotFoundError {
    readonly message: string;

    constructor(message: string) {
        this.message = message;
    }
}