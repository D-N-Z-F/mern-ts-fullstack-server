import mongoose, { Document, Schema, model } from "mongoose";
import Joi from "joi";
import { UserI } from "./User";
import { SongI } from "./Song";

const ObjectId = mongoose.Schema.Types.ObjectId;

export interface PlaylistI extends Document {
  name: string;
  user: mongoose.Types.ObjectId;
  description: string;
  songs: Array<mongoose.Types.ObjectId | SongI>;
  image: string;
}

const PlaylistSchema = new Schema<PlaylistI>({
  name: { type: String, required: true },
  user: { type: ObjectId, ref: "User" },
  description: { type: String, default: "" },
  songs: [{ type: ObjectId, ref: "Song" }],
});

const Playlist = model<PlaylistI>("Playlist", PlaylistSchema);

export const validatePlaylist = (playlist: PlaylistI) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().max(50).allow(""),
    songs: Joi.array().items(Joi.string()),
  });

  return schema.validate(playlist);
};

export default Playlist;
