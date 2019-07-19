import { Router } from 'express'
import request from 'request'

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
if (!PAGE_ACCESS_TOKEN) {
  console.error('$PAGE_ACCESS_TOKEN not defined.');
}

const send = (sender_psid, response) => {
  const req = {
    "recipient": {
      "id": sender_psid,
    },
    "message": response,
  }

  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": req,
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!');
    } else {
      console.error('Unable to send message: ' + err);
    }
  })
}

const handleMessage = (sender_psid, msg) => {
  let response;
  if (msg.text) {
    response = {
      "text": `${msg.text}`
    }
  }

  send(sender_psid, response)
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
          
          console.log('Sender PSID: ' + sender_psid);
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