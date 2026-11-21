// French puts a space before ? ! : ; and inside « »: a no-break space keeps the mark on the line of
// its word
export const keepPunctuation = (text: string) =>
  text.replace(/ ([?!:;»])/g, '\u00a0$1').replace(/« /g, '«\u00a0')
