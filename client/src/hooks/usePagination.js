import { useEffect, useState } from 'react';

export const PAGE_SIZE = 25;

// Client-side paging: returns the rows for the current page plus what the
// table needs to number rows (offset) and render <Pagination>.
export function usePagination(rows, pageSize = PAGE_SIZE) {
  const list = rows || [];
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(list.length / pageSize));
  const current = Math.min(page, pages);
  useEffect(() => { if (page > pages) setPage(pages); }, [page, pages]);
  const offset = (current - 1) * pageSize;
  return { rows: list.slice(offset, offset + pageSize), page: current, setPage, total: list.length, pageSize, offset };
}
