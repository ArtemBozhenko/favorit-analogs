export function ErrorAlert({ error, onRetry }) {
  return (
    <div className="alert alert-danger d-flex align-items-center justify-content-between gap-3" role="alert">
      <span>{error}</span>
      {onRetry && (
        <button type="button" className="btn btn-sm btn-outline-danger" onClick={onRetry}>
          Повторить
        </button>
      )}
    </div>
  )
}
