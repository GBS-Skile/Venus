import { Router } from 'express';
import fetch from 'request';

import { request } from '../chat';

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
if (!PAGE_ACCESS_TOKEN) {
  console.error('$PAGE_ACCESS_TOKEN not defined.');
}

const callAPI = (senderId, options, callback) => {
  fetch({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": {
      "recipient": {
        "id": senderId,
      },
      ...options,
    },
  }, callback);
}

const send = (senderId, response) => {
  callAPI(senderId, { "message": response }, (err, res, body) => {
    if (!err) {
      console.log('message sent!');
    } else {
      console.error('Unable to send message: ' + err);
    }
  });
}

const senderAction = (senderId, type) => {
  callAPI(senderId, { "sender_action": type }, (err, res, body) => {
    if (!err) {
      console.log('Action sent'); 
    } else {
      console.error('Unable to send action: ' + err);
    }
  });
}

const handleMessage = (senderId, msg) => {
  if (msg.text) {
    request({
      platform: "facebook",
      senderId,
      content: msg.text,
    }, {
      read: () => senderAction(senderId, "mark_seen"),
      typing: () => senderAction(senderId, "typing_on"),
      reply: (response) => send(senderId, { text: response }),
    });
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