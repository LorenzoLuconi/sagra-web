import { FetcherQueryParam, SagraContext } from "./sagraContext";
import {manageErrorResponse} from "../../utils";
import {getAppConf} from "../../AppConf.ts";

export const unauthorizedEventName = "sagra:unauthorized";

export type ErrorWrapper<TError> =
  | TError
  | { status: "unknown"; payload: string };

export type SagraFetcherOptions<TBody, THeaders, TQueryParams, TPathParams> = {
  url: string;
  method: string;
  body?: TBody;
  headers?: THeaders;
  queryParams?: TQueryParams;
  pathParams?: TPathParams;
  signal?: AbortSignal;
} & SagraContext["fetcherOptions"];

export async function sagraFetch<
  TData,
  TError,
  TBody extends object | FormData | undefined | null,
  THeaders extends object,
  TQueryParams extends object,
  TPathParams extends Record<string, string | number>,
>({
  url,
  method,
  body,
  headers,
  pathParams,
  queryParams,
  signal,
}: SagraFetcherOptions<
  TBody,
  THeaders,
  TQueryParams,
  TPathParams
>): Promise<TData> {
  try {
    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...headers,
    };

    /**
     * As the fetch API is being used, when multipart/form-data is specified
     * the Content-Type header must be deleted so that the browser can set
     * the correct boundary.
     * https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects#sending_files_using_a_formdata_object
     */
    if (
      requestHeaders["Content-Type"]
        ?.toLowerCase()
        .includes("multipart/form-data")
    ) {
      delete requestHeaders["Content-Type"];
    }

    const response = await window.fetch(
      `${getAppConf().apiUrl}${resolveUrl(url, queryParams, pathParams)}`,
      {
        signal,
        method: method.toUpperCase(),
        credentials: "include",
        body: body
          ? body instanceof FormData
            ? body
            : JSON.stringify(body)
          : undefined,
        headers: requestHeaders,
      } as RequestInit,
    );

    if (!response.ok) {
      await manageErrorResponse<TError>(response)
    }
    if (response.headers.get("content-type")?.includes("json")) {
      return await response.json();
    } else {
      // if it is not a json response, assume it is a blob and cast it to TData
      return (await response.blob()) as unknown as TData;
    }
  } catch (e) {
    if (getErrorStatus(e) === 401 && shouldDispatchUnauthorizedEvent(url)) {
      window.dispatchEvent(new CustomEvent(unauthorizedEventName));
    }

    if (e && typeof e === "object" && "status" in e) {
      throw e;
    }

    const errorObject: Error = {
      name: "unknown" as const,
      message:
        e instanceof Error ? `Network error (${e.message})` : "Network error",
      stack: e as string,
    };
    throw errorObject;
  }
}

const getErrorStatus = (error: unknown): number | undefined => {
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === "number" ? status : undefined;
  }

  return undefined;
};

const shouldDispatchUnauthorizedEvent = (url: string): boolean => {
  return url !== "/v1/auth/login";
};

const resolveUrl = (
  url: string,
  queryParams: Record<string, FetcherQueryParam> = {},
  pathParams: Record<string, string | number> = {},
) => {
  const normalizedQueryParams = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => normalizedQueryParams.append(key, String(item)));
    } else if (value !== undefined && value !== null) {
      normalizedQueryParams.append(key, String(value));
    }
  });
  let query = normalizedQueryParams.toString();
  if (query) query = `?${query}`;
  return (
    url.replace(/\{\w*\}/g, (key) => String(pathParams[key.slice(1, -1)] ?? "")) + query
  );
};
