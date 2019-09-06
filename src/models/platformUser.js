import { model, Schema } from 'mongoose';

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

const PlatformUser = model('PlatformUser', platformUserSchema);

export default PlatformUser;
