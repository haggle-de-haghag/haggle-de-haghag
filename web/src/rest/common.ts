async function baseFetch<T>(url: string, method: string, body?: any): Promise<T> {
    const config: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (body != undefined) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);
    if (response.status != 200) {
        throw new HttpStatusError(response.status, response.statusText);
    }
    return await response.json() as T;
}

export async function get<T>(url: string): Promise<T> {
    return baseFetch<T>(url, 'GET');
}

export function post<T>(url: string, body?: any): Promise<T> {
    return baseFetch<T>(url, 'POST', body);
}

export function patch<T>(url: string, body?: any): Promise<T> {
    return baseFetch<T>(url, 'PATCH', body);
}

class HttpStatusError {
    readonly statusCode: number;
    readonly message: string;

    constructor(statusCode: number, message: string) {
        this.statusCode = statusCode;
        this.message = message;
    }
}