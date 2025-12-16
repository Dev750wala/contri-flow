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
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="fixed inset-0 w-screen h-screen z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
        >
          <source src="/HomeVideoBackground.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
      </div>

      {/* Ambient Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Content */}
      <main className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col gap-10 px-6 py-12 pt-28">
      <section className="text-center">
        <p className="text-sm uppercase tracking-wide text-slate-400">
          Welcome to ContriFlow
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">
          Choose how you want to contribute
        </h1>
        <p className="mt-4 text-base text-slate-300">
          Pick the workspace that matches your role today. You can always come
          back to switch.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {roles.map((role) => (
          <article
            key={role.id}
            className="flex h-full flex-col justify-between rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-lg p-6 shadow-xl transition hover:shadow-2xl hover:border-slate-600/50"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-sky-400">
                {role.id}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{role.title}</h2>
              <p className="mt-3 text-sm text-slate-300">
                {role.description}
              </p>
            </div>
            <Link
              href={role.href}
              className="mt-6 inline-flex items-center justify-center rounded-full border border-sky-500 bg-transparent px-4 py-2 text-sm font-medium text-sky-400 transition hover:bg-sky-500 hover:text-white"
            >
              {role.cta}
            </Link>
          </article>
        ))}
      </div>
    </main>
    </div>
  );
}
