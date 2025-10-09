import { Suspense } from "react";
export default function Page({ searchParams }: { searchParams: { plan?: string } }) {
  const plan = (searchParams?.plan ?? "starter").toUpperCase();
  return (
    <main className="container">
      <h1 className="mb-2">Pay by JUICE – {plan}</h1>
      <p>Send payment to <b>MCB JUICE: +230 54960101</b> then upload proof below.</p>
      <form action="/api/billing/juice/proof" method="post" encType="multipart/form-data">
        <input type="hidden" name="plan" value={plan.toLowerCase()} />
        <input type="file" name="proof" required className="block my-3" />
        <button className="btn-primary">Upload proof</button>
      </form>
    </main>
  );
}
