import sessions from '../models/sessions'
import * as dialogflow from '../dialogflow'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const getWaitingTime = content => 1000;

const getTypingTime = content => 2000;

async function getResponse(senderId, content) {
  return await dialogflow.request(senderId, content);
  //return content;
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
