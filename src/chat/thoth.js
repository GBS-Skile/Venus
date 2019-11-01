import fetch from 'node-fetch';
import { request } from 'http';

import { detectIntent } from '../dialogflow';

export const sendToDialogflow = (sessionId, utterances, context) => {
  const content = utterances.map(u => u.text).join(' ');
  return detectIntent(sessionId, content, context.state).then(
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

if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}

export async function fakeThoth(sessionId, utterances, context) {
  const msg = utterances.map(u => u.text).join(' ').trim();
  const response = (msg, state, quickReplies = [], context = {}) => ({
    msg: msg.split('\n'),
    quick_replies: quickReplies,
    context: {
      Dialog: {
        ...context.Dialog,
        state,
      },
      User: context.User,
    }
  });

  if (msg === '초기화') {
    return response('대화 상태를 초기화합니다.', 'Default');
  }

  switch(context.Dialog.state) {
    case 'Default':
    case '최초':
      return response(
        '안녕하세요! 전 터리예요.\n사용자님의 이름은 무엇인가요?',
        'AskName', ['김철수']
      );
    case 'AskName':
      return response(
        `${msg}님 맞으신가요?`,
        'AskNameConfirm', ['응', '아니'], {'User': {'#name': msg} }
      );
    case 'AskNameConfirm':
      switch(msg) {
        case '응':
          return response(
            `그렇군요.\n반가워요, ${context.User['#name']}님!\n요즘은 잘 지내세요?`,
            'End', ['잘 못 지내']
          );
        case '아니':
          return response(
            '그렇군요...\n다시 이름을 말씀해 주시겠어요?',
            'AskName', ['김철수']
          );
        default:
          return response(
            `죄송하지만 말씀을 이해하지 못했어요.\n${context.User['#name']}님 맞으신가요?`,
            'AskNameConfirm', ['응', '아니']
          );
      }
    case 'End':
      return response(
        '현재는 여기까지 구현된 상태랍니다.\n다시 시작하려면 `초기화`라고 말해주세요.', 'End'
      );
    default:
      return response(
        '음... 뭔가 이상하네요.\n처음부터 다시 대화를 시작해보죠.',
        'Default', [msg]
      );
  }
}
