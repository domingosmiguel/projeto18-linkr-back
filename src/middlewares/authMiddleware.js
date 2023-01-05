import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import connection from '../database.js';

dotenv.config();

export default async function authMiddleware(req, res, next) {
  dotenv.config();
  const { authorization } = req.headers;
  const token = authorization?.replace('Bearer ', '');

  try {
    const { sessionId } = jwt.verify(token, process.env.JWT_SECRET);
    const loginAuthorized  = await connection.query(
      'SELECT * FROM sessions WHERE id = $1',
      [sessionId]
    );
    console.log(loginAuthorized.rows);
    if (!loginAuthorized.rowCount) throw new Error();
    res.locals.userId = loginAuthorized.userId;
    next();
  } catch (error){
    console.log(error)
    res.status(401).send('Access denied');
  
  }
}
