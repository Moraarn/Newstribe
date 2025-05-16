"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentType } from "@/types/content";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface ArticleFiltersProps {
  currentFilters: {
    type?: ContentType;
    category?: string;
    sort?: string;
    keyword?: string;
  };
}

interface ArticlePaginationProps {
  pagination: {
    page: number;
    total: number;
    limit: number;
    totalPages: number;
  };
}

export function ArticleFilters({ currentFilters }: ArticleFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateQuery = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update or remove params
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    if (Object.keys(updates).some((key) => key !== "page")) {
      params.set("page", "1");
    }

    router.push(`/articles?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            className="pl-8"
            defaultValue={currentFilters.keyword}
            onChange={(e) => updateQuery({ keyword: e.target.value })}
          />
        </div>
      </div>
      <Select
        defaultValue={currentFilters.type}
        onValueChange={(value) => updateQuery({ type: value === "all" ? "" : value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Content Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value={ContentType.ARTICLE}>Articles</SelectItem>
          <SelectItem value={ContentType.QUIZ}>Quizzes</SelectItem>
          <SelectItem value={ContentType.SPONSORED}>Sponsored</SelectItem>
          <SelectItem value={ContentType.MINI_GAME}>Mini Games</SelectItem>
        </SelectContent>
      </Select>
      <Select
        defaultValue={currentFilters.sort}
        onValueChange={(value) => updateQuery({ sort: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt:-1">Newest First</SelectItem>
          <SelectItem value="createdAt:1">Oldest First</SelectItem>
          <SelectItem value="points:-1">Most Points</SelectItem>
          <SelectItem value="trustRating:-1">Highest Rated</SelectItem>
          <SelectItem value="estimatedReadTime:1">Quickest Read</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function ArticlePagination({ pagination }: ArticlePaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateQuery = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update or remove params
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/articles?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
        {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{" "}
        articles
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          disabled={pagination.page === 1}
          onClick={() => updateQuery({ page: String(pagination.page - 1) })}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm">
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          disabled={pagination.page === pagination.totalPages}
          onClick={() => updateQuery({ page: String(pagination.page + 1) })}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
