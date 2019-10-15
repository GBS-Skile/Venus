import crypto from 'crypto';
import { model, Schema } from 'mongoose';

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    match: /^[A-Za-z0-9\-_]+$/,
  },
  password: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

if (!process.env.SALT) {
  throw new Error('the environment variable `SALT` is undefined.');
}

const hash = (username, password) => crypto.createHash('sha256')
  .update(username + process.env.SALT + password).digest('base64');

userSchema.statics.register = function (username, password) {
  return this.create({
    username,
    password: hash(username, password),
  });
};

userSchema.statics.auth = async function (username, password) {
  return await this.countDocuments({
    username,
    password: hash(username, password),
  }) > 0;
}

const User = model('User', userSchema);

export default User;
