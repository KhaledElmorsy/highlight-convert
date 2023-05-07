const { WebSocketServer } = require('ws');
const fs = require('fs');

const getBackgroundSocketCode = (port) => `
  (() => {
    function reload() {
      chrome.tabs.reload(() => {});
          chrome.runtime.reload();
      console.clear();
      console.log('Reloading')
        }

    function setUpReloader() {
      const reloader = new WebSocket('ws://localhost:${port}');

      reloader.onopen = () => {
        console.log('Listening for changes');
      }

      reloader.onmessage = (e) => {
        if (e.data === 'reload') {
          reload();
          reloader.send('reloaded');
        }
      };

      reloader.onclose = () => {
        console.clear();
        console.log('Attempting to connect to reload server...');
        setTimeout(setUpReloader, 5000);
      };
    }
    setUpReloader();
  })()`;

function createReloadServer(port) {
  const reloadServer = new WebSocketServer({
    port,
  });

  let reloadMessage = {
    connections: 0,
    timeout: null,
    logReloaders() {
      console.log(
        `\x1b[33m\x1b[1mReloaded \x1b[32m ${this.connections} extension(s) \x1b[0m`
      );
    },
    reset() {
      this.connections = 0;
      this.timeout = null;
    },
    debounceAnnounceReloader() {
      clearTimeout(this.timeout);
      this.connections += 1;
      this.timeout = setTimeout(() => {
        this.logReloaders();
        this.reset();
      }, 1000);
    },
  };

  reloadServer.on('connection', (client) => {
    client.on('message', (data) => {
      if (data.toString() === 'reloaded') {
        reloadMessage.debounceAnnounceReloader();
      }
    });
  });

  function requestReload() {
    reloadServer.clients.forEach((client) => {
      client.send('reload');
    });
  }

  return { requestReload };
}

/**
 *
 * @param {object} args
 * @param {number} port Websocket server port
 * @returns {import('rollup').PluginHooks}
 */
module.exports.rollupChromeReload = function ({ port = 1767 } = {}) {
  let reload = false;
  let reloadServer;
  let watching = false;

  /** @type {import('rollup').PluginHooks} */
  return {
    name: 'Chrome extension reload',

    options() {
      reload = this.meta.watchMode;
      if (!reload) return;
      reloadServer ??= createReloadServer(port);
    },

    outputOptions({dir}) {
      if (!reload || watching) return;
  
      let reloadDebounce;
      fs.watch(dir, { recursive: true }, (e) => {
        clearTimeout(reloadDebounce);
        reloadDebounce = setTimeout(reloadServer.requestReload, 500);
      });
      watching = true;
    },

    generateBundle(_, chunks) {
      if (!reload) return;
      const background = chunks['background.js'];
      background.code += getBackgroundSocketCode(port);
    },
  };
};
