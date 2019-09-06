import fetch from 'node-fetch';
import { request } from 'http';

import { detectIntent } from '../dialogflow';

export const sendToDialogflow = (utterances, context) => {
  const content = utterances.map(u => u.text).join(' ');
  return detectIntent(context.socialId, content, context.state).then(
    ({ fulfillmentMessages, action }) => ({
      msg: fulfillmentMessages.filter(m => m.text)
        .map(m => m.text.text.join(' ')).join('\n'),
      quick_replies: fulfillmentMessages.filter(m => m.payload)
        .reduce((arr, m) => arr.concat(
          m.payload.fields.quickReplies.listValue.values.map(v => v.stringValue)
        ), []),
      context: { state: action || context.state },
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
