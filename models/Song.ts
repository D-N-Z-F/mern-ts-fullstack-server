import mongoose, { Document, Schema, model } from "mongoose";
import Joi from "joi";

export interface SongI extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  artist: string;
  song: string;
  image: string;
  duration: string;
}

const SongSchema = new Schema<SongI>({
  name: { type: String, required: true },
  artist: { type: String, required: true },
  song: { type: String, required: true },
  image: { type: String, default: null },
  duration: { type: String, required: true },
});

const Song = model<SongI>("Song", SongSchema);

export const validateSong = (song: SongI) => {
  const schema = Joi.object({
    name: Joi.string().max(18).required(),
    artist: Joi.string().max(18).required(),
    duration: Joi.string().required(),
  });

  return schema.validate(song);
};

export default Song;
