import mongoose, { Document, Schema, model } from "mongoose";
import Joi from "joi";
import JoiPasswordComplexity from "joi-password-complexity";

export interface UserI extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  username: string;
  email: string;
  password: string;
  gender: string;
  image: string;
  joinedAt: Date;
  isVerified: boolean;
  isPremium: boolean;
  isAdmin: boolean;
}

const UserSchema = new Schema<UserI>({
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  gender: { type: String, required: true },
  image: { type: String, default: null },
  joinedAt: { type: Date, default: Date.now() },
  isVerified: { type: Boolean, default: false },
  isPremium: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
});

const User = model<UserI>("User", UserSchema);

export const validateUser = (user: UserI) => {
  const options = { min: 8, max: 16 };

  const schema = Joi.object({
    name: Joi.string().min(3).max(12).required(),
    username: Joi.string().min(3).max(12).required(),
    email: Joi.string().email().required(),
    password: JoiPasswordComplexity(options).required(),
    gender: Joi.string()
      .valid("male", "female", "non-binary", "undisclosed")
      .required(),
    image: Joi.any(),
  });

  return schema.validate(user);
};

export default User;
