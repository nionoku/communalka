const makeCookiesString = <T extends Record<string, string>>(cookies: T) => {
  return Object.entries(cookies)
    .map((values) => values.join('='))
    .join(', ');
};

export { makeCookiesString };
