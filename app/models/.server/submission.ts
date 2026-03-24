import { submissions } from '~/.server/db/schema'
import { createModel } from './base'

const base = createModel(submissions)

export const Submission = {
  ...base,
}
