import signInModel from '../schemas/signIn.model.js';

export default function signInMiddleware(req, res, next) {
  const user = req.body;
  const validation = signInModel.validate(user, { abortEarly: false });
  if (validation.error) {
    const errors = validation.error.details.map((detail) => detail.message);
    return res.status(422).send(errors);
  }
  res.locals.user = user;
  next();
}
