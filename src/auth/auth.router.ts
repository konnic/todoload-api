import { Router, Response } from 'express';
import { handleErrorWithStatus, Logger } from '../app/app.utils';
import * as authUtils from './utils/auth.utils';
import User from './db/user.schema';
import { TypedRequest } from '../shared/models';
import { AppUser } from './models';

const authRouter = Router();
const logger = new Logger(__filename);

async function loginUser(
  req: TypedRequest<AppUser>,
  res: Response,
  userId: string,
  status: number
): Promise<void> {
  res.status(status);
  authUtils.issueNewAuthCookies(userId, req, res, null, true);
}

authRouter.post(
  '/register',
  async (req: TypedRequest<AppUser>, res: Response) => {
    const password = await authUtils.generatePassword(req.body.password);
    new User({
      email: req.body.email,
      password,
    })
      .save()
      .then((user) => loginUser(req, res, user.get('id'), 201))
      .catch((err) => {
        err.code === 11000
          ? res
              .status(401)
              .json({ message: 'The provided email address is not available.' })
          : res.sendStatus(500);
      });
  }
);

authRouter.post('/login', async (req: TypedRequest<AppUser>, res: Response) => {
  const { email, password } = req.body;

  if (!(email && password)) {
    res.sendStatus(401);
    return;
  }

  User.findOne({ email })
    .then(async (user) => {
      if (!user) {
        res
          .sendStatus(401)
          .json({ message: `Could not find user with email: ${email}.` });
        return;
      }
      (await authUtils.isPasswordValid(password, user?.password))
        ? loginUser(req, res, user.get('id'), 200)
        : res.status(401).json({ message: 'Wrong password.' });
    })
    .catch((e) => handleErrorWithStatus(500, e, req, res, logger));
});

authRouter.delete('/logout', (req: TypedRequest<null>, res: Response) => {
  res.clearCookie('accessToken').clearCookie('refreshToken').sendStatus(204);
});

// authRouter.post('/keys', async (req: TypedRequest<null>, res: Response) =>
//   res.sendStatus((await authUtils.generateNewKeys(req)) ? 201 : 403)
// );

export default authRouter;
