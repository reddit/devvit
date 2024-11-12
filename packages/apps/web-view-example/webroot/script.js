class App {
  constructor() {
    this.state = {};

    const stateOutput = document.querySelector('#stateOutput');
    const stateTimestamp = document.querySelector('#stateTimestamp');
    const messageOutput = document.querySelector('#messageOutput');
    const messageTimestamp = document.querySelector('#messageTimestamp');

    window.addEventListener('message', (ev) => {
      const { type, data } = ev.data;

      if (type === 'devvit-message') {
        const { message } = data;
        messageOutput.textContent = JSON.stringify(message, undefined, 2);
        messageTimestamp.textContent = String(Date.now());
      }
      if (type === 'devvit-state') {
        const { state } = data;
        stateOutput.textContent = JSON.stringify(state, undefined, 2);
        stateTimestamp.textContent = String(Date.now());
      }
    });

    const pingButton = document.querySelector('button');
    pingButton.addEventListener('click', () => {
      window.parent?.postMessage({ type: 'ping' }, '*');
    });
  }
}

new App();
