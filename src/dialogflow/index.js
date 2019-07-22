import { SessionsClient } from 'dialogflow';

const client = new SessionsClient();

export async function request(sessionId, query) {
  const sessionPath = client.sessionPath('venus-grbhjf', sessionId);
  const response = await client.detectIntent({
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: 'ko',
      },
    },
  });

  const answers = response[0].queryResult.fulfillmentMessages;
  return answers[0].text.text[0];
}
