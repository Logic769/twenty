import { type Request, type Response } from 'express';
import {
  FRONT_COMPONENT_HOST_FETCH_HEADER_NAME,
  SESSION_COOKIE_OPT_IN_HEADER_NAME,
} from 'twenty-shared/constants';

import { SessionCookieAccessMiddleware } from 'src/engine/middlewares/session-cookie-access.middleware';

const COOKIE_HEADER =
  '__Host-twenty-session=sess_abc; theme=dark; twenty-impersonator-session=sess_def';

describe('SessionCookieAccessMiddleware', () => {
  const middleware = new SessionCookieAccessMiddleware();

  const runMiddleware = (headers: Record<string, string>) => {
    const request = {
      headers: { cookie: COOKIE_HEADER, ...headers },
    } as unknown as Request;
    const next = jest.fn();

    middleware.use(request, {} as Response, next);

    return { request, next };
  };

  it('should remove the session cookies from front component host fetches', () => {
    const { request, next } = runMiddleware({
      'sec-fetch-mode': 'cors',
      [FRONT_COMPONENT_HOST_FETCH_HEADER_NAME]: '1',
    });

    expect(request.headers.cookie).toBe('theme=dark');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should drop the cookie header when only session cookies were sent', () => {
    const { request } = runMiddleware({
      cookie: '__Host-twenty-session=sess_abc',
      [FRONT_COMPONENT_HOST_FETCH_HEADER_NAME]: '1',
    });

    expect(request.headers.cookie).toBeUndefined();
  });

  it.each([
    ['opted-in requests', { [SESSION_COOKIE_OPT_IN_HEADER_NAME]: '1' }],
    ['top-level navigations', { 'sec-fetch-mode': 'navigate' }],
    ['legacy requests', { 'sec-fetch-mode': 'cors' }],
  ])('should keep the session cookies on %s', (_description, headers) => {
    const { request, next } = runMiddleware(headers);

    expect(request.headers.cookie).toBe(COOKIE_HEADER);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
