import fetch from 'node-fetch';
import { request } from 'http';

import { detectIntent } from '../dialogflow';

export const sendToDialogflow = (utterances, context) => {
  const content = utterances.map(u => u.text).join(' ');
  return detectIntent(context.socialId, content, context.state).then(
    queryResult => ({
      msg: queryResult.fulfillmentMessages.map(m => m.text)
        .filter(m => m).map(m => m.text.join(' ')).join('\n'),
      context: {
        state: queryResult.action || context.state,
      },
    })
  );
}

export const sendToThoth = (utterances, context) => {
  const requestBody = {
    sess_id: 0,
    msg: utterances.map(u => u.text).join(' '),
    context,
  };

  return fetch(process.env.THOTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  }).then(res => res.json());
}
