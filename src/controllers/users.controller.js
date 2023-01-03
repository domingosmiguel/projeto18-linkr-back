import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import connection from '../database.js';
import { insertSession, selectUser } from '../repository/users.repositories.js';

dotenv.config();

export async function userSignUp(req, res) {
  const { email, username, password, pictureUrl } = req.body;
  // if (password !== confirmPassword) {
  //   return res.sendStatus(400);
  // }
  try {
    const hashPassword = bcrypt.hashSync(password, 12);
    await connection.query(
      'INSERT INTO users (username, email, password, "pictureUrl") VALUES ($1, $2, $3, $4)',
      [username, email, hashPassword, pictureUrl]
    );
    res.sendStatus(201);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

export const signIn = async (req, res) => {
  const { email, password } = res.locals.user;
  try {
    const {
      rows: [user],
    } = await selectUser(email);
    if (user && bcrypt.compareSync(password, user.password)) {
      const sessionId = await insertSession(user.id);
      const token = jwt.sign({ sessionId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });
      return res.status(200).send(token);
    }
    return res.status(401).send('Invalid email or password');
  } catch (error) {
    console.log(error);
    return res.status(500).send('Error logging in');
  }
};
