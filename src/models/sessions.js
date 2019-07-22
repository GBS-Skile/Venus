let sessionData = [];  // array

class Session {
  constructor(platform, senderId) {
    this.platform = platform;
    this.senderId = senderId;
    this.messages = {
      queue: [],
      count: 0,
    }
  }

  pushMessage(content) {
    const { messages } = this;
    const idx = (messages.count += 1);
    const msg = {
      idx,
      content,
      interrupted: false,
      pop() {
        const _idx = messages.queue.findIndex(m => m.idx === idx);
        if (_idx > -1) {
          messages.queue.splice(idx, 1);
        }
      },
    };

    messages.queue.push(msg);
    return msg;
  }

  interruptBefore(msg) {
    const filtered = this.messages.queue.filter(e => (e.idx < msg.idx && !e.interrupted))
    filtered.forEach(e => e.interrupted = true);
    return filtered;
  }
}

class Sessions {
  create(platform, senderId) {
    if (this.get(platform, senderId)) {
      throw new Error(`the session ("${platform}", "${senderId}") already exists.`);
    }

    const newSession = new Session(platform, senderId);

    sessionData.push(newSession);
    console.log('Session created:', newSession);
    return newSession;
  }

  get(platform, senderId, insert = false) {
    return sessionData.find(
      obj => (obj.platform === platform && obj.senderId === senderId)
    ) || (insert && this.create(platform, senderId));
  }
}

export default new Sessions();
