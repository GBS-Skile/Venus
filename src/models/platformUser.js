import { model, Schema } from 'mongoose';
import User from './user';

const platformUserSchema = new Schema({
  user: Schema.Types.ObjectId,
  platform: String,
  socialId: String,
  context: Schema.Types.Mixed,
});

platformUserSchema.statics.findOrCreate = function (platform, socialId) {
  return this.findOneAndUpdate(
    { platform, socialId },
    { },
    { upsert: true, new: true }
  );
}

platformUserSchema.statics.registerNative = function (username, password) {
  const NATIVE_PLATFORM_NAME = 'storyforest';

  return User.register(username, password).then(
    user => this.create({
      user: user._id,
      platform: NATIVE_PLATFORM_NAME,
      socialId: username,
    })
  );
};

const PlatformUser = model('PlatformUser', platformUserSchema);

export default PlatformUser;
