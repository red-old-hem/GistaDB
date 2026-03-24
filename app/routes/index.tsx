export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <header className="space-y-3">
        <p className="badge badge-outline">Gista.js DB Starter</p>
        <h1 className="text-4xl font-bold text-balance">
          Your app is running.
        </h1>
        <p className="text-base-content/70">
          This database starter is prewired for SSR with Drizzle and Atlas so
          you can build real features immediately.
        </p>
      </header>

      <section className="rounded-box border border-base-300 bg-base-100 p-6">
        <h2 className="text-lg font-semibold">Next steps</h2>
        <p className="mt-3 text-base-content/80">
          Start by creating a form builder:
        </p>
        <a className="btn mt-4 btn-primary" href="/forms/new">
          Create a new form
        </a>
      </section>
    </main>
  )
}
