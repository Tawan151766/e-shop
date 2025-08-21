export default function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="flex justify-center gap-2 py-4">
      <button
        className="px-3 py-1 rounded border text-sm disabled:opacity-50"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        ก่อนหน้า
      </button>
      <span className="px-2 text-sm">{page} / {totalPages}</span>
      <button
        className="px-3 py-1 rounded border text-sm disabled:opacity-50"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
      >
        ถัดไป
      </button>
    </div>
  );
}
