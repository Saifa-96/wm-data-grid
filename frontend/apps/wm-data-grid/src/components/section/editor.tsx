"use client";

import { useCallback, useEffect, useRef } from "react";
import init, * as core from "core-wasm";
import { Button } from "../ui/button";

export function Editor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<core.DataGrid | null>(null);
  const coordRef = useRef({ row: 1, col: 0 });
  const initialized = useRef(false);
  // const [pos, setPos] = useState<core.Cell | null>(null);

  const renderGrid = useCallback((row: number, col: number) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) {
      const instance = instanceRef.current;
      ctx.clearRect(0, 0, canvasRef.current?.width, canvasRef.current?.height);
      ctx.strokeStyle = "rgba(0, 0, 0, .2)";
      instanceRef.current = instance;
      const cells: core.Cell[][] = instance?.get_grid(row, col);
      console.log(cells);
      const spreadsheetData: string[][] = instance?.get_spreadsheet_data();
      const renderCell = (row_cells: core.Cell[], rowIndex: number) => {
        row_cells.forEach((cell, colIndex: number) => {
          const x = colIndex * 100;
          const y = rowIndex * 26;
          ctx.strokeRect(x, y, cell.width, 26);
          const textX = x + 5;
          const textY = y + 26 / 2;
          const text = spreadsheetData[cell.row][cell.col];
          ctx.fillText(
            text === "" ? `${cell.row} - ${cell.col}` : text,
            textX,
            textY
          );
        });
      };
      cells.forEach(renderCell);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;

    init({}).then(() => {
      const instance = new core.DataGrid(950, 800);
      instanceRef.current = instance;
      renderGrid(0, 0);
    });

    initialized.current = true;

    return () => {
      instanceRef.current?.free();
    };
  }, [renderGrid]);

  return (
    <div className="relative">
      {/* {pos !== null && (
        <div
          className="absolute border-sky-600 border-2"
          style={{
            width: (pos.width ?? 0) + 2,
            height: (pos.height ?? 0) + 2,
            left: (pos.x ?? 0) - 1,
            top: (pos.y ?? 0) - 1,
          }}
        />
      )} */}
      <canvas width={950} height={800} ref={canvasRef} />

      <div className="flex space-x-1">
        <Button
          onClick={() => {
            if (coordRef.current.row > 1) {
              coordRef.current.row--;
              renderGrid(coordRef.current.row, coordRef.current.col);
            }
          }}
        >
          up
        </Button>

        <Button
          onClick={() => {
            coordRef.current.row++;
            renderGrid(coordRef.current.row, coordRef.current.col);
          }}
        >
          down
        </Button>

        <Button
          onClick={() => {
            if (coordRef.current.col > 1) {
              coordRef.current.col--;
              renderGrid(coordRef.current.row, coordRef.current.col);
            }
          }}
        >
          left
        </Button>

        <Button
          onClick={() => {
            coordRef.current.col++;
            renderGrid(coordRef.current.row, coordRef.current.col);
          }}
        >
          right
        </Button>
      </div>
    </div>
  );
}
