export default function ExploreLoading() {
  return (
    <main className="civx-container civx-state" aria-busy="true">
      <h1>Jelajah wilayah.</h1>
      <p role="status">Memuat 27 wilayah dalam model CIVX 2023…</p>
      <div className="civx-skeleton" aria-hidden="true" />
    </main>
  );
}
