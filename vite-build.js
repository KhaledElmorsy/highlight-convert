const alias = require('./aliases').vite;
const { build, mergeConfig } = require('vite');
const fs = require('fs/promises');
const path = require('path');
const cssInjectedByJsPlugin = require('vite-plugin-css-injected-by-js').default;
const rollupChromeReload = require('./ChromeReloadPlugin').rollupChromeReload;

/** @typedef {import('vite').UserConfig} ViteConfig */

const dir = process.cwd();
const args = process.argv.slice(2);

const { watch, production } = Object.entries({
  watch: ['-w', '--watch'],
  production: ['-p', '--production'],
}).reduce((o, [f, t]) => ({ ...o, [f]: args.some((a) => t.includes(a)) }), {});

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
      sourcemap: !production,
    },
  };

  return configOverride ? mergeConfig(baseConfig, configOverride) : baseConfig;
}

const copyStaticFiles = async () =>
  fs.cp(path.resolve(dir, './static'), path.resolve(dir, './dist'), {
    recursive: true,
  });

/** @type {Object<string, ViteConfig>} */
const configs = {
  contentScript: {
    plugins: [cssInjectedByJsPlugin()],
  },
  background: {
    plugins: [...(production ? [] : [rollupChromeReload()])],
  },
  popup: {
    build: {
      rollupOptions: {
        output: {
          assetFileNames: 'popup.[ext]',
        },
      },
    },
  },
};

(async () => {
  await fs.rm(path.resolve(dir + '/dist'), { recursive: true }).catch(() => {});

  build(
    getConfig('content-script', 'content-script.js', configs.contentScript)
  );
  build(getConfig('background', 'background.js', configs.background));
  build(getConfig('popup', 'popup.html', configs.popup));
  copyStaticFiles();
})();
