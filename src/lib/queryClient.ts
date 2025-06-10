import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getApiUrl } from "./config";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  path: string,
  data?: unknown | undefined,
): Promise<Response> {
  const url = getApiUrl(path);
  console.log('Making API request:', { method, url, data });
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    mode: "cors",
  });

  console.log('API response:', { 
    status: res.status, 
    statusText: res.statusText,
    headers: Object.fromEntries(res.headers.entries())
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = getApiUrl(queryKey[0] as string);
    console.log('Making query request:', { url });
    
    const res = await fetch(url, {
      credentials: "include",
      mode: "cors",
      headers: {
        "Accept": "application/json"
      }
    });

    console.log('Query response:', { 
      status: res.status, 
      statusText: res.statusText,
      headers: Object.fromEntries(res.headers.entries())
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
});
