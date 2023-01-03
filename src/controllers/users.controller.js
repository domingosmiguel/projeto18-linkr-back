import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import connection from '../database.js';

dotenv.config();

export async function userSignUp(req, res) {
  const { email, username, password, pictureUrl } = req.body;
  if (password !== confirmPassword) {
    return res.sendStatus(400);
  }
  try {
    const hashPassword = bcrypt.hashSync(password, 12);
    await connection.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3);',
      [username, email, hashPassword, pictureUrl]
    );
    res.sendStatus(201);
  } catch (err) {
    res.sendStatus(500);
  }
}
