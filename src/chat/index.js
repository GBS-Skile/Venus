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
 * Utterance 객체를 생성하고 타이밍 파악 모듈로 넘겨줍니다.
 * @param {PlatformUser} platformUser 
 * @param {string} text 
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

export async function request({ platform, senderId, content }, { read, typing, reply } = {}) {
  const session = sessions.get(platform, senderId, true);
  const origMessage = session.pushMessage(content);

  if (read) read();
  origMessage.content = [
    ...session.interruptBefore(origMessage).map(m => m.content),
    content,
  ].join(' ');

  await sleep(getWaitingTime(origMessage.content));
  let response = null;

  if (!origMessage.interrupted) {  // reply
    origMessage.interrupted = true;
    response = await getResponse(senderId, origMessage.content);

    if (typing) {
      typing();
      await sleep(getTypingTime(response));
    }

    if (reply) reply(response);
  }

  origMessage.pop();
  return response;
};
