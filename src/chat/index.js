import MessageQueueMap from './queues';
import { PlatformUser, Utterance } from '../models';

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

  async request(userId, action, payload = {}) {
    const platformUser = await PlatformUser.findOrCreate(this.platformName, userId);

    switch(action) {
      case ActionEnum.SEND_TEXT:
        const response = await onUtter(platformUser, payload.text);
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

/**
 * Utterance 객체를 생성하고 Queue 모듈에 보내 그 반응을 처리합니다.
 * @param {PlatformUser} platformUser 
 * @param {string} text 
 * @return EventEmitter를 인자로 보내는 Promise
 */
export function onUtter(platformUser, text) {
  const session = MessageQueueMap.get(platformUser);
  return session.getDialogue().then(
    dialogue => Utterance.create({
      dialogue: dialogue._id,
      isSpeakerBot: false,
      text: text,
    })
  ).then(
    utterance => utterance.populate('dialogue').execPopulate()
  ).then(
    utterance => session.push(utterance)
  );
}
