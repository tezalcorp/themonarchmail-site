export default function ReserveMailbox() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">
        Reserve a Mailbox at Monarch Mail
      </h1>

      <p className="mb-6">
        To reserve or open a mailbox, USPS regulations require the following
        items. Please bring all required documentation when you visit our store.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Required Forms</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>USPS Form 1583 (provided in-store)</li>
        <li>Form must be notarized (notary services available on-site)</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        Identification (Two Required)
      </h2>

      <h3 className="text-lg font-semibold mt-4">Primary ID (Photo)</h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>Driver’s License</li>
        <li>Passport</li>
        <li>Military ID</li>
        <li>State ID Card</li>
      </ul>

      <h3 className="text-lg font-semibold mt-4">
        Secondary ID (Address Verification)
      </h3>
      <ul className="list-disc pl-6 space-y-1">
        <li>Vehicle Registration</li>
        <li>Utility Bill</li>
        <li>Lease, Mortgage, or Deed</li>
        <li>Voter Registration Card</li>
        <li>Home or Auto Insurance Policy</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        Who Needs to Be Listed
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>All individuals receiving mail must be listed</li>
        <li>Each person must provide their own identification</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        Business Mailboxes (Optional)
      </h2>
      <p>
        If opening a mailbox for a business, bring your business name and a list
        of authorized recipients. Business documentation (DBA, LLC, Corp) is
        helpful if available.
      </p>

      <p className="mt-8 font-semibold">
        Walk-ins welcome. No appointment required.
      </p>
    </div>
  );
}
