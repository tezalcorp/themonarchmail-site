import React from "react";

const SERVICES = [
  { title: "Shipping", desc: "Pack, ship, and track with major carriers." },
  { title: "Mailbox Rentals", desc: "Secure mailbox rentals with a real street address." },
  { title: "Printing", desc: "Flyers, postcards, business cards, banners, and more." },
  { title: "Notary", desc: "In-store notary services (availability may vary)." },
];

export default function Services() {
  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>Services</h1>

      <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
        {SERVICES.map((s) => (
          <section key={s.title} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
            <h2 style={{ margin: 0 }}>{s.title}</h2>
            <p style={{ marginTop: 8 }}>{s.desc}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
