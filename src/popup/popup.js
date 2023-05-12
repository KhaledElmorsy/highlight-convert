import styles from './popup.module.scss';
import popupSettings from '@converters/currency/popup/settings';
import { createElement } from '@/render/util';

(function setHeaderBackground() {
  const imageSrc = chrome.runtime.getURL('images/popup/header/0.gif');
  document.getElementById(
    'title-container'
  ).style.backgroundImage = `url(${imageSrc})`;
})();

const app = document.getElementById('app');

/**
 *
 * @param {SettingsPage} settings
 */
async function renderSettings(settings) {
  const page = createElement('div', { class: styles.page });
  const loadingElements = [];

  settings.forEach(({ title, views }) => {
    const sectionEl = page.appendChild(
      createElement('div', { class: styles.section })
    );

    if (title) {
      sectionEl.appendChild(createElement('h1', {}, title));
    }

    views.forEach(async ({ view, label, description }) => {
      // Synchronously append a container to preserve setting order
      const container = sectionEl.appendChild(
        createElement('div', { class: styles.container })
      );

      if (label) {
        const attr = { child: styles.label, title: description ?? '' };
        container.appendChild(createElement('span', attr, label));
        container.classList.add(styles.labeled);
      }

      const elementPromise = view();
      loadingElements.push(elementPromise);
      const viewWrapper = container.appendChild(
        createElement('div', { class: styles.viewWrapper })
      );
      viewWrapper.append(await elementPromise);
      container.append(viewWrapper);
    });
  });

  await Promise.all(loadingElements);
  app.appendChild(page);
}

renderSettings(popupSettings);
