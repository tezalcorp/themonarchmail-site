import React from "react";
import { ArrowUpRight } from "lucide-react";

// Add new projects here. Each entry becomes a card on the page.
// `href` is optional. Use `comingSoon: true` for projects that don't have a site yet.
const PROJECTS = [
  {
    name: "Tezal Consulting",
    tagline: "Shipping, mailouts, business cards, print & marketing, notary, and tech help",
    description:
      "After the storefront closes, Tezal Consulting carries on our shipping, printing, notary, and mailout services. It also does websites, automation, integrations, and in-home tech setup.",
    href: "https://tezalconsulting.com",
    cta: "Visit tezalconsulting.com",
  },
  {
    name: "Mobile Notary & Shipping",
    tagline: "Ad hoc, white-glove service that comes to you",
    description:
      "Notary and business shipping that comes to you: we pick up, label, and ship, or meet you for notarizations. Full site launching December 2026.",
    comingSoon: true,
  },
  {
    name: "Comal Exterior",
    tagline: "Pressure washing and exterior cleaning",
    description:
      "A new business started by our son, offering pressure washing and exterior cleaning around San Antonio and New Braunfels.",
    href: "https://comalexterior.com",
    cta: "Visit comalexterior.com",
  },
  {
    name: "Worthwhile Merch",
    tagline: "Custom tees, hoodies, and swag",
    description:
      "Custom apparel and promotional items for teams, schools, businesses, and events.",
    href: "https://worthwhilemerch.com",
    cta: "Visit worthwhilemerch.com",
  },
  {
    name: "Worthwhile Sessions",
    tagline: "We create the space where worthwhile conversations can happen.",
    description:
      "Some of the most meaningful conversations happen in the wrong setting: a crowded reception, a noisy event, a living room with the TV on. Worthwhile Sessions creates an intentional, professionally recorded space where those conversations can unfold with presence and care. Whether it's a father and daughter at a wedding, a family sharing stories across generations, a team conversation at an event, or a private one-on-one session, we prepare the room so the conversation can be heard, remembered, and kept.",
    href: "https://worthwhilesessions.com",
    cta: "Visit worthwhilesessions.com",
  },
];

export default function WhatsNext() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
      <header className="mx-auto mb-14 max-w-3xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-orange-600">What's next</p>
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">What is next for Thomas and family?</h1>
        <p className="mt-5 text-lg text-gray-700">
          Closing the storefront does not close the work. Here is where our neighbors can find us after November 25, 2026.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {PROJECTS.map((project) => (
          <article key={project.name} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
              {project.comingSoon && (
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">Coming soon</span>
              )}
            </div>
            <p className="mb-3 text-sm font-medium text-blue-900">{project.tagline}</p>
            <p className="flex-1 leading-relaxed text-gray-700">{project.description}</p>
            {project.href && (
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-blue-900 hover:underline"
              >
                {project.cta}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
          </article>
        ))}
      </div>

      <p className="mt-14 text-center text-gray-600">
        Thank you for being part of our story. Questions about the closing? See the{" "}
        <a href="/FAQ" className="font-medium text-blue-900 underline">
          closing FAQ
        </a>{" "}
        or email{" "}
        <a href="mailto:contact@themonarchmail.com" className="font-medium text-blue-900 underline">
          contact@themonarchmail.com
        </a>
        .
      </p>
    </div>
  );
}
