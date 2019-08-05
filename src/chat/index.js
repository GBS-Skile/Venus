import sessions from '../models/sessions'
import * as dialogflow from '../dialogflow'
import { getOktTagger } from './korean'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const getWaitingTime = content => 5000;

const getTypingTime = content => 2000;

async function getResponse(senderId, content) {
  const tagger = await getOktTagger();
  const sentences = await tagger(content);
  
  for (const sent of sentences) {
    console.log(sent.map(m => m));
  }

  //return await dialogflow.request(senderId, content);
  return content;
}

export async function request({ platform, senderId, content }, { read, typing, reply }) {
  const session = sessions.get(platform, senderId, true);
  const origMessage = session.pushMessage(content);

  if (read) read();
  origMessage.content = [
    ...session.interruptBefore(origMessage).map(m => m.content),
    content,
  ].join(' ');

  await sleep(getWaitingTime(origMessage.content));

  if (!origMessage.interrupted) {  // reply
    origMessage.interrupted = true;
    const response = await getResponse(senderId, origMessage.content);

    if (typing) typing();
    await sleep(getTypingTime(response));

    reply(response);
  }

  origMessage.pop();
};
