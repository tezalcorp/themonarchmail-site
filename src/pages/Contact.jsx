import React, { useState } from "react";

export default function Contact() {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      // Temporary: no backend hooked up yet
      await new Promise((r) => setTimeout(r, 500));
      setStatus("sent");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>Contact</h1>
      <p>
        Send us a message. (Form delivery is temporarily disabled while we migrate systems.)
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <input name="name" placeholder="Name" value={form.name} onChange={onChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={onChange} />
        <textarea name="message" placeholder="Message" value={form.message} onChange={onChange} rows={6} required />
        <button type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending..." : "Send"}
        </button>

        {status === "sent" && <p>Thanks — message received.</p>}
        {status === "error" && <p>Something went wrong. Try again later.</p>}
      </form>
    </main>
  );
}
