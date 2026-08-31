import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PostsPaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath?: string;
};

function getPageHref(basePath: string, page: number) {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

// Rango compacto: primera, última, actual y vecinas, con "…" para el resto.
function getVisiblePages(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push("ellipsis");
    result.push(page);
  });
  return result;
}

export function PostsPagination({
  currentPage,
  totalPages,
  basePath = "/posts",
}: PostsPaginationProps) {
  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={getPageHref(basePath, Math.max(1, currentPage - 1))}
            aria-disabled={currentPage === 1}
            className={
              currentPage === 1 ? "pointer-events-none opacity-50" : undefined
            }
          />
        </PaginationItem>

        {visiblePages.map((page, index) =>
          page === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                href={getPageHref(basePath, page)}
                isActive={page === currentPage}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href={getPageHref(basePath, Math.min(totalPages, currentPage + 1))}
            aria-disabled={currentPage === totalPages}
            className={
              currentPage === totalPages
                ? "pointer-events-none opacity-50"
                : undefined
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
