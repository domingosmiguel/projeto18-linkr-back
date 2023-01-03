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

  jwt.verify(token, process.env.SECRET_JWT, async (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Invalid token!' });
    }

    const user = await connection.query('SELECT * FROM users WHERE id = $1;', [
      decoded.id,
    ]);
    if (!user.rowCount) {
      return res.status(401).send({ message: 'Invalid token!' });
    }

    res.locals.userId = user.rows[0].id;

    return next();
  });
}
