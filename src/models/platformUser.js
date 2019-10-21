import { model, Schema } from 'mongoose';
import User from './user';

import config from '../config';

const platformUserSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  platform: String,
  socialId: String,
  context: Schema.Types.Mixed,
});

platformUserSchema.statics.findOrCreate = async function (platform, socialId) {
  const platformUser = await this.findOne({ platform, socialId })
  if (platformUser) return platformUser;

  const user = await User.create({ });
  return this.create({
    user: user._id, platform, socialId,
  });
}

platformUserSchema.statics.registerNative = function (username, password) {
  return User.register(username, password).then(
    user => this.create({
      user: user._id,
      platform: config.nativePlatform,
      socialId: username,
    })
  );
};

const PlatformUser = model('PlatformUser', platformUserSchema);

export default PlatformUser;
