import { spawn } from 'child_process';
import { EventEmitter } from 'events';

import { sendToThoth, sendToDialogflow, fakeThoth } from './thoth';
import { Dialogue } from '../models';


const LONG_WAIT = 100;  // as ms
const SHORT_WAIT = 10;  // as ms

const DIALOGUE_GAP_LIMIT = 3 * 60 * 60 * 1000;  // three hours as ms

const getWaitingTime = function(utterances) {
  const utterance = utterances[utterances.length - 1];
  return new Promise((resolve, reject) => {
    spawn('python3', ['scripts/turn_taking.py', utterance.text])
      .stdout.on('data', resolve);
  }).then(data => {
    return data === "True" ? SHORT_WAIT : LONG_WAIT;
  });
};


class MessageQueue {
  constructor(platformUser) {
    this.platformUser = platformUser;
    this.pending = [];
  }

  /**
   * 발화(Utterance)를 생성할 때 어떤 대화(Dialogue)에 속해있는 지 결정할 필요가 있습니다.
   * 그 때 호출되는 함수입니다.
   * @returns {Promise} Dialogue 모델을 반환합니다.
   */
  async getDialogue() {
    if (!this.dialogue) {  // if undefined
      console.log("load Dialogue");
      this.dialogue = await Dialogue.findByPlatformUser(this.platformUser);
    }

    const { dialogue, platformUser } = this;
    
    if (dialogue.active) {
      const hitAt = dialogue.hitAt || Date.now();
      console.log((Date.now() - hitAt) / 1000);
      if (Date.now() - hitAt <= DIALOGUE_GAP_LIMIT) {
        // Dialogue cache hit!
        dialogue.hitAt = Date.now();
        return await dialogue.save();
      } else {
        // Finish the dialogue and mark at platformUser.context
        dialogue.active = false;
        dialogue.finishedAt = Date.now();
        dialogue.reason = "timeout";
        await dialogue.save();

        platformUser.context = Object.assign(
          platformUser.context || {},
          { SILENCE_AWHILE: true, }
        );
        platformUser.markModified('context');
        await platformUser.save();
        // do not return dialogue
      }
    }

    return this.dialogue = await Dialogue.findByPlatformUser(platformUser);
  }
  
  packContext(utterance) {
    return {
      socialId: this.platformUser.socialId,
      state: utterance.dialogue.state,
    };
  }

  push(utterance) {
    const queue = this;
    const { pending, platformUser } = this;
    const sessionId = platformUser.socialId;
    const context = utterance.dialogue.context;
    
    pending.push(utterance);
    return getWaitingTime(pending).then(waitingTime => {
      const evtEmitter = new EventEmitter();
      setTimeout(function () {
        evtEmitter.emit('typing');
        if (pending[pending.length - 1] === utterance) {
          const callThoth = fakeThoth || sendToDialogflow;
          //const callThoth = sendToThoth;

          callThoth(sessionId, pending, context).then(
            response => {
              evtEmitter.emit('response', response);
              
              utterance.dialogue.context = Object.assign(
                context, response.context
              );
              utterance.dialogue.markModified('context');
              utterance.dialogue.save();
            }
          );
          // ).catch(
          //   () => evtEmitter.emit(
          //     'response',
          //     { msg: "죄송해요. 말씀을 이해하지 못 했어요." }
          //   )
          // );
          queue.pending = [];  // clear Queue
        } else {
          evtEmitter.emit('cancel');
        }
      }, waitingTime);

      return evtEmitter;
    });
  }
}

class MessageQueueMap {
  constructor() {
    this._map = new Map();
  }

  get(platformUser) {
    const key = platformUser._id.toString();
    if (this._map.has(key)) {
      return this._map.get(key);
    } else {
      const defaultValue = new MessageQueue(platformUser);
      this._map.set(key, defaultValue);
      return defaultValue;
    }
  }
}

export default new MessageQueueMap();
