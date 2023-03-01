import { PlaywrightScript } from '@ocsjs/app/src/scripts/automation/interface';

export type RawPlaywrightScript = Pick<PlaywrightScript, 'configs' | 'name'>;
