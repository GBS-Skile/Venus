import MessageQueueMap from './queues';

import sessions from '../models/sessions';
import * as dialogflow from '../dialogflow';

import { Dialogue, Utterance } from '../models';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const getWaitingTime = content => 1000;

const getTypingTime = content => 2000;

async function getResponse(senderId, content) {
  return await dialogflow.request(senderId, content);
  //return content;
}

/**
 * Utterance 객체를 생성하고 Queue 모듈에 보내 그 반응을 처리합니다.
 * @param {PlatformUser} platformUser 
 * @param {string} text 
 * @return EventEmitter를 인자로 보내는 Promise
 */
export function onUtter(platformUser, text) {
  return Dialogue.findByPlatformUser(platformUser).then(
    dialogue => Utterance.create({
      dialogue: dialogue._id,
      isSpeakerBot: false,
      text: text,
    })
  ).then(
    utterance => MessageQueueMap.get(platformUser._id.toString()).push(utterance)
  );
}
