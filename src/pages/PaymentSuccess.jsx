import React from "react";
import { Link } from "react-router-dom";

export default function PaymentSuccess() {
  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>Payment Successful</h1>
      <p>Thanks! Your payment was received.</p>
      <p style={{ marginTop: 16 }}>
        <Link to="/">Return home</Link>
      </p>
    </main>
  );
}
