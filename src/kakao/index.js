import { Router } from 'express';

import { PlatformUser } from '../models';
import { onUtter } from '../chat';

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

    PlatformUser.findOrCreate("kakao", senderId).then(
      platformUser => onUtter(platformUser, utterance)
    ).then(
      evtEmitter => {
        evtEmitter.on('response', response => {
          res.status(200).send(simpleText(response));
        })
      }
    );
  });

  return kakao;
}