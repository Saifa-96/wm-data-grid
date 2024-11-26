import { useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { z } from "zod";

export const useSocketIO = () => {
  const curPageRef = useRef(1);
  const socket = useRef(io("ws://localhost:3009"));

  const cache = useRef<Map<string, Promise<unknown>>>(new Map());
  const request = useCallback(
    (msg: string, payload?: unknown): Promise<unknown> => {
      const waitingPromise = cache.current.get(msg);
      if (waitingPromise !== undefined) return waitingPromise;

      const p = new Promise((resolve) => {
        socket.current.emit(msg, payload);
        socket.current.on(msg, (data) => {
          cache.current.delete(msg);
          resolve(data);
        });
      });

      cache.current.set(msg, p);
      return p;
    },
    []
  );

  const init = useCallback(async () => {
    const result = await request("init").then(initialDataSchema.safeParse);
    return result;
  }, [request]);

  const nextPage = useCallback(async () => {
    const page = curPageRef.current + 1;
    const result = await request("next-page", { page }).then(
      pageSchema.safeParse
    );
    if (result.success) {
      curPageRef.current++;
    }
    return result;
  }, [request]);

  return { init, nextPage };
};

export const cellDataSchema = z.object({
  row_index: z.number(),
  col_index: z.number(),
  row: z.map(z.string(), z.string()).nullable(),
  col: z.object({
    name: z.string(),
    width: z.number(),
  }),
  x: z.number(),
  y: z.number(),
});

const initialDataSchema = z.object({
  header: z
    .array(
      z.object({
        name: z.string(),
        width: z.number(),
      })
    )
    .default([{ name: "empty", width: 120 }]),
  rows: z.array(z.record(z.string(), z.string())).default([]),
  total: z.number().default(0),
});

const pageSchema = z.object({
  rows: z.array(z.record(z.string(), z.string())).default([]),
  total: z.number().default(0),
});
