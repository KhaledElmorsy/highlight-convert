import { domainNames, domainDisplay } from '@/appDomains';
import domainToggles from './domainToggles';
import domainSettings from './domain-settings';
import { Picker } from '@settings/Controller';
import { withChangeListener } from '@settings/compose';
import { createElement } from '@/render/util';
import { mapKeys } from '@util/chrome/storage';
import styles from './popup.module.scss';

const mapKey = mapKeys.new('popup');

/**
 * jQuery at home:
 * @type {Document['querySelector']}
 */
const $ = document.querySelector.bind(document);

(function setHeaderBackground() {
  const gifIndex = Math.floor(Math.random()*10);
  const imageSrc = chrome.runtime.getURL(`assets/images/popup/header/${gifIndex}.gif`);
  $('#title-container').style.backgroundImage = `url(${imageSrc})`;
})();

const displayedDomain = withChangeListener(
  new Picker({
    area: 'sync',
    key: mapKey('currentDomain'),
    options: domainNames,
    defaultValue: domainNames[0],
  })
);

(async function renderDomainSwitch() {
  const domainSwitchContainer = $('#domain-switch-container');
  domainSwitchContainer.classList.add(styles.switchContainer);

  domainNames.forEach(async (domainName) => {
    const domainContainer = createElement('div', {
      class: styles.domainContainer,
    });

    const { symbol, title } = domainDisplay[domainName];
    const button = createElement(
      'button',
      { class: styles.button, 'data-title': title }, // Used by a psuedo element
      symbol
    );

    function highlightButton(pickedDomain) {
      const picked = pickedDomain === domainName;
      button.classList[picked ? 'add' : 'remove'](styles.selected);
    }

    displayedDomain.addListener(highlightButton);

    button.onclick = () => displayedDomain.set(domainName);

    const toggle = await domainToggles[domainName]();
    domainContainer.append(button, toggle);
    domainSwitchContainer.append(domainContainer);
  });
})();

const app = $('#app');
app.classList.add(styles.page);
$('#domain-section').classList.add(styles.section);

/**
 * Generate an array of section elements from a {@link SettingsPage settings page}.
 * @param {SettingsPage} settings
 * @returns {Promise<HTMLElement[]>}
 */
async function getSettingsElements(settings) {
  const elementPromises = [];
  const sections = [];

  settings.forEach(({ title, views }) => {
    const sectionEl = createElement('div', { class: styles.section });
    sections.push(sectionEl);

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
      elementPromises.push(elementPromise);
      const viewWrapper = container.appendChild(
        createElement('div', { class: styles.viewWrapper })
      );
      viewWrapper.append(await elementPromise);
      container.append(viewWrapper);
    });
  });

  await Promise.all(elementPromises);
  return sections;
}

const settingsContainer = $('#domain-settings');
settingsContainer.classList.add(styles.settingsContainer);

displayedDomain.addListener(async (domainName) => {
  const sectionsPromise = getSettingsElements(domainSettings[domainName]);

  const animationPromises = [];
  [...settingsContainer.childNodes].forEach((el) => {
    const animateOut = new Promise((resolve) => (el.onanimationend = resolve));
    animationPromises.push(animateOut);
    el.classList.add(styles.out);
  });

  const sections = await sectionsPromise;
  await Promise.all(animationPromises);

  settingsContainer.innerHTML = '';
  settingsContainer.append(...sections);
});
