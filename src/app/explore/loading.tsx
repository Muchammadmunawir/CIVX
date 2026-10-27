export default function ExploreLoading() {
  return (
    <main className="civx-container civx-state" aria-busy="true">
      <h1>Explore Jawa Barat</h1>
      <p role="status">Loading the 2023 regional release…</p>
      <div className="civx-skeleton" aria-hidden="true" />
    </main>
  );
}
