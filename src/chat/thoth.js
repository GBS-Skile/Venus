export const sendToThoth = utterances => {
  return new Promise((resolve, reject) => {
    resolve(utterances.map(u => u.text).join(' '));
  });
}
