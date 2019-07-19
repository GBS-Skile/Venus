import { Router } from 'express'

export default ({ config, db }) => {
  let facebook = Router();

  facebook.post('/')

  facebook.route('/webhook')
    .post((req, res) => {
      const { body } = req;

      if (body.object === 'page') {
        body.entry.forEach(entry => console.log(entry.messaging[0]));
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