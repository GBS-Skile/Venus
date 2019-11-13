/*
 * "시나리오"는 대화(Dialogue)가 전개되는 양상을 구조화한 모델입니다.
 * 모든 Dialogue마다 하나의 시나리오가 대응되어 있습니다.
 * 시나리오는 대화 맥락(State)과 발화(Action)이 주어졌을 때,
 * 새로운 대화 맥락을 계산하여 반환하는 함수로써 다룰 수 있습니다.
 * 
 * 시나리오는 주로 NLP 기술을 활용하는 백엔드 서버 Thoth의 형태로 구현됩니다.
 * 따라서 시나리오의 입출력 인터페이스에 대하여는 위키 [Thoth와의 상호작용]을 참고하세요.
 */

import fetch from 'node-fetch';
import { fakeThoth } from './thoth';

const thothApi = url => (context, message) => {
  const requestBody = {
    sess_id: 0,  // unused variable
    msg: message,
    context,
  };

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  }).then(res => res.json());
};

export const scenarios = {
  //fakeThoth: (context, message) => fakeThoth(0, [{ text: message }], context),
  fakeThoth: thothApi('http://127.0.0.1:1016/'),
  beatrice: thothApi('http://172.31.35.214:5000/'),
  tree_0: thothApi('http://127.0.0.1:5000/'),
  tree_1: thothApi('http://127.0.0.1:5001/'),
  tree_2: thothApi('http://127.0.0.1:5002/'),
  tree_3: thothApi('http://127.0.0.1:5003/'),
  tree_4: thothApi('http://127.0.0.1:5004/'),
};

export default async (dialogue, message) => {
  await dialogue.populate({
    path: 'platformUser',
    populate: { path: 'user' },
  }).execPopulate();
  
  const scenario = scenarios[dialogue.scenario];
  if (!scenario) throw new Error(`Scenario ${scenario} not exists in this server.`);

  const context = {
    Dialog: dialogue.context,
    User: dialogue.platformUser.user.context,
  };

  console.log(dialogue, context);
  const { context: newContext, ...response } = await scenario(context, message);
  console.log(response, newContext);
  const { User, Dialog } = newContext;

  const setContext = (model, context) => {
    model.context = Object.assign(model.context, context || {});
    model.markModified('context');
    model.save();
  };

  setContext(dialogue.platformUser.user, User);
  setContext(dialogue, Dialog);

  const { msg, platform } = response;
  return { msg: msg || '', platform: platform || {} };
};
