const { WebSocketServer } = require('ws');

const pluginName = 'ChromeReloadPlugin';

const backgroundSocket = (port) => `
  (() => {
    function reload() {
      chrome.tabs.reload(() => {});
          chrome.runtime.reload();
      console.clear();
      console.log('Reloading')
        }

    function setUpReloader() {
      const reloader = new WebSocket('ws://localhost:${port}');

      reloader.onmessage = (e) => {
        if (e.data === 'reload') {
          reload();
          reloader.send('reloaded');
        }
      };

      reloader.onclose = () => {
        // clearTimeout(reconnectReloadID);
        console.clear();
        console.log('Attempting to connect to reload server...');
        setTimeout(setUpReloader, 5000);
      };
    }

    setUpReloader();
  })()`;

class ChromeReloadPlugin {
  constructor({ port = 1767 } = {}) {
    this.port = port;
  }

  apply(compiler) {
    let reloadServer;

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        { name: pluginName, stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONS },
        (assets) => {
          assets['background.js']._source._children.push(
            backgroundSocket(this.port)
          );
        }
      );
    });

    compiler.hooks.environment.tap(pluginName, () => {
      reloadServer = new WebSocketServer({
        port: this.port,
      });

      let reloading = { logTimeout: null, connections: 0 };
      reloadServer.on('connection', (client) => {
        client.on('message', (data) => {
          if (data.toString() === 'reloaded') {
            reloading.connections += 1;
            clearTimeout(reloading.logTimeout);
            reloading.logTimeout = setTimeout(() => {
              console.log(
                `\x1b[33m\x1b[1mReloaded \x1b[32m ${reloading.connections} extension(s) \x1b[0m`
              );
              reloading = { logTimeout: null, connections: 0 };
            }, 1000);
          }
        });
      });
    });

    compiler.hooks.done.tap(pluginName, () => {
      if (reloadServer) {
        const { clients } = reloadServer;
        clients.forEach((client) => {
          client.send('reload');
        });
      }
    });
  }
}

module.exports = ChromeReloadPlugin;
