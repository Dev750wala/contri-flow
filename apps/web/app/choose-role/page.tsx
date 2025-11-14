import Link from "next/link";

const roles = [
  {
    id: "owner",
    title: "Project Owner",
    description:
      "Create organizations, seed the reward pool, and issue contribution vouchers.",
    cta: "Go to owner dashboard",
    href: "/(owner)",
  },
  {
    id: "contributor",
    title: "Contributor",
    description:
      "Browse funded repositories, pick up issues, and redeem the vouchers you earn.",
    cta: "Go to contributor portal",
    href: "/contributor",
  },
];

export default function ChooseRolePage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col gap-10 px-6 py-12">
      <section className="text-center">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">
          Welcome to ContriFlow
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Choose how you want to contribute
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          Pick the workspace that matches your role today. You can always come
          back to switch.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {roles.map((role) => (
          <article
            key={role.id}
            className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card/40 p-6 shadow-sm transition hover:shadow-lg"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-primary/80">
                {role.id}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">{role.title}</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {role.description}
              </p>
            </div>
            <Link
              href={role.href}
              className="mt-6 inline-flex items-center justify-center rounded-full border border-primary px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary hover:text-primary-foreground"
            >
              {role.cta}
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
