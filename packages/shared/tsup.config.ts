import { type Options, defineConfig } from 'tsup';
import config from 'tsup-config/index.json';

// eslint-disable-next-line import/no-default-export -- This is what tsup expects
export default defineConfig(config as Options);
