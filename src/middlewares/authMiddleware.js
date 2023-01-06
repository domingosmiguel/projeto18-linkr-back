import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import connection from '../database.js';

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
    const { rowCount: loginAuthorized } = await connection.query(
      'SELECT * FROM sessions WHERE id = $1',
      [id]
    );
    if (!loginAuthorized) throw new Error();
    res.locals.userId = loginAuthorized.userId;
    next();
  } catch {
    res.status(401).send({ message: 'Access denied' });
  }
}
