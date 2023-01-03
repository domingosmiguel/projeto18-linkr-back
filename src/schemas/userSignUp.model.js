import Joi from 'joi';

export const userModel = Joi.object({
  username: Joi.string().min(4).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(50).required(),
  pictureUrl: Joi.string()
    .pattern(new RegExp('https?://(www.)?[^/]*?/?([^$]*?$)?'))
    .required(),
});
