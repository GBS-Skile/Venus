import { model, Schema } from 'mongoose';

const utteranceSchema = new Schema({
  dialogue: Schema.Types.ObjectId,
  isSpeakerBot: Boolean,
  createdAt: { type: Date, default: Date.now },
  text: String,
});

const Utterance = model('Utterance', utteranceSchema);

export default Utterance;
