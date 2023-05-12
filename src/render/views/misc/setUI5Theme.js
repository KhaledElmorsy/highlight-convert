import '@ui5/webcomponents/dist/css/themes/sap_horizon/parameters-bundle.css';
import { setTheme } from '@ui5/webcomponents-base/dist/config/Theme.js';

import { registerThemePropertiesLoader } from '@ui5/webcomponents-base/dist/asset-registries/Themes.js';

// Set the ui5 theme to Horizon
export default function apply() {
	const loadAndCheck = async () => {
		const data = (await import('@ui5/webcomponents-theming/dist/generated/assets/themes/sap_horizon/parameters-bundle.css.json')).default
		if (typeof data === "string" && data.endsWith(".json")) {
			throw new Error(`[themes] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build or use 'import ".../Assets-static.js"'. Check the "Assets" documentation for more information.`);
		}
		return data;
	};

	registerThemePropertiesLoader("@ui5/webcomponents-theming", "sap_horizon", loadAndCheck);
	registerThemePropertiesLoader("@ui5/webcomponents", "sap_horizon", loadAndCheck);
	setTheme('sap_horizon');
}
