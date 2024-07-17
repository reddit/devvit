window.sendV2Event = function (event) {
  const EVENT_ENDPOINT = '/api/events/devvit.dev_portal.Events/SendEvent';

  void fetch(EVENT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      structValue: event,
    }),
  });
};

// Lovingly ripped off from client/src/lib/globalEventHandler.ts
class GlobalEventHandler {
  #isVisible = true;

  init() {
    new PerformanceObserver((entries, observer) => {
      if (entries.getEntriesByName('first-contentful-paint').length > 0) {
        // First contentful paint happened - fire off screenview event & disconnect
        this.#firstContentfulPaint();
        observer.disconnect();
      }
    }).observe({ type: 'paint', buffered: true });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.#becomeVisible();
      } else {
        this.#becomeInvisible();
      }
    });

    window.navigation?.addEventListener('navigatesuccess', () => {
      this.#fireGlobalScreenViewEvent();
    });
  }

  #firstContentfulPaint() {
    this.#fireGlobalScreenViewEvent();
  }

  #becomeInvisible() {
    this.#isVisible = false;
  }

  #becomeVisible() {
    if (!this.#isVisible) {
      this.#fireGlobalScreenViewEvent();
    }
    this.#isVisible = true;
  }

  #fireGlobalScreenViewEvent() {
    const event = {
      source: 'global',
      action: 'view',
      noun: 'screen',
      action_info: {
        page_type: 'dev_portal_docs',
      },
      request: {
        base_url: window.location.href,
      },
      referrer: {},
    };

    if (document.referrer) {
      const referrerUrl = new URL(document.referrer);
      event.referrer = {
        url: document.referrer,
        domain: referrerUrl.host,
      };
    }

    window.sendV2Event(event);
  }
}

new GlobalEventHandler().init();
