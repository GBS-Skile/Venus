import { model, Schema } from 'mongoose';

const platformUserSchema = new Schema({
  user: Schema.Types.ObjectId,
  platform: String,
  socialId: String,
});

const PlatformUser = model('PlatformUser', platformUserSchema);

export default PlatformUser;
