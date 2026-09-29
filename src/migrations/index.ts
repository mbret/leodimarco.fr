import * as migration_20260918_151143_initial from './20260918_151143_initial'
import * as migration_20260929_081753_media_storage_prefix from './20260929_081753_media_storage_prefix'
import * as migration_20260929_091300_realisations_and_tattoo_blocks from './20260929_091300_realisations_and_tattoo_blocks'

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
  {
    up: migration_20260929_091300_realisations_and_tattoo_blocks.up,
    down: migration_20260929_091300_realisations_and_tattoo_blocks.down,
    name: '20260929_091300_realisations_and_tattoo_blocks',
  },
]
