import { model, Schema, Types } from 'mongoose';

const dialogueSchema = new Schema({
  platformUser: Schema.Types.ObjectId,
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  state: { type: String, default: 'Init' },
  finishedAt: Date,
  finishReason: String,
});

dialogueSchema.statics.findByPlatformUser = function (platformUser) {
  return this.findOneAndUpdate(
    {
      platformUser: platformUser._id,
      active: true,
    },
    {},
    { setDefaultsOnInsert: true, upsert: true, new: true }
  );
}

const Dialogue = model('Dialogue', dialogueSchema);

export default Dialogue;
