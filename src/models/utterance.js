import { model, Schema } from 'mongoose';

const utteranceSchema = new Schema({
  dialogue: {
    type: Schema.Types.ObjectId,
    ref: 'Dialogue',
  },
  isSpeakerBot: Boolean,
  createdAt: { type: Date, default: Date.now },
  text: String,
});

const Utterance = model('Utterance', utteranceSchema);

export default Utterance;
