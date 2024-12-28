import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    urls: [{ type: Schema.Types.ObjectId, ref: "urls" }],
  },
  { timestamps: true }
);

const User = model("users", UserSchema);

export default User;


