import { model, Schema } from 'mongoose';

const userSchema = new Schema({
  name: String,
  createdAt: { type: Date, default: Date.now },
});

const User = model('User', userSchema);

export default User;
