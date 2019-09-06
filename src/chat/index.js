import MessageQueueMap from './queues';
import { Dialogue, Utterance } from '../models';

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
