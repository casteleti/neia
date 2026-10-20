import { copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const widgetDirectory = fileURLToPath(new URL('../../../apps/web/public/widget/', import.meta.url));
await copyFile(`${widgetDirectory}neia-widget.js`, `${widgetDirectory}nepi-widget.js`);
