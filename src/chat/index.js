import { PlatformUser, Dialogue, Utterance } from '../models';
import Scenario from './scenario';

export const ActionEnum = {
  WELCOME: 0,
  SEND_TEXT: 1,
  SEND_IMAGE: 2,
  READ: 3,
  START_TYPING: 4,
  STOP_TYPING: 5,
};

export class PlatformAdapter {
  constructor(platformName) {
    this.platformName = platformName;
  }

  async dialogueConfig(_, platformUser) {
    return {
      initialState: await Dialogue.countDocuments(
        { platformUser: platformUser._id }
      ) < 1 ? '최초' : 'Default',
      scenario: 'beatrice',
      timeout: 3 * 60 * 60 * 1000,
    }
  };

  async getDialogue(platformUser, { tag = null }) {
    const { initialState, scenario, timeout } = await this.dialogueConfig(tag, platformUser);

    return await Dialogue.findOneAndUpdate(
      {
        platformUser: platformUser._id,
        active: true,
        tag,
        hitAt: {
          $gte: new Date(Math.max(Date.now() - timeout, 0)),
        }
      },
      {
        $setOnInsert: {
          context: { state: initialState },
          scenario,
        }
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        sort: { hitAt: -1 }
      }
    );
  }

  async request(userId, action, payload = {}) {
    const platformUser = await PlatformUser.findOrCreate(this.platformName, userId).then(
      pu => pu.populate('user').execPopulate()
    );

    switch(action) {
      case ActionEnum.SEND_TEXT:
        const dialogue = await this.getDialogue(platformUser, payload);
        
        await Utterance.create({
          dialogue: dialogue._id,
          isSpeakerBot: false,
          text: payload.text,
        });

        const response = await Scenario(dialogue, payload.text);
        return response.msg ?
          {
            display: {
              text: response.msg,
              quickReplies: response.quick_replies || [],
            }
          } :
          {};
    }

    return [];
  }
};
