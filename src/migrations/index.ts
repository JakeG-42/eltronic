import * as migration_20260505_115337_payload_init from './20260505_115337_payload_init';

export const migrations = [
  {
    up: migration_20260505_115337_payload_init.up,
    down: migration_20260505_115337_payload_init.down,
    name: '20260505_115337_payload_init'
  },
];
