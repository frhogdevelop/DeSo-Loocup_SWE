# DeSO Address Lookup Widget

Lightweight widget for finding Swedish DeSO area codes from an address.

## Requirements

- Docker Desktop 4.x+ (includes Docker Compose; open it once after install so `docker` works in your terminal)
- Internet access (the widget calls ArcGIS geocoding APIs)

## Quick Start

1. Install and launch Docker Desktop.
2. From the repo root, run `docker compose up`.
3. Open `http://localhost:8080/demo.html` to play with the demo.

Stop the container with `Ctrl+C` when you are done.

-------------------------------------------------------------------

### Embed the Widget ###

1. Add React and ReactDOM (skip if your page already has them):
   ```html
   <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
   <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
   ```
2. Include the loader script packaged in this repo:
   ```html
   <script src="widget-loader.js"></script>
   ```
3. Add a container where the widget should render:
   ```html
   <div id="deso-widget-root"></div>
   ```

### Optional configuration

The loader auto-initializes once the script runs. If you need more control:

- Override defaults before the script loads:
  ```html
  <script>
    window.DeSOWidget = {
      config: {
        containerId: 'my-widget',
        autoInit: false,
        reactVersion: '18.2.0',
      }
    };
  </script>
  ```
- Call `window.DeSOWidget.init()` when you are ready to mount:
  ```html
  <script>
    window.addEventListener('DOMContentLoaded', () => {
      window.DeSOWidget.init();
    });
  </script>
  ```

## Key Files

- `demo.html` – interactive playground
- `widget-standalone.html` – drop-in standalone page
- `widget-loader.js` – embeddable loader script
- `example.html` – minimal integration sample

## License

GPL-3.0 – see `LICENSE` for details.
