import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { defaultHex, defaultNow, foreign, id } from './helpers'

export const forms = sqliteTable('forms', {
  id: id(),
  title: text().notNull(),
  fields: text({ mode: 'json' }).notNull(),
  token: defaultHex(),
  created_at: defaultNow(),
})

export const submissions = sqliteTable('submissions', {
  id: id(),
  form_id: foreign(() => forms).notNull(),
  data: text({ mode: 'json' }).notNull(),
  created_at: defaultNow(),
})
