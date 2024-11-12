// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck

class App {
  constructor() {
    const output = document.querySelector('#messageOutput');
    window.addEventListener('message', (ev) => {
      const { type, data } = ev.data;

      if (type === 'devvit-message') {
        const { message } = data;
        output.replaceChildren(JSON.stringify(message, undefined, 2));
      }
    });

    const pingButton = document.querySelector('button');
    pingButton.addEventListener('click', () => {
      window.parent?.postMessage({ type: 'ping' }, '*');
    });
  }
}

new App();
