import { model, Schema, Types } from 'mongoose';

const dialogueSchema = new Schema({
  platformUser: Schema.Types.ObjectId,
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  hitAt: { type: Date, default: Date.now },
  context: { type: Schema.Types.Mixed },
  finishedAt: Date,
  finishReason: String,
});

dialogueSchema.statics.findByPlatformUser = async function (platformUser) {
  const context = await this.countDocuments({ platformUser: platformUser._id }) < 1
    ? { state: '최초' }
    : { state: 'Default' } ;
  return await this.findOneAndUpdate(
    { platformUser: platformUser._id,
      active: true,
      context, },
    {},
    { setDefaultsOnInsert: true, upsert: true, new: true }
  );
}

const Dialogue = model('Dialogue', dialogueSchema);

export default Dialogue;
