import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import {
  checkFollow,
  countNewUserPosts,
  createUser,
  deleteSession,
  findUserEmail,
  getMoreTlPosts,
  getTlPosts,
  getTlUser,
  getUserByInputSearch,
  getUserURFollowing,
  insertSession,
  newFollower,
  rmFollower,
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
      return res.send(token);
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
  const { userId } = res.locals;

  try {
    const { rows: searchUsers } = await getUserByInputSearch(search);
    const searchUsersIds = searchUsers.map((user) => user.id);
    const { rows: searchUsersFollowing } = await getUserURFollowing(
      searchUsersIds,
      userId
    );
    const allUsers = searchUsersFollowing;
    searchUsers.forEach((user) => allUsers.push(user));

    const seen = {};
    const totalLength = allUsers.length;

    let response = [];
    let j = 0;

    for (let i = 0; i < totalLength; i++) {
      let item = allUsers[i];
      let id = item.id;
      if (seen[id] === undefined) {
        seen[id] = j;
        response[j++] = { ...item, following: false };
      } else {
        response[seen[id]] = { ...item, following: true };
      }
    }
    return res.send(response);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

export const userTimeline = async (req, res) => {
  const { id } = req.params;
  const hashtags = res.locals.trendingHashtags;
  const { user } = res.locals;
  const { sessionId } = res.locals;
  try {
    const {
      rows: [timelineUser],
    } = await getTlUser(id);
    const { rowCount, rows: timelinePosts } = await getTlPosts(id);
    return res.send({
      user,
      timelineUser,
      timelinePosts: timelinePosts.slice(0, 10),
      hashtags,
      sessionId,
      hasMore: rowCount > 10,
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

export const userTimelineMorePosts = async (req, res) => {
  const { id } = req.params;
  const { timestamp } = req.params;
  try {
    const { rowCount, rows: timelinePosts } = await getMoreTlPosts(
      id,
      timestamp
    );
    return res.send({
      timelinePosts: timelinePosts.slice(0, 10),
      hasMore: rowCount > 10,
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

export async function getCountNewUserPosts(req, res) {
  const { timestamp } = req.params;
  const { id } = req.params;

  try {
    const {
      rows: [{ count }],
    } = await countNewUserPosts(id, timestamp);

    return res.send({ number: parseFloat(count) });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export const seeIfFollow = async (req, res) => {
  const { userId } = res.locals;
  const { id } = req.params;

  try {
    const {
      rows: [{ isFollower }],
    } = await checkFollow(id, userId);
    return res.send({
      isFollower: parseInt(isFollower) ? true : false,
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

export const postNewFollow = async (req, res) => {
  const { userId } = res.locals;
  const { id } = req.params;

  try {
    await newFollower(id, userId);
    return res.sendStatus(201);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

export const deleteFollow = async (req, res) => {
  const { userId } = res.locals;
  const { id } = req.params;

  try {
    await rmFollower(id, userId);
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};
