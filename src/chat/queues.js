import { spawn } from 'child_process';

import { EventEmitter } from 'events';
import { sendToThoth } from './thoth';


const getWaitingTime = function(utterances) {
  const utterance = utterances[utterances.length - 1];
  return new Promise((resolve, reject) => {
    spawn('python3', ['scripts/turn_taking.py', utterance.text])
      .stdout.on('data', resolve);
  }).then(data => {
    return data === "True" ? 1000 : 2000;
  });
};

const packContext = utterance => ({
  state: utterance.dialogue.state,
});

class MessageQueue {
  constructor(platformUser) {
    this.platformUser = platformUser;
    this.pending = [];
  }

  push(utterance) {
    const queue = this;
    const { pending } = this;
    
    pending.push(utterance);
    return getWaitingTime(pending).then(waitingTime => {
      const evtEmitter = new EventEmitter();
      setTimeout(function () {
        evtEmitter.emit('typing');
        if (pending[pending.length - 1] === utterance) {
          sendToThoth(pending, packContext(utterance)).then(
            response => {
              evtEmitter.emit('response', response.msg);
              
              utterance.dialogue.state = response.context.state;
              utterance.dialogue.save();
            }
          ).catch(
            () => evtEmitter.emit(
              'response',
              "죄송해요. 말씀을 이해하지 못 했어요."
            )
          );
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
