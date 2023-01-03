import Joi from 'joi';

export const userModel = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  pictureUrl: Joi.string().required(),
});
