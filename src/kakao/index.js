import { Router } from 'express';

import { ActionEnum, PlatformAdapter } from '../chat';

class KakaoPlatformAdapter extends PlatformAdapter {
  constructor() {
    super('kakao');
  }
}

const adapter = new KakaoPlatformAdapter();

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

    const response = await adapter.request(
      senderId, ActionEnum.SEND_TEXT, { text: utterance }
    );

    if (response.display) {
      const { text, quickReplies } = response.display;
      const body = simpleText(text);
      
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