import crypto from 'crypto';
import { model, Schema } from 'mongoose';

const userSchema = new Schema({
  username: {
    type: String,
    trim: true,
    match: /^[A-Za-z0-9\-_]+$/,
  },
  password: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  context: { type: Schema.Types.Mixed, default: {} },
});

if (!process.env.SALT) {
  throw new Error('the environment variable `SALT` is undefined.');
}

const hash = (username, password) => crypto.createHash('sha256')
  .update(username + process.env.SALT + password).digest('base64');

userSchema.statics.register = async function (username, password, context) {
  if (!username || !password) throw new Error("Fields required: username and password");
  if (await this.findOne({ username, })) throw new Error(`Username ${username} already exists.`);
  return this.create({
    username,
    password: hash(username, password),
    context,
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
