import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import connection from '../database.js';

dotenv.config();

export default async function jwtValidation(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: 'The token was not informed!' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).send({ message: 'Invalid token!' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).send({ message: 'Malformatted Token!' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Invalid token!' });
    }
    const session = await connection.query(
      'SELECT * FROM sessions WHERE id = $1;',
      [decoded.sessionId.rows[0].id]
    );
    if (!session.rowCount) {
      return res.status(401).send({ message: 'Invalid token!' });
    }

    res.locals.userId = session.rows[0].userId;
    res.locals.sessionId = session.rows[0].id;

    return next();
  });
}
