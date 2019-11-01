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

const scenarios = {
  fakeThoth: (context, message) =>
    fakeThoth(0, [{ text: message }], context),
  beatrice: (context, message) => {
    const requestBody = {
      sess_id: 0,  // unused variable
      msg: message,
      context,
    };
  
    return fetch(process.env.THOTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    }).then(res => res.json());
  },
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

  const { context: newContext, ...response } = await scenario(context, message);
  const { User, Dialog } = newContext;

  const setContext = (model, context) => {
    model.context = Object.assign(model.context, context || {});
    model.markModified('context');
    model.save();
  };

  setContext(dialogue.platformUser.user, User);
  setContext(dialogue, Dialog);
  return response;
};
