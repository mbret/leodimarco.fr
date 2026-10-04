import * as migration_20260918_151143_initial from './20260918_151143_initial'
import * as migration_20260929_081753_media_storage_prefix from './20260929_081753_media_storage_prefix'
import * as migration_20260929_091300_realisations_and_tattoo_blocks from './20260929_091300_realisations_and_tattoo_blocks'
import * as migration_20260929_102924_realisations_before_photo from './20260929_102924_realisations_before_photo'
import * as migration_20260929_104524_studio_details from './20260929_104524_studio_details'
import * as migration_20260929_180232_faq_categories from './20260929_180232_faq_categories'
import * as migration_20260929_180300_faq_content from './20260929_180300_faq_content'
import * as migration_20260929_190000_pompey_wording from './20260929_190000_pompey_wording'
import * as migration_20261004_134124_faq_category_buttons from './20261004_134124_faq_category_buttons'
import * as migration_20261004_140155_faq_highlights from './20261004_140155_faq_highlights'
import * as migration_20261004_141000_faq_final_content from './20261004_141000_faq_final_content'

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
  {
    up: migration_20260929_102924_realisations_before_photo.up,
    down: migration_20260929_102924_realisations_before_photo.down,
    name: '20260929_102924_realisations_before_photo',
  },
  {
    up: migration_20260929_104524_studio_details.up,
    down: migration_20260929_104524_studio_details.down,
    name: '20260929_104524_studio_details',
  },
  {
    up: migration_20260929_180232_faq_categories.up,
    down: migration_20260929_180232_faq_categories.down,
    name: '20260929_180232_faq_categories',
  },
  {
    up: migration_20260929_180300_faq_content.up,
    down: migration_20260929_180300_faq_content.down,
    name: '20260929_180300_faq_content',
  },
  {
    up: migration_20260929_190000_pompey_wording.up,
    down: migration_20260929_190000_pompey_wording.down,
    name: '20260929_190000_pompey_wording',
  },
  {
    up: migration_20261004_134124_faq_category_buttons.up,
    down: migration_20261004_134124_faq_category_buttons.down,
    name: '20261004_134124_faq_category_buttons',
  },
  {
    up: migration_20261004_140155_faq_highlights.up,
    down: migration_20261004_140155_faq_highlights.down,
    name: '20261004_140155_faq_highlights',
  },
  {
    up: migration_20261004_141000_faq_final_content.up,
    down: migration_20261004_141000_faq_final_content.down,
    name: '20261004_141000_faq_final_content',
  },
]
