import { userModel } from '../schemas/userSignUp.model.js';

export default function validateUserSignUpSchema(req, res, next) {
  const { error } = userModel.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(422).send(errors);
  }

  return next();
}
