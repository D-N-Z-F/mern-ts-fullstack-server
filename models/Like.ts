import mongoose, { Document, Schema, model } from "mongoose";
import { UserI } from "./User";
import { SongI } from "./Song";

const ObjectId = mongoose.Schema.Types.ObjectId;

export interface LikeI extends Document {
  user: mongoose.Types.ObjectId | UserI;
  songs: Array<mongoose.Types.ObjectId | SongI>;
}

const likeSchema = new Schema<LikeI>({
  user: { type: ObjectId, ref: "User" },
  songs: [{ type: ObjectId, ref: "Song" }],
});

const Like = model<LikeI>("Like", likeSchema);

export default Like;
