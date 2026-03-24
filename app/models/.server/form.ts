import { forms } from '~/.server/db/schema'
import { createModel } from './base'

const base = createModel(forms)

export const Form = {
  ...base,
}
