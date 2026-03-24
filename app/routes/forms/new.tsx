import { nanoid } from 'nanoid'
import { useState } from 'react'
import { Form as RouterForm, Link, redirect, useActionData } from 'react-router'
import { insertFormSchema } from '~/.server/db/schema'
import { validate } from '~/lib/data/validate'
import { Form as FormModel } from '~/models/.server/form'

type FieldType = 'text' | 'email' | 'textarea'
interface FieldConfig {
  label: string
  type: FieldType
}

export async function action({ request }: any) {
  let formData = await request.formData()

  let validation = validate(formData, insertFormSchema)
  if (!validation.ok) {
    return { errors: validation.errors }
  }

  let title = validation.data.title
  let fieldsRaw = formData.get('fields')
  let fields: FieldConfig[] = []

  if (typeof fieldsRaw === 'string') {
    try {
      fields = JSON.parse(fieldsRaw)
    } catch {
      fields = []
    }
  }

  let token = nanoid(16)

  let form = await FormModel.create({
    title,
    fields: JSON.stringify(fields),
    token,
  })

  return redirect(`/forms/${form.id}/results/${form.token}`)
}

export default function Page() {
  let actionData = useActionData() as
    | { errors?: Record<string, string[]> }
    | undefined
  let [fields, setFields] = useState<FieldConfig[]>([
    { label: 'Name', type: 'text' },
  ])

  function setField(index: number, next: Partial<FieldConfig>) {
    setFields((current) =>
      current.map((field, idx) =>
        idx === index ? { ...field, ...next } : field,
      ),
    )
  }

  function addField() {
    setFields((current) => [...current, { label: '', type: 'text' }])
  }

  function removeField(index: number) {
    setFields((current) => current.filter((_, idx) => idx !== index))
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Create a Form</h1>
        <p className="text-sm text-base-content/70">
          Build a public form and collect responses.
        </p>
      </header>

      <RouterForm method="post" className="space-y-6">
        <label className="block">
          <span className="label">Form title</span>
          <input name="title" className="input-bordered input w-full" />
          {actionData?.errors?.title && (
            <p className="text-error">{actionData.errors.title.join(', ')}</p>
          )}
        </label>

        <section className="rounded-box border border-base-300 bg-base-100 p-4">
          <h2 className="font-semibold">Fields</h2>
          <p className="text-sm text-base-content/60">
            Each field can be text, email, or textarea.
          </p>

          {fields.map((field, idx) => (
            <div key={idx} className="mt-3 grid grid-cols-12 gap-2">
              <input
                className="input-bordered input col-span-5"
                placeholder="Label"
                value={field.label}
                onChange={(e) => setField(idx, { label: e.target.value })}
              />
              <select
                className="select-bordered select col-span-4"
                value={field.type}
                onChange={(e) =>
                  setField(idx, { type: e.target.value as FieldType })
                }
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="textarea">Textarea</option>
              </select>
              <button
                type="button"
                className="btn col-span-3 btn-outline btn-error"
                onClick={() => removeField(idx)}
              >
                Remove
              </button>
            </div>
          ))}

          <button type="button" className="btn mt-4 btn-sm" onClick={addField}>
            + Add field
          </button>
        </section>

        <input type="hidden" name="fields" value={JSON.stringify(fields)} />

        <div className="flex items-center gap-3">
          <button type="submit" className="btn btn-primary">
            Save Form
          </button>
          <Link to="/" className="btn btn-ghost">
            Home
          </Link>
        </div>
      </RouterForm>
    </main>
  )
}
