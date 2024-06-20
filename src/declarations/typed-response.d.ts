type TypedResponse<T> = Promise<Response & { json: () => Promise<T> }>;

export { TypedResponse };
