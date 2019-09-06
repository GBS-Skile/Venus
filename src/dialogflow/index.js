import { SessionsClient } from 'dialogflow';

const client = new SessionsClient();

export async function detectIntent(sessionId, query, contextName = null) {
  const sessionPath = client.sessionPath('venus-grbhjf', sessionId);
  const contexts = contextName ?
    [{
      name: `${sessionPath}/contexts/${contextName}`,
      lifespanCount: 1,
    }] : [];

  const response = await client.detectIntent({
    session: sessionPath,
    queryParams: {
      contexts,
      resetContexts: true,
    },
    queryInput: {
      text: {
        text: query,
        languageCode: 'ko',
      },
    },
  });

  return response[0].queryResult;
}
