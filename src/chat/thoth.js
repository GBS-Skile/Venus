import fetch from 'node-fetch';
import { request } from 'http';

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
