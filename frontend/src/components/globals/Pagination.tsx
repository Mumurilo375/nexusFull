import type { PaginationProps as MuiPaginationProps } from "@mui/material/Pagination";
import MuiPagination from "@mui/material/Pagination";
import type { PaginationProps } from "./globals.types";

export default function Pagination({
  page,
  totalPages,
  scrollToTop = true,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const handleChange: NonNullable<MuiPaginationProps["onChange"]> = (_event, value) => {
    onPageChange(value);
    if (scrollToTop) {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="mt-4 flex justify-center">
      <MuiPagination
        count={totalPages}
        page={page}
        onChange={handleChange}
        shape="rounded"
        size="large"
        sx={{
          "& .MuiPagination-ul": {
            gap: "0.4rem",
            flexWrap: "nowrap",
          },
          "& .MuiPaginationItem-root": {
            color: "#e2e8f0",
            borderRadius: "16px",
            border: "1px solid rgba(51, 65, 85, 0.95)",
            backgroundColor: "rgba(2, 6, 23, 0.82)",
            minWidth: "42px",
            height: "42px",
            transition: "all 0.2s ease",
          },
          "& .MuiPaginationItem-root:hover": {
            backgroundColor: "rgba(15, 23, 42, 0.98)",
            borderColor: "rgba(59, 130, 246, 0.55)",
          },
          "& .MuiPaginationItem-root.Mui-selected": {
            backgroundColor: "rgba(37, 99, 235, 0.2)",
            borderColor: "rgba(59, 130, 246, 0.7)",
            color: "#ffffff",
          },
          "& .MuiPaginationItem-root.Mui-selected:hover": {
            backgroundColor: "rgba(37, 99, 235, 0.28)",
          },
          "& .MuiPaginationItem-previousNext": {
            px: 1.1,
          },
          "& .MuiPaginationItem-ellipsis": {
            border: "none",
            backgroundColor: "transparent",
          },
        }}
      />
    </div>
  );
}
