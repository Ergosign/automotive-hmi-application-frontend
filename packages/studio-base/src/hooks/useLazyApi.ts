// This Source Code Form is subject to the terms of the Mozilla Public
// License, v2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/

import { useCallback, useRef, useState } from "react";

export interface UseLazyApiStates<TReturn> {
  loading: boolean;
  called: boolean;
  calling: boolean;
  data: TReturn | undefined;
  error: boolean;
}

export interface UseLazyApiRequest {
  method: "POST" | "GET" | "PUT" | "DELETE";
  path: string;
  credentials?: boolean;
  headers?: HeadersInit;
}

export type LazyApiResponse<T> = {
  data: T | undefined;
  ok: boolean;
};

const BASE_PATH = window.configuration.DATABASE_URL;

export const useLazyApi = <TBody, TResponse>(
  apiRequest: UseLazyApiRequest,
): [
  lazyFunction: (request: TBody) => Promise<LazyApiResponse<TResponse>>,
  states: UseLazyApiStates<TResponse>,
] => {
  const [loading, setLoading] = useState(false);
  const [called, setCalled] = useState(false);
  const [calling, setCalling] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState<undefined | TResponse>(undefined);

  const timer = useRef<undefined | NodeJS.Timeout>(undefined);
  const abortController = useRef<undefined | AbortController>(undefined);

  const lazyFunction = useCallback(
    async (request: TBody): Promise<LazyApiResponse<TResponse>> => {
      return await new Promise((resolve) => {
        setLoading(true);
        setCalling(true);
        setCalled(true);
        setError(false);

      // Clearing timer. (Also good for react StrictMode)
        if (timer.current) {
          clearTimeout(timer.current);
        }
        timer.current = setTimeout(async () => {
          abortController.current = new AbortController();

          try {
            const response = await fetch(BASE_PATH + apiRequest.path, {
              method: apiRequest.method,
              headers: {
                "Content-Type": "application/json",
                ...apiRequest.headers,
              },
              credentials: apiRequest.credentials === true ? "include" : undefined,
              signal: abortController.current.signal,
              body: apiRequest.method.toLowerCase() === "get" ? undefined : JSON.stringify(request),
            });

            const ok = response.ok;
            let JSONResponse: TResponse | undefined = undefined;

            try {
              JSONResponse = (await response.json()) as TResponse | undefined;
            } catch (err) {
            // Response was not JSON
              console.error(err);
              setError(true);
              resolve({ data: undefined, ok });
              return;
            }

            if (JSONResponse == undefined) {
              setError(true);
              resolve({ data: undefined, ok });
              return;
            }

            setCalling(false);
            setCalled(false);
            setLoading(false);
            setData(JSONResponse);
            resolve({ data: JSONResponse, ok });
          } catch (err) {
          // Server call failed
            console.error(err);
            setError(true);
            resolve({ data: undefined, ok: false });
          }
        }, 150);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return [lazyFunction, { data, loading, error, called, calling }];
};
