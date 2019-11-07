import { Router } from 'express';

import { ActionEnum } from '../chat';
import { Turi, Beatrice } from './adapters';

const getAdapter = {
  "걱정털이": new Turi(),
  "beatrice": new Beatrice(),
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

    const { msg, platform } = await getAdapter[req.body.bot.name].request(
      senderId, ActionEnum.SEND_TEXT, { text: utterance }
    );

    if (msg) {
      const text = msg, quickReplies = platform.quick_replies;
      const body = simpleText(text.join('\n'));

      const MAX_TYPING_TIME = 4000;
      const TIME_PER_CHAR = 0;
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