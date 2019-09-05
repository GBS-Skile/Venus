import { EventEmitter } from 'events';

import { Queue } from '../lib/util';
import { sendToThoth } from './thoth';

/**
 * 참고 1 : JavaScript에서 Python 호출하기
 * https://stackoverflow.com/questions/23450534/how-to-call-a-python-function-from-node-js
 */

/**
 * 참고 2 : 카카오 i Open Builder에 Response 보내는 방법 고민해보기
 */

const getWaitingTime = utterance => 3000;  // 미구현 (참고 1)

// 원래 있는 Session 사용해서 문제 재구성하기

class MessageQueue {
  constructor() {
    this.pending = [];
  }

  push(utterance) {
    const queue = this;
    const { pending } = this;
    
    pending.push(utterance);
    return new Promise((resolve, reject) => {
      const evtEmitter = new EventEmitter();
      resolve(evtEmitter);

      setTimeout(function () {
        evtEmitter.emit('typing');
        if (pending[pending.length - 1] === utterance) {
          sendToThoth(pending).then(response => evtEmitter.emit('response', response));
          queue.pending = [];  // clear Queue
        } else {
          evtEmitter.emit('cancel');
        }
      }, getWaitingTime(utterance)); // 발화 여부 파악 (예시)
    });
  }
}

class MessageQueueMap {
  constructor() {
    this._map = new Map();
  }

  get(key) {
    if (this._map.has(key)) {
      return this._map.get(key);
    } else {
      const defaultValue = new MessageQueue();
      this._map.set(key, defaultValue);
      return defaultValue;
    }
  }
}

export default new MessageQueueMap();
