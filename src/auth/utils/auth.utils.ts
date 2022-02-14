import { sign, verify, TokenExpiredError } from 'jsonwebtoken';
import { compare, hash, genSalt } from 'bcrypt';
import { Logger } from '../../app/app.utils';
import { Response, NextFunction } from 'express';
import { Cookie, JWT } from '../models';
import { handleErrorWithStatus } from '../../app/app.utils';
import { TypedRequest } from '../../shared/models';
import { getSecretByKey } from '../../config/config';

const logger = new Logger('auth.utils.ts');

const JWT_ALGORITHM = 'RS256';
const PUB_KEY_ACCESS_TOKEN = getSecretByKey('PUB_KEY_ACCESS_TOKEN');
const PRIV_KEY_ACCESS_TOKEN = getSecretByKey('PRIV_KEY_ACCESS_TOKEN');
const PUB_KEY_REFRESH_TOKEN = getSecretByKey('PUB_KEY_REFRESH_TOKEN');
const PRIV_KEY_REFRESH_TOKEN = getSecretByKey('PRIV_KEY_REFRESH_TOKEN');

export async function isPasswordValid(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

export async function generatePassword(password: string): Promise<string> {
  return hash(password, await genSalt());
}

export async function issueToken(
  userId: string,
  type: 'access' | 'refresh'
): Promise<string> {
  return new Promise<string>((resolve, reject) =>
    sign(
      { sub: userId },
      type === 'access' ? PRIV_KEY_ACCESS_TOKEN : PRIV_KEY_REFRESH_TOKEN,
      {
        algorithm: JWT_ALGORITHM,
        expiresIn: type === 'access' ? '1d' : '90d',
      },
      (e: Error, encoded: string) => (encoded ? resolve(encoded) : reject(e))
    )
  );
}

export function getCookieValue(
  req: TypedRequest<unknown>,
  cookieName: Cookie
): string {
  const cookies: string[] = req.headers.cookie.split('; ');
  const cookie: string = cookies.find((cookie: string) =>
    cookie.startsWith(cookieName)
  );
  return cookie ? cookie.split(`${cookieName}=`)[1] : null;
}

/**
 * Issues a new access and refresh token and appends them as auth cookies to the response object.
 * @param userId - userId
 * @param res - response
 */
export async function issueNewAuthCookies(
  userId: string,
  req: TypedRequest<unknown>,
  res: Response,
  next?: NextFunction,
  send = false
): Promise<void> {
  Promise.all([
    issueToken(userId, 'access'),
    issueToken(userId, 'refresh'),
  ]).then(
    async (tokens: [string, string]) => {
      const [accessToken, refreshToken] = tokens;
      let accessTokenExpiry: number;
      let refreshTokenExpiry: number;
      try {
        accessTokenExpiry = await verifyToken(
          accessToken,
          PUB_KEY_ACCESS_TOKEN
        ).then((jwt: JWT) => jwt.exp);
        refreshTokenExpiry = await verifyToken(
          refreshToken,
          PUB_KEY_REFRESH_TOKEN
        ).then((jwt: JWT) => jwt.exp);
      } catch (error) {
        logger.log('[issueNewAuthCookies]', error);
      }

      res
        .cookie('accessToken', accessToken, {
          secure: false,
          httpOnly: true,
          expires: new Date(accessTokenExpiry * 1000),
        })
        .cookie('refreshToken', refreshToken, {
          secure: false,
          httpOnly: true,
          expires: new Date(refreshTokenExpiry * 1000),
        });
      req.userId = userId;
      if (next) next();
      if (send) res.send();
    },
    (e) => handleErrorWithStatus(500, e, req, res, logger)
  );
}

export async function issueAuthCookiesFromRefreshToken(
  refreshToken: string,
  req: TypedRequest<unknown>,
  res: Response,
  next: NextFunction
): Promise<void> {
  verifyToken(refreshToken, PUB_KEY_REFRESH_TOKEN)
    .then((jwt: JWT) => issueNewAuthCookies(jwt.sub, req, res, next))
    .catch(() => res.sendStatus(401));
}

export async function verifyAccessToken(
  req: TypedRequest<unknown>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const accessToken: string = getCookieValue(req, Cookie.AccessToken);
  const refreshToken: string = getCookieValue(req, Cookie.RefreshToken);

  if (!accessToken && !refreshToken) {
    res.sendStatus(401);
    return;
  }

  if (!accessToken && refreshToken) {
    issueAuthCookiesFromRefreshToken(refreshToken, req, res, next);
    return;
  }

  verifyToken(accessToken, PUB_KEY_ACCESS_TOKEN)
    .then((jwt: JWT) => {
      req.userId = jwt.sub;
      next();
    })
    .catch((e: Error) => {
      if (e instanceof TokenExpiredError) {
        issueAuthCookiesFromRefreshToken(refreshToken, req, res, next);
      } else {
        logger.log('[verifyAccessToken]', e);
        res.sendStatus(401);
      }
    });
}

export async function verifyToken(token: string, key: string): Promise<JWT> {
  return new Promise((resolve, reject) =>
    verify(
      token,
      key,
      { algorithms: [JWT_ALGORITHM] },
      (e: Error, decoded: JWT) => (decoded ? resolve(decoded) : reject(e))
    )
  );
}

// export async function generateNewKeys(
//   req: TypedRequest<null>
// ): Promise<boolean> {
//   const accessToken = getCookieValue(req, Cookie.AccessToken);
//   if (!accessToken) return false;

//   const jwt: JWT | void = await verifyToken(
//     accessToken,
//     PUB_KEY_ACCESS_TOKEN
//   ).catch((e) => logger.log('[generateNewKeys]', e));
//   const adminUser = await User.findOne({ email: 'admin' });

//   if (!jwt || !adminUser) return false;

//   const isAdmin = jwt.sub == adminUser.get('id');
//   if (isAdmin) {
//     generateNewKeyPair();
//   }
//   return isAdmin;
// }
