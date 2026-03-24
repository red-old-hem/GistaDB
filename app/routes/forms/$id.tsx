import {
  useActionData,
  useLoaderData,
  Form as RouterForm,
  redirect,
} from 'react-router'
import { notFoundError } from '~/lib/.server/errors'
import { Form as FormModel } from '~/models/.server/form'
import { Submission } from '~/models/.server/submission'

export async function loader({ params }: any) {
  if (!params?.id) throw new Error('Missing form id')
  let form = await FormModel.findByID(params.id)
  if (!form) {
    throw notFoundError('Form not found')
  }
  return form
}

export async function action({ request, params }: any) {
  if (!params?.id) throw new Error('Missing form id')
  let form = await FormModel.findByID(params.id)
  if (!form) {
    throw notFoundError('Form not found')
  }

  let formData = await request.formData()
  let payload: Record<string, string> = {}
  for (let [key, value] of formData.entries()) {
    if (key === 'submit') continue
    payload[key] = typeof value === 'string' ? value : ''
  }

  await Submission.create({
    form_id: Number(form.id),
    data: JSON.stringify(payload),
  })

  return redirect(`/forms/${form.id}/results/${form.token}`)
}

export default function Page() {
  let form = useLoaderData() as Awaited<ReturnType<typeof loader>>
  let actionData = useActionData() as { message?: string } | null

  let fields: Array<{ label: string; type: string }> = []
  try {
    fields = JSON.parse(String(form.fields))
  } catch {
    fields = []
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold">{form.title}</h1>
      <p className="mt-1 text-base-content/70">Public form / Fill and submit</p>

      {actionData?.message && (
        <p className="mt-3 text-success">{actionData.message}</p>
      )}

      <RouterForm method="post" className="mt-6 space-y-4">
        {fields.length === 0 && (
          <p className="rounded-box border border-warning bg-warning/10 p-4">
            No fields set for this form.
          </p>
        )}

        {fields.map((field, idx) => {
          let key = `field_${idx}`
          if (field.type === 'textarea') {
            return (
              <label key={key} className="block">
                <span className="label">{field.label}</span>
                <textarea
                  name={key}
                  className="textarea-bordered textarea w-full"
                />
              </label>
            )
          }
          return (
            <label key={key} className="block">
              <span className="label">{field.label}</span>
              <input
                name={key}
                type={field.type}
                className="input-bordered input w-full"
              />
            </label>
          )
        })}

        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </RouterForm>

      <p className="mt-6 text-sm text-base-content/70">
        Public URL: <span className="font-mono">{`/forms/${form.id}`}</span>
      </p>
    </main>
  )
}
