const alias = require('./aliases').vite;
const { build, mergeConfig } = require('vite');
const fs = require('fs/promises');
const path = require('path');
const cssInjectedByJsPlugin = require('vite-plugin-css-injected-by-js').default;
const rollupChromeReload = require('./ChromeReloadPlugin').rollupChromeReload

/** @typedef {import('vite').UserConfig} ViteConfig */

const dir = process.cwd();
const args = process.argv.slice(2);

const watch = !!args.find((arg) => ['-w', '--watch'].includes(arg));

function getConfig(entry, entryPath, configOverride) {
  /** @type {ViteConfig} */
  const baseConfig = {
    root: path.resolve(dir, './src'),
    resolve: {
      alias,
    },
    build: {
      lib: {
        entry: {
          [entry]: entryPath,
        },
        name: `${entry}.js`,
        formats: ['iife'],
        fileName: (_, entry) => `${entry}.js`,
      },
      outDir: '../dist',
      emptyOutDir: false,
      watch: watch ? {} : null,
    },
  };

  return configOverride ? mergeConfig(baseConfig, configOverride) : baseConfig;
}

const contentScriptConfig = {
  plugins: [cssInjectedByJsPlugin()],
};

const copyStaticFiles = async () =>
  fs.cp(path.resolve(dir, './static'), path.resolve(dir, './dist'), {
    recursive: true,
  });

const backgroundConfig = {
  plugins: [rollupChromeReload()]
};


(async () => {
  await fs.rm(path.resolve(dir + '/dist'), { recursive: true }).catch(() => {});

  build(getConfig('content-script', 'content-script.js', contentScriptConfig));
  build(getConfig('background', 'background.js', backgroundConfig));
  build(getConfig('popup', 'popup.js'));
  copyStaticFiles();

})();
