import React from "react";

const EMAIL = "contact@themonarchmail.com";
const TEAM_EMAIL = "hello@tezalconsulting.com";

// Turns email addresses in a string into mailto links.
function Rich({ text }) {
  const parts = text.split(/(contact@themonarchmail\.com|hello@tezalconsulting\.com|thomas@tezalconsulting\.com)/g);
  return (
    <>
      {parts.map((part, i) =>
        part === EMAIL || part === TEAM_EMAIL || part === "thomas@tezalconsulting.com" ? (
          <a key={i} href={`mailto:${part}`} className="font-medium text-blue-900 underline">
            {part}
          </a>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

const KEY_DATES = [
  ["Now through Wed, Nov 25", "Regular hours: Mon–Fri 10:00 AM–5:30 PM. Saturdays by appointment. Closed Sundays."],
  ["Wed, Nov 25", "LAST DAY for retail, mail pickup, and package pickup. Mailbox keys due back (to avoid a $10 fee)."],
  ["Thu, Nov 26", "Closed (Thanksgiving)."],
  ["Fri, Nov 27 – Mon, Nov 30", "Sale only: remaining inventory and fixtures, 10:00 AM–5:30 PM or by appointment. Mail received through Nov 30 can be forwarded if arranged."],
];

const SECTIONS = [
  {
    title: "General & Dates",
    items: [
      [
        "Is Monarch Mail closing?",
        "Yes. After a health scare this summer, Thomas decided not to renew the lease, so our physical storefront is closing. Thank you for supporting a local small business.",
      ],
      [
        "What are your hours until the store closes?",
        "Through Wednesday, November 25: Monday–Friday, 10:00 AM–5:30 PM. Saturdays by appointment. Closed all Sundays.",
      ],
      [
        "What is the last day I can come in for services?",
        "Wednesday, November 25, 2026. That is the last day for retail, mail pickup, and package pickup.",
      ],
      ["Are you open on Thanksgiving?", "No. We are closed Thursday, November 26."],
      [
        "Will the store be open after November 25?",
        "Only for our sale of remaining inventory and fixtures on Friday, November 27, Saturday, November 28, and Monday, November 30, from 10:00 AM–5:30 PM or by appointment. There are no mail, package, or retail services after November 25.",
      ],
      [
        "Can I buy store fixtures or leftover inventory?",
        "Yes. Everything remaining will be for sale on Friday, November 27, Saturday, November 28, and Monday, November 30, from 10:00 AM–5:30 PM or by appointment.",
      ],
    ],
  },
  {
    title: "Mail & Packages",
    items: [
      [
        "When do I need to pick up my mail and packages?",
        "By end of day Wednesday, November 25, 2026. Please don't wait until the last day.",
      ],
      [
        "What happens to mail or packages that aren't picked up by November 25?",
        "Anything not picked up, or not arranged with us in advance, will be returned to sender.",
      ],
      [
        "I can't make it in by November 25. What can I do?",
        `Email us at ${EMAIL} as soon as possible to make a plan. Secure offsite storage and forwarding by mail are available at your expense, but only if arranged with us in advance.`,
      ],
      [
        "How much does offsite storage and forwarding cost?",
        `It depends on the item's dimensions, how long it's stored, and the final shipping or forwarding address. We'll give you a quote when you arrange it. Email ${EMAIL} to get started.`,
      ],
      [
        "Can someone else pick up my mail for me?",
        `Yes. If that person is already on your authorized pickup list, nothing extra is needed. If not, first email ${EMAIL} a copy of your driver's license and the name of the person picking up.`,
      ],
      [
        "Do I need to update my address?",
        "Yes. Everyone should update their address with banks, the IRS, the state, vendors, and any subscriptions. If you rented a physical mailbox, also file a USPS change of address as needed.",
      ],
    ],
  },
  {
    title: "Virtual Mailboxes (iPostal1 or Anytime Mailbox)",
    items: [
      [
        "I have a virtual mailbox through iPostal1 or Anytime Mailbox. What should I do?",
        "Look for an email from your provider (iPostal1 or Anytime Mailbox) about next steps, and contact that company directly for specifics. Monarch Mail is not the account holder for those services.",
      ],
      [
        "Should I request scans, forwards, or shreds now?",
        "Yes. Please request any scans, forwards, or shreds soon so nothing is held up during the transition.",
      ],
      [
        "When will my virtual mailbox change over?",
        "Your provider will share the details. Look for an email from iPostal1 or Anytime Mailbox, or contact them directly.",
      ],
      [
        "Can Monarch Mail change or cancel my iPostal1 or Anytime Mailbox account?",
        "No. Monarch Mail is not the account holder for those services. Please contact iPostal1 or Anytime Mailbox directly.",
      ],
    ],
  },
  {
    title: "Physical Mailboxes (Store Mailboxes)",
    items: [
      [
        "I rent a physical mailbox at the store. What do I need to do?",
        "1. Pick up all of your mail by Wednesday, November 25.\n2. Bring in your mailbox keys by November 25 to avoid a $10 fee.\n3. Update your address with your bank, the IRS, the state, vendors, and subscriptions.\n4. File a USPS change of address as needed.",
      ],
      [
        "Will I get a refund for prepaid months?",
        `No one should have paid past November. If you believe you did, email ${EMAIL} with any information you have, and we'll review it. If a refund is warranted, we will be sure to make it right.`,
      ],
      ["What do I do with my mailbox key?", "Bring your keys in by Wednesday, November 25 to avoid a $10 fee."],
      [
        "Will my mail be forwarded after the store closes?",
        `Mail received by November 30 can be forwarded at your expense, if you arrange it with us in advance. Email ${EMAIL} to set it up.`,
      ],
      [
        "What happens to mail that arrives at my box address after closing?",
        "Mail received after November 30 is returned to sender.",
      ],
    ],
  },
  {
    title: "Services After Closing",
    items: [
      [
        "Is Monarch Mail going away completely?",
        "The storefront is closing. For most day-to-day services previously offered by Monarch Mail, we recommend The Mailing Spot off of Huebner and Blanco. For special projects, white-glove services are offered through www.tezalconsulting.com.",
      ],
      [
        "Where can I get shipping or notary after closing?",
        "For most day-to-day services previously offered by Monarch Mail, we recommend The Mailing Spot off of Huebner and Blanco. If this is regarding a special project, white-glove services are offered through www.tezalconsulting.com. You can send an email to thomas@tezalconsulting.com.",
      ],
      [
        "Where can I get custom T-shirts, merch, or swag printed?",
        "Worthwhile Merch (worthwhilemerch.com) handles custom tees, hoodies, and swag for teams, schools, businesses, and events.",
      ],
      [
        "Do you know anyone who can help with websites or tech?",
        "Yes. Tezal Consulting (www.tezalconsulting.com) also does websites, automation, integrations, and in-home tech setup.",
      ],
      [
        "Do you know someone for pressure washing?",
        "Yes. Comal Exterior (comalexterior.com), run by Thomas's son, offers pressure washing and exterior cleaning around San Antonio and New Braunfels.",
      ],
    ],
  },
  {
    title: "Contact",
    items: [
      [
        "How do I contact Monarch Mail?",
        `Email ${EMAIL} or text 210.265.5805. For special projects, email thomas@tezalconsulting.com.`,
      ],
      [
        "Is there a phone number I can call?",
        `Yes, our number is 210.265.5805. During shipping season and the store closing, calls may be hard to get through, so we prefer email or text. Email ${EMAIL} or text 210.265.5805.`,
      ],
    ],
  },
];

export default function FAQ() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900">Monarch Mail Closing FAQ</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated October 31, 2026</p>
      <p className="mt-4 text-gray-700">
        The storefront is closing after <strong>Wednesday, November 25, 2026</strong>. Find answers below, or email{" "}
        <Rich text={EMAIL} />. You can also use the chat assistant in the corner of the page.
      </p>

      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Key dates</h2>
        <dl className="space-y-3 text-sm">
          {KEY_DATES.map(([when, what]) => (
            <div key={when} className="grid gap-1 sm:grid-cols-[200px_1fr]">
              <dt className="font-semibold text-gray-900">{when}</dt>
              <dd className="text-gray-700">{what}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm font-medium text-red-700">There are no mail, package, or retail services after November 25.</p>
      </section>

      {SECTIONS.map((section) => (
        <section key={section.title} className="mt-10">
          <h2 className="mb-3 text-xl font-semibold text-gray-900">{section.title}</h2>
          <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
            {section.items.map(([q, a]) => (
              <details key={q} className="group p-4">
                <summary className="cursor-pointer list-none font-medium text-gray-900 marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {q}
                    <span className="text-gray-400 transition-transform group-open:rotate-45">+</span>
                  </span>
                </summary>
                <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">
                  <Rich text={a} />
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
