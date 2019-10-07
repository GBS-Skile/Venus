import { Router } from 'express';

import { ActionEnum, PlatformAdapter } from '../chat';

const adapterMap = new Map();

const getAdapter = name => {
  let adapter = adapterMap.get(name);
  if (adapter) return adapter;

  adapter = new PlatformAdapter(name);
  adapterMap.set(name, adapter);
  return adapter;
}

const simpleText = text => ({
  version: "2.0",
  template: {
    outputs: [
      { simpleText: { text, }, },
    ],
  },
});

const sleep = interval => new Promise((resolve, reject) => setTimeout(resolve, interval));

export default () => {
  let kakao = Router();

  kakao.post('/webhook', async (req, res) => {
    let utterance = req.body.userRequest.utterance;
    let senderId = req.body.userRequest.user.id;

    const response = await getAdapter(req.body.bot.name).request(
      senderId, ActionEnum.SEND_TEXT, { text: utterance }
    );

    if (response.display) {
      const { text, quickReplies } = response.display;
      const body = simpleText(text.join('\n'));

      const MAX_TYPING_TIME = 4000;
      const TIME_PER_CHAR = 150;
      const sleepTime = Math.min(TIME_PER_CHAR * text.join('\n').length, MAX_TYPING_TIME);
      await sleep(sleepTime);

      if (quickReplies && quickReplies.length) {
        body.template.quickReplies = quickReplies.map(
          label => ({
            label,
            action: 'message',
            messageText: label,
          })
        )
      }

      res.status(200).send(body);
    }
  });

  return kakao;
}