type TypedResponse<T> = Promise<
  Omit<Response, 'json'> & { json: () => Promise<T> }
>;

export { TypedResponse };
