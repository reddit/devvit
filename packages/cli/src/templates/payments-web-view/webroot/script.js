/** @typedef {import('../src/message.ts').DevvitSystemMessage} DevvitSystemMessage */
/** @typedef {import('../src/message.ts').WebViewMessage} WebViewMessage */

class App {
  constructor() {
    // Get references to the HTML elements
    this.purchaseButton = /** @type {HTMLButtonElement} */ (
      document.querySelector('#btn-purchase')
    );
    this.purchaseText = document.querySelector('#purchase-text');
    // When the Devvit app sends a message with `postMessage()`, this will be triggered
    addEventListener('message', this.#onMessage);

    this.purchaseButton.addEventListener('click', () => {
      // Sends a message to the Devvit app
      postWebViewMessage({ type: 'purchase', data: { sku: 'webviewpurchase' } });
    });
  }

  /**
   * @arg {MessageEvent<DevvitSystemMessage>} ev
   * @return {void}
   */
  #onMessage = (ev) => {
    // Reserved type for messages sent via `context.ui.webView.postMessage`
    if (ev.data.type !== 'devvit-message') return;
    const { message } = ev.data.data;

    if (message.type === 'purchaseMade') {
      const firstMessage = 'Thank you for your purchase 😊.';
      const secondMessage = 'A second purchase! So generous!';
      const thirdMessage = 'So kind to make another purchase.';
      const lastMessage = 'Thank you so much!';
      const currentText = this.purchaseText.innerHTML;
      // Go first -> second -> third -> last -> third -> (loop the last two)
      if (currentText === '') {
        this.purchaseText.innerHTML = firstMessage;
      } else if (currentText === firstMessage) {
        this.purchaseText.innerHTML = secondMessage;
      } else if (currentText === secondMessage) {
        this.purchaseText.innerHTML = thirdMessage;
      } else if (currentText === thirdMessage) {
        this.purchaseText.innerHTML = lastMessage;
      } else if (currentText === lastMessage) {
        this.purchaseText.innerHTML = thirdMessage;
      }
    } else {
      throw Error(`Unexpected message type: ${message.type}`);
    }
  };
}

/**
 * Sends a message to the Devvit app.
 * @arg {WebViewMessage} msg
 * @return {void}
 */
function postWebViewMessage(msg) {
  parent.postMessage(msg, '*');
}

new App();
