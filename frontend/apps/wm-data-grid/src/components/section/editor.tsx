"use client";

import {
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
  WheelEventHandler,
} from "react";
import init, * as core from "core-wasm";
import { Button } from "../ui/button";

const CANVAS_WIDTH = 950;
const CANVAS_HEIGHT = 800;

export function Editor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<core.DataGrid | null>(null);
  const initialized = useRef(false);
  const [editorCoord, setEditorCoord] = useState<{
    x: number;
    y: number;
    row: number;
    col: number;
    defaultValue: string;
  } | null>(null);
  const currentGrid = useRef<core.Cell[][] | null>(null);

  const renderGrid = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) {
      const instance = instanceRef.current;
      ctx.clearRect(0, 0, canvasRef.current?.width, canvasRef.current?.height);
      ctx.strokeStyle = "rgba(0, 0, 0, .2)";
      instanceRef.current = instance;
      const grid: core.Cell[][] = instance?.get_grid();
      currentGrid.current = grid;

      // render cells
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
        grid.forEach(renderCell);
      }

      // render vertical scroll bar
      {
        ctx.fillStyle = "green";
        const barHeight = (grid.length / 100) * CANVAS_HEIGHT;
        const currentCell = grid[1][0];
        const offset =
          (((currentCell.row - 1) * 26) / (100 * 26)) * CANVAS_HEIGHT;
        ctx.fillRect(CANVAS_WIDTH - 10, offset, 10, barHeight);
      }

      // render horizontal scroll bar
      {
        ctx.fillStyle = "red";
        const barWidth = (grid[0].length / 100) * CANVAS_HEIGHT;
        const currentCell = grid[0][1];
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
      renderGrid();
    });

    initialized.current = true;

    return () => {
      instanceRef.current?.free();
    };
  }, [renderGrid]);

  const handleWheel = useCallback<WheelEventHandler<HTMLCanvasElement>>(
    (event) => {
      if (event.deltaY !== 0) {
        const size = event.deltaY > 0 ? 1 : -2;
        instanceRef.current?.vertical_move(size);
        renderGrid();
      } else if (event.deltaX !== 0) {
        const size = event.deltaX > 0 ? 1 : -2;
        instanceRef.current?.horizontal_move(size);
        renderGrid();
      }
    },
    [renderGrid]
  );

  const handleClick = useCallback<MouseEventHandler<HTMLCanvasElement>>((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const pos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      const coord = {
        row: Math.floor(pos.y / 26),
        col: Math.floor(pos.x / 100),
      };

      const currentCell = currentGrid.current?.[coord.row][coord.col];

      if (currentCell) {
        setEditorCoord({
          row: currentCell.row,
          col: currentCell.col,
          x: coord.row * 26,
          y: coord.col * 100,
          defaultValue: "123",
        });

        // console.log(coord);
      }
    }
  }, []);

  const handleUpdate = useCallback(
    (value: string) => {
      if (editorCoord) {
        instanceRef.current?.update_cell_data(
          editorCoord.row,
          editorCoord.col,
          value
        );
        setEditorCoord(null);
        renderGrid();
      }
    },
    [editorCoord, renderGrid]
  );

  return (
    <div className="relative">
      <canvas
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        ref={canvasRef}
        onWheel={handleWheel}
        onClick={handleClick}
      />

      <CellInput coord={editorCoord} onUpdate={handleUpdate} />

      <div className="flex space-x-1 mt-2">
        <Button
          onClick={() => {
            instanceRef.current?.vertical_move(-2);
            renderGrid();
          }}
        >
          up
        </Button>

        <Button
          onClick={() => {
            instanceRef.current?.vertical_move(1);
            renderGrid();
          }}
        >
          down
        </Button>

        <Button
          onClick={() => {
            instanceRef.current?.horizontal_move(-2);
            renderGrid();
          }}
        >
          left
        </Button>

        <Button
          onClick={() => {
            instanceRef.current?.horizontal_move(1);
            renderGrid();
          }}
        >
          right
        </Button>
      </div>
    </div>
  );
}

interface CellInputProps {
  coord: {
    x: number;
    y: number;
    defaultValue: string;
  } | null;
  onUpdate: (value: string) => void;
}

const CellInput: FC<CellInputProps> = (props) => {
  const { coord, onUpdate } = props;

  if (coord === null) {
    return <></>;
  }

  return (
    <input
      defaultValue={coord.defaultValue}
      autoFocus
      className="absolute w-[100px] h-[26px]"
      style={{
        top: coord.x,
        left: coord.y,
      }}
      onBlur={(e) => {
        onUpdate(e.target.value);
      }}
    />
  );
};
