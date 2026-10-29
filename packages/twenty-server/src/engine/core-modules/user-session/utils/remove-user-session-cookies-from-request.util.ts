import { isNonEmptyString } from '@sniptt/guards';
import { type Request } from 'express';

import { USER_SESSION_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-cookie-name.constant';
import { USER_SESSION_IMPERSONATOR_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-impersonator-cookie-name.constant';
import { USER_SESSION_IMPERSONATOR_SECURE_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-impersonator-secure-cookie-name.constant';
import { USER_SESSION_SECURE_COOKIE_NAME } from 'src/engine/core-modules/user-session/constants/user-session-secure-cookie-name.constant';

const USER_SESSION_COOKIE_NAMES = new Set([
  USER_SESSION_COOKIE_NAME,
  USER_SESSION_SECURE_COOKIE_NAME,
  USER_SESSION_IMPERSONATOR_COOKIE_NAME,
  USER_SESSION_IMPERSONATOR_SECURE_COOKIE_NAME,
]);

export const removeUserSessionCookiesFromRequest = (request: Request): void => {
  const cookieHeader = request.headers.cookie;

  if (!isNonEmptyString(cookieHeader)) {
    return;
  }

  const remainingCookieParts = cookieHeader
    .split(';')
    .map((cookiePart) => cookiePart.trim())
    .filter(
      (cookiePart) =>
        !USER_SESSION_COOKIE_NAMES.has(cookiePart.split('=', 1)[0].trim()),
    );

  if (remainingCookieParts.length === 0) {
    delete request.headers.cookie;

    return;
  }

  request.headers.cookie = remainingCookieParts.join('; ');
};
