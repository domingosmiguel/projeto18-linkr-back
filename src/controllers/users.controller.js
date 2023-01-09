import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import {
  createUser,
  deleteSession,
  findUserEmail,
  getTlPosts,
  getTlUser,
  getUserById,
  getUserByInputSearch,
  insertSession,
  selectUser,
} from '../repository/users.repositories.js';

dotenv.config();

export async function userSignUp(req, res) {
  const { email, username, password, pictureUrl } = req.body;
  try {
    const userFound = await findUserEmail(email);
    if (userFound.rowCount) return res.sendStatus(400);
    const hashPassword = bcrypt.hashSync(password, 12);
    await createUser(email, username, hashPassword, pictureUrl);
    return res.sendStatus(201);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
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
      const token = jwt.sign({ sessionId }, process.env.JWT_SECRET);
      delete user.password;
      return res.status(200).send(token);
    }
    return res.status(401).send('Invalid email or password');
  } catch (error) {
    return res.status(500).send('Error logging in');
  }
};

export async function logOut(req, res) {
  const { sessionId } = res.locals;
  try {
    await deleteSession(sessionId);
    res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(500);
  }
}

export const searchUsers = async (req, res) => {
  const { search } = req.query;
  try {
    const { rows: users } = await getUserByInputSearch(search);
    return res.send(users);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

export const userTimeline = async (req, res) => {
  const { id } = req.params;
  const hashtags = res.locals.trendingHashtags;
  const { userId } = res.locals;
  const { sessionId } = res.locals;
  try {
    const {
      rows: [user],
    } = await getUserById(userId);
    const {
      rows: [timelineUser],
    } = await getTlUser(id);
    const {
      rows: timelinePosts,
    } = await getTlPosts(id);
    return res.send({
      user,
      timelineUser,
      timelinePosts: timelinePosts || [],
      hashtags,
      sessionId,
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};
