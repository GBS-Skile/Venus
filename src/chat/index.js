import sessions from '../models/sessions'

export const request = ({ platform, senderId, content }, { read, reply }) => {
  const session = sessions.get(platform, senderId, true);
  const msg = session.pushMessage();

  if (read) read();
  msg.response = 'salt@' + content + '@sauce';

  session.interruptBefore(msg).forEach(
    m => msg.response = m.response + '\n' + msg.response
  );

  setTimeout(() => {
    if (!msg.interrupted) {
      msg.interrupted = true;
      reply(msg.response);
    } else console.log('interrupted');

    msg.pop();
  }, 5000);
};
