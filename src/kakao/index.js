import { Router } from 'express';

import { request } from '../chat';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export default () => {
  let kakao = Router();

  kakao.post('/webhook', async (req, res) => {
    let utterance = req.body.userRequest.utterance;
    let senderId = req.body.userRequest.user.id;

    console.log("Utterance: " + utterance);

    const response = await request({
      platform: "kakao",
      senderId,
      content: utterance,
    });

    console.log(response);
    
    if (!response) return;

    const responseBody = {
      version: "2.0",
      template: {
        outputs: [
          {
            simpleText: {
              text: response,
            },
          },
        ],
      },
    };
    
    res.status(200).send(responseBody);
  });

  return kakao;
}