import { Link, useLoaderData, redirect } from 'react-router'
import { DataTable } from '~/app/ui/data-table'
import { Form as FormModel } from '~/models/.server/form'
import { Submission } from '~/models/.server/submission'

export async function loader({ params }: any) {
  if (!params?.id || !params?.token) {
    return new Response('Missing parameters', { status: 400 })
  }

  let form = await FormModel.findByID(params.id)
  if (!form) {
    return new Response('Form not found', { status: 404 })
  }

  if (form.token !== params.token) {
    return { error: 'Token mismatch' }
  }

  let submissions = await Submission.findAllBy({ form_id: Number(form.id) })
  return { form, submissions }
}

export async function action({ request, params }: any) {
  if (!params?.id || !params?.token) {
    return new Response('Missing parameters', { status: 400 })
  }

  let form = await FormModel.findByID(params.id)
  if (!form || form.token !== params.token) {
    return new Response('Unauthorized', { status: 403 })
  }

  let formData = await request.formData()
  let verb = String(formData.get('verb') || '')

  if (verb === 'delete') {
    let id = Number(formData.get('id'))
    if (!id || Number.isNaN(id)) {
      return new Response('Invalid ID', { status: 400 })
    }
    await Submission.delete(id)
  }

  return redirect(`/forms/${params.id}/results/${params.token}`)
}

export default function Page() {
  let data = useLoaderData() as
    | { error: string }
    | {
        form: { id: number; title: string; token: string }
        submissions: Array<{ id: number; data: string; created_at: string }>
      }

  if ('error' in data) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-error">Invalid token</h1>
        <p className="mt-2">Token does not match for this form.</p>
        <Link to="/" className="btn mt-4 btn-link">
          Home
        </Link>
      </main>
    )
  }

  let url = `/forms/${data.form.id}`
  let rows = data.submissions

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold">{data.form.title}</h1>
      <p className="mt-2 text-sm text-base-content/70">
        Public form URL: <Link to={url}>{url}</Link>
      </p>

      <section className="mt-6 rounded-box border border-base-300 bg-base-100 p-4">
        <h2 className="text-xl font-semibold">Submissions</h2>

        <DataTable
          columns={{
            id: 'ID',
            created_at: 'Submitted',
            data: [
              'Response',
              (row) => {
                let parsed: Record<string, unknown> = {}
                try {
                  parsed = JSON.parse(row.data)
                } catch {
                  parsed = {}
                }
                return (
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(parsed, null, 2)}
                  </pre>
                )
              },
            ],
          }}
          rows={rows}
          deletable={true}
          className="mt-3"
        />
      </section>

      <Link to="/" className="btn mt-4 inline-block btn-link">
        Home
      </Link>
    </main>
  )
}
