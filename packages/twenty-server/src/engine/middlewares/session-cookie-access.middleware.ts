import { Injectable, type NestMiddleware } from '@nestjs/common';

import { type NextFunction, type Request, type Response } from 'express';

import { removeUserSessionCookiesFromRequest } from 'src/engine/core-modules/user-session/utils/remove-user-session-cookies-from-request.util';
import { resolveSessionCookieAccess } from 'src/engine/core-modules/user-session/utils/resolve-session-cookie-access.util';

@Injectable()
export class SessionCookieAccessMiddleware implements NestMiddleware {
  use(request: Request, _response: Response, next: NextFunction): void {
    if (resolveSessionCookieAccess(request) === 'denied') {
      removeUserSessionCookiesFromRequest(request);
    }

    next();
  }
}
