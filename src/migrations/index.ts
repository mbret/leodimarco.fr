import * as migration_20260918_151143_initial from './20260918_151143_initial'
import * as migration_20260929_081753_media_storage_prefix from './20260929_081753_media_storage_prefix'

export const migrations = [
  {
    up: migration_20260918_151143_initial.up,
    down: migration_20260918_151143_initial.down,
    name: '20260918_151143_initial',
  },
  {
    up: migration_20260929_081753_media_storage_prefix.up,
    down: migration_20260929_081753_media_storage_prefix.down,
    name: '20260929_081753_media_storage_prefix',
  },
]
