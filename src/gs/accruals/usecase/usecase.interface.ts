type Handler<R> = {
  handle(): Promise<R>;
};

export { Handler };
