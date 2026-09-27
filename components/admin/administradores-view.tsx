// components/admin/administradores-view.tsx

"use client";

import { useEffect, useState } from "react";
import { AdministradoresFilters } from "@/components/admin/administradores-filters";
import { AdministradoresPagination } from "@/components/admin/administradores-pagination";
import { AdministradoresTable } from "@/components/admin/administradores-table";
import { CreateAdminDialog } from "@/components/admin/create-admin-dialog";
import { ToggleAdminStatusDialog } from "@/components/admin/toggle-admin-status-dialog";
import { useAdminsQuery } from "@/lib/admins/hooks/use-admins";
import type { AdminListItem, AdminSubtype } from "@/lib/admins/types";

type SortableField = "nombreCompleto" | "email";

const PAGE_SIZE = 25;
const SEARCH_DEBOUNCE_MS = 350;

export function AdministradoresView() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [subtype, setSubtype] = useState<AdminSubtype | undefined>(undefined);
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortableField>("nombreCompleto");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    admin: AdminListItem;
    action: "activate" | "deactivate";
  } | null>(null);

  // Debounce del texto de búsqueda antes de disparar la query real.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const adminsQuery = useAdminsQuery({
    search: search || undefined,
    subtype,
    isActive,
    sortBy,
    sortOrder,
    page,
    pageSize: PAGE_SIZE,
  });

  const handleSortChange = (field: SortableField) => {
    if (field === sortBy) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleRequestStatusChange = (admin: AdminListItem) => {
    setPendingStatusChange({
      admin,
      action: admin.isActive ? "deactivate" : "activate",
    });
  };

  const admins = adminsQuery.data?.admins ?? [];
  const pagination = adminsQuery.data?.pagination ?? {
    page,
    pageSize: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdministradoresFilters
          search={searchInput}
          onSearchChange={setSearchInput}
          subtype={subtype}
          onSubtypeChange={(value) => {
            setSubtype(value);
            setPage(1);
          }}
          isActive={isActive}
          onIsActiveChange={(value) => {
            setIsActive(value);
            setPage(1);
          }}
        />
        <CreateAdminDialog />
      </div>

      <AdministradoresTable
        admins={admins}
        isLoading={adminsQuery.isLoading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onRequestStatusChange={handleRequestStatusChange}
      />

      <AdministradoresPagination
        pagination={pagination}
        onPageChange={setPage}
      />

      <ToggleAdminStatusDialog
        admin={pendingStatusChange?.admin ?? null}
        action={pendingStatusChange?.action ?? "deactivate"}
        onOpenChange={(open) => {
          if (!open) setPendingStatusChange(null);
        }}
      />
    </div>
  );
}
