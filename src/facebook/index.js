import { Router } from 'express';
import fetch from 'node-fetch';

import { PlatformUser } from '../models';
import { PlatformAdapter, ActionEnum } from '../chat';

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
if (!PAGE_ACCESS_TOKEN) {
  console.error('$PAGE_ACCESS_TOKEN not defined.');
}

const adapter = new PlatformAdapter('facebook');

const callAPI = (senderId, options) => fetch(
  `https://graph.facebook.com/v2.6/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
  {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipient: { id: senderId, },
      ...options,
    }),
  }
);

const send = (senderId, response) => callAPI(
  senderId, { "message": response }
);

const senderAction = (senderId, type) => callAPI(
  senderId, { "sender_action": type }
);

const sleep = ms => new Promise((resolve, reject) => setTimeout(resolve, ms));

const MS_PER_CHAR = 50;

const handleMessage = async function (senderId, msg) {
  if (msg.text) {
    await senderAction(senderId, "mark_seen");
    const response = await adapter.request(
      senderId, ActionEnum.SEND_TEXT, { text: msg.text }
    );
    
    if (response.display) {
      const text = response.msg, quickReplies = response.platform.quick_replies;
      const messages = text.map(text => ({ text, }));
      
      if (quickReplies && quickReplies.length) {
        messages[messages.length - 1].quick_replies =
          quickReplies.map(title => ({
            content_type: 'text',
            title,
            payload: title,
          }));
      }
      for(let message of messages) {
        await senderAction(senderId, "typing_on");
        await sleep(message.text.length * MS_PER_CHAR);
        await send(senderId, message);
      }
    } else {
      await senderAction(senderId, "typing_off");
    }
  }
}

export default ({ config, db }) => {
  let facebook = Router();

  facebook.post('/')

  facebook.route('/webhook')
    .post((req, res) => {
      const { body } = req;

      if (body.object === 'page') {
        body.entry.forEach(entry => {
          const evt = entry.messaging[0];
          const sender_psid = evt.sender.id;
          
          if (evt.message) {
            handleMessage(sender_psid, evt.message)
          }
        });
        res.status(200).send('EVENT_RECEIVED');
      } else {
        res.sendStatus(404);
      }
    })
    .get((req, res) => {
      const VERIFY_TOKEN = 'tVLreS3Wq3E4NvrINKfp';
      
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];

      const challenge = req.query['hub.challenge'];

      if (mode && token) {
        if (mode === 'subscribe' && token == VERIFY_TOKEN) {
          res.status(200).send(challenge);
        } else {
          res.sendStatus(403);
        }
      } else {
        res.sendStatus(400);
      }
    });

  return facebook;
}