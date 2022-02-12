import { Schema, model } from 'mongoose';
import { AppUser } from '../models';

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = model<AppUser>('User', UserSchema);

export default User;
