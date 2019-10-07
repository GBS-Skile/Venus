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