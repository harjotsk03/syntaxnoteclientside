"use client";

import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import { ArrowUpDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { fetchReposAction } from "@/actions/repo-actions";

interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
}

interface RepoTableProps {
  username: string;
  token: string;
  initialRepos: Repo[];
}

export default function RepoTable({
  username,
  token,
  initialRepos,
}: RepoTableProps) {
  const router = useRouter();
  const [repos, setRepos] = useState<Repo[]>(initialRepos);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Load next page of repos
  const loadNextPage = async () => {
    setLoading(true);
    try {
      const newRepos = await fetchReposAction(username, token, page + 1);
      setRepos(newRepos);
      setPage(page + 1);
    } catch (error) {
      toast.error("Failed to load repositories");
    } finally {
      setLoading(false);
    }
  };

  // Load previous page
  const loadPreviousPage = async () => {
    if (page === 1) return;

    setLoading(true);
    try {
      const prevRepos = await fetchReposAction(username, token, page - 1);
      setRepos(prevRepos);
      setPage(page - 1);
    } catch (error) {
      toast.error("Failed to load repositories");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Repo>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="flex items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name <ArrowUpDown className="w-4 h-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <a
          href={row.original.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {row.original.name}
        </a>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-xs line-clamp-2">
          {row.original.description || "-"}
        </div>
      ),
    },
    {
      accessorKey: "language",
      header: "Language",
      cell: ({ row }) => row.original.language || "-",
    },
    {
      accessorKey: "stargazers_count",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="flex items-center gap-1"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Stars <ArrowUpDown className="w-4 h-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          ⭐ {row.original.stargazers_count}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: repos, // ✅ Fixed: use repos instead of undefined repoData
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full h-max">
      {/* Search & Filters */}
      <div className="flex items-center mb-4 gap-2">
        <Input
          placeholder="Filter by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("name")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />

        {/* Column Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  className="capitalize"
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => {
                    toast.promise(
                      new Promise((resolve) => {
                        router.push(
                          `/repositories/${encodeURIComponent(
                            row.original.name
                          )}`
                        );
                        resolve(true);
                      }),
                      {
                        loading: "Loading repository…",
                        success: "Repository loaded!",
                        error: "Failed to load repository.",
                      }
                    );
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={loadPreviousPage}
          disabled={page === 1 || loading}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={loadNextPage}
          disabled={repos.length < 10 || loading}
        >
          Next
        </Button>
        <span className="ml-2 text-sm text-muted-foreground">Page {page}</span>
      </div>
    </div>
  );
}
