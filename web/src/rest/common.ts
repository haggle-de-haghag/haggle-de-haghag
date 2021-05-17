declare global {
    const API_BASE_URL: string;
}

async function baseFetch<T>(api: string, method: string, body?: any): Promise<T> {
    const config: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (body != undefined) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}/${api}`, config);
    if (response.status != 200) {
        throw new HttpStatusError(response.status, response.statusText);
    }
    return await response.json() as T;
}

export function get<T>(api: string): Promise<T> {
    return baseFetch<T>(api, 'GET');
}

export function post<T>(api: string, body?: any): Promise<T> {
    return baseFetch<T>(api, 'POST', body);
}

export function patch<T>(api: string, body?: any): Promise<T> {
    return baseFetch<T>(api, 'PATCH', body);
}

export function del<T>(api: string, body?: any): Promise<T> {
    return baseFetch<T>(api, 'DELETE', body);
}

class HttpStatusError {
    readonly statusCode: number;
    readonly message: string;

    constructor(statusCode: number, message: string) {
        this.statusCode = statusCode;
        this.message = message;
    }
}