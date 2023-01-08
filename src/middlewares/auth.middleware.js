import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { getSessionById } from '../repository/users.repositories.js';

dotenv.config();

export default async function jwtValidation(req, res, next) {
  const { authorization } = req.headers;
  const token = authorization?.replace('Bearer ', '');

  try {
    const {
      sessionId: {
        rows: [{ id }],
      },
    } = jwt.verify(token, process.env.JWT_SECRET);
    const {
      rowCount: loginAuthorized,
      rows: [{ userId }],
    } = await getSessionById(id);
    if (!loginAuthorized) throw new Error();
    res.locals.userId = userId;
    res.locals.sessionId = id;
    next();
  } catch {
    res.status(401).send({ message: 'Access denied' });
  }
}
