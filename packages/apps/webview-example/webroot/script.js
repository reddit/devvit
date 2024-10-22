class App {
  constructor() {
    this.state = {};

    const output = document.querySelector('#stateOutput');
    window.addEventListener('message', (ev) => {
      const { type, data } = ev.data;

      if (type === 'stateUpdate') {
        output.replaceChildren(JSON.stringify(data, undefined, 2));
      }
    });

    const pingButton = document.querySelector('button');
    pingButton.addEventListener('click', () => {
      window.parent?.postMessage({ type: 'ping' }, '*');
    });
  }
}

new App();
