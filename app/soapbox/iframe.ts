/** ID of this iframe (given by embed.js) when embedded on a page. */
let iframeId: any;

/** Receive iframe messages. */
// https://github.com/mastodon/mastodon/pull/4853
const handleMessage = (e: MessageEvent) => {
  if (e.data?.type === 'setHeight') {
    iframeId = e.data?.id;
  }
};

window.addEventListener('message', handleMessage);

export { iframeId };
