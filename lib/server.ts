import chalk from "chalk";
import { setCookieFromString } from "./cookie";
import { cookies } from "next/headers";

const baseURL = process.env.SERVER_URL;
const COOKIE_NAME = process.env.COOKIE_NAME || "jwt";

/**
 * Request options for the AppServer.
 * @typedef {Object} RequestOptions
 * @property {Object} [query] - Query parameters to append to the URL.
 * @property {boolean} [isMultipart] - Set to true if sending multipart/form-data.
 * @property {RequestCache} [cache] - Cache behavior for the request.
 */
type RequestOptions = {
  query?: Object;
  isMultipart?: boolean;
  params?: string[];
  cache?: RequestCache;
};

type responseColor = { [key: number]: any };

const statusColor: responseColor = {
  200: chalk.green,
  201: chalk.green,
  400: chalk.yellowBright,
  401: chalk.yellowBright,
  403: chalk.yellowBright,
  404: chalk.yellow,
  500: chalk.red,
};

/**
 * Generic API response wrapper.
 * @template T
 */
export type AppResponse<T> = {
  message: string;
  success: boolean;
  data: T | null;
};

// Define the structure of the query string
interface QueryString {
  page?: number;
  sort?: string;
  fields?: string;
  keyword?: string;
  limit?: number;
  skip?: number;
  from?: string;
  to?: string;
  order?: "asc" | "desc";
  [key: string]: any;
}

export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IFilter {
  field: string;
  value: any;
  operator: "eq" | "gt" | "lt" | "gte" | "lte" | "contains" | "in" | "nin";
}

export interface IResponseOptions {
  pagination?: IPagination;
  filters?: IFilter[];
  sort?: {
    field: string;
    order: "asc" | "desc";
  };
  metadata?: Record<string, any>;
}

// type paginated data
export type PaginatedData<T> = {
  pagination: IPagination;
  filters: IFilter[];
  sort: {
    field: string;
    order: "asc" | "desc";
  };
  [key: string]: T[] | IPagination | IFilter[] | { field: string; order: "asc" | "desc" };
};

/**
 * Represents a validation error for a specific form field.
 */
export type FormError = {
  field: string;
  message: string;
};

/**
 * AppServer provides a unified interface for making HTTP requests to your backend server.
 */
const AppServer = {
  /**
   * Sends an HTTP request to the backend server.
   * @template T
   * @param {string} method - HTTP method (GET, POST, etc.).
   * @param {string} path - API endpoint path (e.g., "/users").
   * @param {Object} [options] - Optional request configuration.
   * @param {Object} [body] - The request payload (non-GET requests only).
   * @returns {Promise<AppResponse<T>>} Promise resolving to a standardized response object.
   */
  async request<T>(
    method: string,
    path: string,
    {
      body = {},
      query = {},
      isMultipart = false,
      params = [],
      cache = "no-store",
    }: RequestOptions & { body?: any } = {}
  ): Promise<AppResponse<T>> {
    const cookieStore = await cookies();

    // Get all cookies from the cookie store
    const allCookies = cookieStore.getAll();

    // Build the Cookie header with all cookies
    const cookieHeader = allCookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");

    let url = `${baseURL}${path}`;
    if (query && Object.keys(query).length) {
      const queryString = new URLSearchParams(
        Object.entries(query).map(([key, value]) => [key, String(value)])
      ).toString();
      url += `?${queryString}`;
    }

    if (params && params.length) {
      url += `/${params.join("/")}`;
    }

    const headers: Record<string, string> = {
      Cookie: cookieHeader,
      "Cache-Control": cache,
    };

    if (!isMultipart && method !== "GET") {
      headers["Content-Type"] = "application/json";
    }

    try {
      const fetchOptions: RequestInit = {
        method,
        cache: "no-store",
        headers,
        body: method === "GET" ? undefined : isMultipart ? body : JSON.stringify(body ?? {}),
        credentials: "include",
      };

      const response = await fetch(url, fetchOptions);
      const responseStatus = response.status;

      // Handle all cookies from the response
      const cookiesHeader = response.headers.get("set-cookie");
      if (cookiesHeader) {
        // Split multiple cookies (they're separated by commas)
        const cookiesArray = cookiesHeader.split(",");

        // Process each cookie in a server action context
        for (const cookie of cookiesArray) {
          try {
            // Only set cookies if we're in a server context
            if (typeof window === 'undefined') {
              await setCookieFromString(cookie.trim());
            } else {
              console.warn('Cookie setting attempted in client context:', cookie);
            }
          } catch (error) {
            console.error(chalk.yellow(`Error setting cookie: ${error}`));
          }
        }
      }

      const color = statusColor[responseStatus] || chalk.yellow;
      console.log(chalk.green(`${method.toUpperCase()} ${url} ${color(responseStatus)}`));

      let responseData = null;
      try {
        responseData = await response.json();
      } catch (error) {
        console.error(chalk.red(`Error parsing JSON from ${url}:`), error);
      }

      return {
        message: responseData?.message || response.statusText,
        success: responseData?.success ?? response.ok,
        data: responseData?.data ?? responseData ?? null,
      };
    } catch (error: any) {
      const errorMessage = error.message || "Unknown error";
      console.error(chalk.red(`Error on ${method.toUpperCase()} ${url}: ${errorMessage}`));

      return {
        message: errorMessage,
        success: false,
        data: null,
      };
    }
  },

  /**
   * Sends a GET request.
   * @template T
   * @param {string} path - API endpoint path.
   * @param {RequestOptions} [options] - Optional query and cache options.
   * @returns {Promise<AppResponse<T>>} Promise resolving to the response.
   */
  get<T>(path: string, options?: RequestOptions): Promise<AppResponse<T>> {
    return this.request<T>("GET", path, options);
  },

  /**
   * Sends a POST request.
   * @template T
   * @param {string} path - API endpoint path.
   * @param {Object} [body] - Request body data.
   * @param {RequestOptions} [options] - Optional query, multipart and cache options.
   * @returns {Promise<AppResponse<T>>} Promise resolving to the response.
   */
  post<T>(path: string, body?: any, options?: RequestOptions): Promise<AppResponse<T>> {
    return this.request<T>("POST", path, { ...options, body });
  },

  /**
   * Sends a PATCH request.
   * @template T
   * @param {string} path - API endpoint path.
   * @param {Object} [body] - Request body data.
   * @param {RequestOptions} [options] - Optional query, multipart and cache options.
   * @returns {Promise<AppResponse<T>>} Promise resolving to the response.
   */
  patch<T>(path: string, body?: any, options?: RequestOptions): Promise<AppResponse<T>> {
    return this.request<T>("PATCH", path, { ...options, body });
  },

  /**
   * Sends a PUT request.
   * @template T
   * @param {string} path - API endpoint path.
   * @param {Object} [body] - Request body data.
   * @param {RequestOptions} [options] - Optional query, multipart and cache options.
   * @returns {Promise<AppResponse<T>>} Promise resolving to the response.
   */
  put<T>(path: string, body?: any, options?: RequestOptions): Promise<AppResponse<T>> {
    return this.request<T>("PUT", path, { ...options, body });
  },

  /**
   * Sends a DELETE request.
   * @template T
   * @param {string} path - API endpoint path.
   * @param {Object} [body] - Request body data (optional).
   * @param {RequestOptions} [options] - Optional query, multipart and cache options.
   * @returns {Promise<AppResponse<T>>} Promise resolving to the response.
   */
  delete<T>(path: string, body?: any, options?: RequestOptions): Promise<AppResponse<T>> {
    return this.request<T>("DELETE", path, { ...options, body });
  },
};

export default AppServer;
