import { Router } from 'express';

import { ActionEnum, PlatformAdapter } from '../chat';

const adapter = new PlatformAdapter('kakao');

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

    const evtEmitter = await adapter.request(
      senderId, ActionEnum.SEND_TEXT, { text: utterance }
    );

    evtEmitter.on('response', response => {
      const body = simpleText(response.msg);
      const quickReplies = response.quick_replies;
      console.log(response);
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
    });
  });

  return kakao;
}