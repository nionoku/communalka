export class Api {
  /**
   * @param {string} credentials login:password
   */
  getToken(credentials: string) {
    const url = new URL('/api/v7/users/auth', process.env.PESC_BASE_URl);

    const [login, password] = credentials.split(':');
    const body = JSON.stringify({
      login,
      password,
      type: 'PHONE',
    });

    return fetch(url, {
      body,
    })
      .then((response) => response.json())
      .then((response: { auth: string; access: string }) => response.auth);
  }
}
