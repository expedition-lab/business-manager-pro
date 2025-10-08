export default function Home() {
  return (
    <main style={{ maxWidth: 880, margin: "40px auto", padding: 16 }}>
      <h1>Business Manager Pro</h1>
      <p>Welcome. Choose a page:</p>
      <ul>
        <li><a href="/auth">Auth</a></li>
        <li><a href="/settings">Settings</a></li>
        <li><a href="/offline">Offline</a></li>
      </ul>
    </main>
  );
}
