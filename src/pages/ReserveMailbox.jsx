export default function ReserveMailbox() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Reserve a Mailbox</h1>

      <h2 className="text-xl font-semibold mt-6 mb-2">What to Bring</h2>

      <ul className="list-disc pl-6 space-y-2">
        <li>USPS Form 1583 (provided in-store)</li>
        <li>Two forms of ID (one primary, one secondary)</li>
        <li>All authorized recipients must be listed</li>
      </ul>

      <h3 className="text-lg font-semibold mt-6">Primary ID (Photo)</h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>Driver’s License</li>
        <li>Passport</li>
        <li>Military ID</li>
        <li>State ID Card</li>
      </ul>

      <h3 className="text-lg font-semibold mt-6">Secondary ID (Address)</h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>Vehicle Registration</li>
        <li>Utility Bill</li>
        <li>Lease or Mortgage</li>
        <li>Voter Registration</li>
        <li>Insurance Policy</li>
      </ul>

      <h3 className="text-lg font-semibold mt-6">Business Mailboxes</h3>
      <p className="mt-2">
        Bring your business name and a list of authorized recipients.
        Business documentation is helpful if available.
      </p>

      <p className="mt-8 font-semibold">
        Walk-ins welcome. Notary services available on-site.
      </p>
    </div>
  );
}
