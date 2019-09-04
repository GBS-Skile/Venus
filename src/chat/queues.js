import { Queue } from '../lib/util';

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
    console.log("MessageQueue created");
  }

  push(utterance) {
    const { pending } = this;
    
    pending.push(utterance);
    setTimeout(() => {
      if (pending.indexOf(utterance) != -1) { // 발화 여부 파악 (예시)
        // sendThoth(pending, callback)
        pending = [];
      }
    }, getWaitingTime(utterance));
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
