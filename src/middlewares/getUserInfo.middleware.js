import { getUserById } from '../repository/users.repositories.js';

export default async function getUserInfo(req, res, next) {
  const { userId } = res.locals;
  try {
    const user = await getUserById(userId);
    res.locals.user = user.rows[0];
    return next();
  } catch (err) {
    return res.sendStatus(500);
  }
}
