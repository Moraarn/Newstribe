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
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface QuizFiltersProps {
  currentFilters: {
    level?: string;
    sort?: string;
    keyword?: string;
  };
}

interface QuizPaginationProps {
  pagination: {
    page: number;
    total: number;
    limit: number;
    totalPages: number;
  };
}

export function QuizFilters({ currentFilters }: QuizFiltersProps) {
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

    router.push(`/quizzes?${params.toString()}`);
  };

  const levels = [
    { value: "", label: "All Levels", color: "bg-gray-100 hover:bg-gray-200" },
    {
      value: "beginner",
      label: "Beginner",
      color: "bg-green-100 hover:bg-green-200 text-green-700",
    },
    {
      value: "intermediate",
      label: "Intermediate",
      color: "bg-blue-100 hover:bg-blue-200 text-blue-700",
    },
    {
      value: "advanced",
      label: "Advanced",
      color: "bg-purple-100 hover:bg-purple-200 text-purple-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1 flex gap-2">
          {levels.map((level) => (
            <Button
              key={level.value}
              variant={currentFilters.level === level.value ? "default" : "outline"}
              className={`text-black h-10 font-medium ${
                currentFilters.level === level.value
                  ? level.value === "beginner"
                    ? "bg-green-600 hover:bg-green-700"
                    : level.value === "intermediate"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : level.value === "advanced"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : ""
                  : level.color
              }`}
              onClick={() => updateQuery({ level: level.value })}
            >
              {level.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Select
            defaultValue={currentFilters.sort}
            onValueChange={(value) => updateQuery({ sort: value })}
          >
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt:-1">Newest First</SelectItem>
              <SelectItem value="createdAt:1">Oldest First</SelectItem>
              <SelectItem value="points:-1">Most Points</SelectItem>
              <SelectItem value="difficulty:1">Easiest First</SelectItem>
              <SelectItem value="difficulty:-1">Hardest First</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative w-[200px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quizzes..."
              className="pl-8 h-10"
              defaultValue={currentFilters.keyword}
              onChange={(e) => updateQuery({ keyword: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuizPagination({ pagination }: QuizPaginationProps) {
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

    router.push(`/quizzes?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
        {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{" "}
        quizzes
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
