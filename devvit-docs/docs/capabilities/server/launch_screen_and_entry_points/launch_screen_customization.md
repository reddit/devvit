# Launch Screen Customization

## Creating Your Launch (Preview) Screen

Create an HTML file that serves as your app's launch screen in inline mode. This is what users see immediately when they encounter your post. Templates include a performant and compliant preview screen.

```html title="preview.html"
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Game</title>
    <script src="preview.js"></script>
  </head>
  <body>
    <div class="preview-container">
      <h1>Adventure Game</h1>
      <p>Tap to play in fullscreen</p>
      <button id="play-button">Play Now</button>
    </div>
  </body>
</html>
```

```tsx title="preview.js"
import { requestExpandedMode } from '@devvit/web/client';

document.addEventListener('DOMContentLoaded', () => {
  const playButton = document.getElementById('play-button');

  playButton.addEventListener('click', async (event) => {
    try {
      await requestExpandedMode(event, 'game');
    } catch (error) {
      console.error('Failed to enter expanded mode:', error);
    }
  });
});
```

## API Reference

### requestExpandedMode()

Requests expanded mode for the web view. This displays the web view in a larger modal presentation on web and full screen on mobile.

```tsx
import { requestExpandedMode } from '@devvit/web/client';

// Must be called from a trusted event (click, touch, etc.)
await requestExpandedMode(event, 'game');
```

**Parameters**

- `event` (PointerEvent): The gesture that triggered the request, must be a trusted event
- `entry` (string): The destination URI name (e.g., `splash` or `game`). Entry names are the `devvit.json post.entrypoints` keys

### getWebViewMode()

Get the current web view mode state.

```tsx
import { getWebViewMode } from '@devvit/web/client';

const currentMode = getWebViewMode(); // Returns 'inline' | 'expanded'

if (currentMode === 'expanded') {
  // Show expanded UI
} else {
  // Show inline UI
}
```

### Mode Change Events

Listen for mode changes to update your UI.

```tsx
import { addWebViewModeListener, removeWebViewModeListener } from '@devvit/web/client';

function useWebViewMode() {
  const [mode, setMode] = useState(getWebViewMode());

  useEffect(() => {
    const handleModeChange = (newMode: 'inline' | 'expanded') => {
      setMode(newMode);
    };

    addWebViewModeListener(handleModeChange);
    return () => removeWebViewModeListener(handleModeChange);
  }, []);

  return mode;
}
```

## Complete Example

```tsx title="game.tsx"
import React, { useState, useEffect } from 'react';
import {
  getWebViewMode,
  requestExpandedMode,
  exitExpandedMode,
  addWebViewModeListener,
  removeWebViewModeListener,
} from '@devvit/web/client';

export function GameApp() {
  const [mode, setMode] = useState(getWebViewMode());
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const handleModeChange = (newMode: 'inline' | 'expanded') => {
      setMode(newMode);

      // Pause game when exiting expanded mode
      if (newMode === 'inline' && gameStarted) {
        pauseGame();
      }
    };

    addWebViewModeListener(handleModeChange);
    return () => removeWebViewModeListener(handleModeChange);
  }, [gameStarted]);

  const handlePlayClick = async (event: React.MouseEvent) => {
    try {
      await requestExpandedMode(event.nativeEvent, 'game');
      setGameStarted(true);
    } catch (error) {
      console.error('Could not enter expanded mode:', error);
      // Fallback: start game inline
      setGameStarted(true);
    }
  };

  const handleExitClick = async (event: React.MouseEvent) => {
    try {
      await exitExpandedMode(event.nativeEvent);
    } catch (error) {
      console.error('Could not exit expanded mode:', error);
    }
  };

  if (mode === 'inline') {
    return (
      <div className="inline-view">
        <h2>Adventure Game</h2>
        <p>Tap to play in fullscreen</p>
        <button onClick={handlePlayClick} className="play-button">
          Play Now
        </button>
      </div>
    );
  }

  return (
    <div className="expanded-view">
      <button onClick={handleExitClick} className="exit-button">
        Exit
      </button>
      <GameCanvas />
    </div>
  );
}
```
