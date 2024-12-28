import { Schema, model } from 'mongoose';

const URLSchema = new Schema(
  {
    // userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    userId: { type: Number },
    longUrl: { type: String, required: true },
    shortUrl: { type: String, required: true, unique: true },
    alias: { type: String, unique: true },
    topic: { type: String },
    clickId: { type: Schema.Types.ObjectId, ref: "clicks" },
  },
  { timestamps: true }
);

const URL = model("urls", URLSchema);
export default URL;
