export default function ConnectedLoading() {
  return (
    <div aria-label="Loading page" aria-live="polite" className="animate-pulse">
      <div className="mb-3 h-3 w-20 rounded-full bg-accent-subtle" />
      <div className="h-10 w-64 max-w-full rounded-lg bg-ui-raised" />
      <div className="mt-3 h-4 w-96 max-w-full rounded bg-ui-raised" />
      <div className="mt-7 grid grid-cols-2 gap-4 max-[800px]:grid-cols-1">
        <div className="card h-52 bg-ui-surface" />
        <div className="card h-52 bg-ui-surface" />
      </div>
    </div>
  );
}
