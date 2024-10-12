"use client";

import { useCallback, useEffect, useRef } from "react";
import init, * as core from "core-wasm";
import { Button } from "../ui/button";

const CANVAS_WIDTH = 950;
const CANVAS_HEIGHT = 800;

export function Editor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<core.DataGrid | null>(null);
  const coordRef = useRef({ row: 60, col: 80 });
  const initialized = useRef(false);

  const renderGrid = useCallback((row: number, col: number) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) {
      const instance = instanceRef.current;
      ctx.clearRect(0, 0, canvasRef.current?.width, canvasRef.current?.height);
      ctx.strokeStyle = "rgba(0, 0, 0, .2)";
      instanceRef.current = instance;
      const cells: core.Cell[][] = instance?.get_grid(row, col);

      /** Render cells */
      {
        const spreadsheetData: string[][] = instance?.get_spreadsheet_data();
        ctx.fillStyle = "black";
        const renderCell = (row_cells: core.Cell[], rowIndex: number) => {
          row_cells.forEach((cell, colIndex: number) => {
            const x = colIndex * 100;
            const y = rowIndex * 26;
            ctx.strokeRect(x, y, 100, 26);
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

      /** render vertical scroll bar */
      {
        ctx.fillStyle = "green";
        const barHeight = (cells.length / 100) * CANVAS_HEIGHT;
        const currentCell = cells[1][0];
        const offset =
          (((currentCell.row - 1) * 26) / (100 * 26)) * CANVAS_HEIGHT;
        console.log(((currentCell.row - 1) * 26) / 100, offset);
        ctx.fillRect(CANVAS_WIDTH - 10, offset, 10, barHeight);
      }

      /** render horizontal scroll bar */
      {
        ctx.fillStyle = "red";
        const barWidth = (cells[0].length / 100) * CANVAS_HEIGHT;
        const currentCell = cells[0][1];
        const offset =
          (((currentCell.col - 1) * 100) / (100 * 100)) * CANVAS_WIDTH;
        ctx.fillRect(offset, CANVAS_HEIGHT - 10, barWidth, 10);
      }
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;

    init({}).then(() => {
      const instance = new core.DataGrid(CANVAS_WIDTH, CANVAS_HEIGHT);
      instanceRef.current = instance;
      renderGrid(coordRef.current.row, coordRef.current.col);
    });

    initialized.current = true;

    return () => {
      instanceRef.current?.free();
    };
  }, [renderGrid]);

  return (
    <div className="relative">
      <canvas width={CANVAS_WIDTH} height={CANVAS_HEIGHT} ref={canvasRef} />

      <div className="flex space-x-1 mt-2">
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
