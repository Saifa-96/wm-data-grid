"use client";

import { useEffect, useRef, useState } from "react";
import init, * as core from "core-wasm";

export function Editor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<core.DataGrid | null>(null);
  const initialized = useRef(false);
  const [pos, setPos] = useState<core.Cell | null>(null);

  useEffect(() => {
    if (initialized.current) return;
    init({}).then(() => {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx && canvasRef.current) {
        ctx.clearRect(
          0,
          0,
          canvasRef.current?.width,
          canvasRef.current?.height
        );
        ctx.strokeStyle = "rgba(0, 0, 0, .2)";
        const instance = new core.DataGrid();
        instanceRef.current = instance;
        const cells: core.Cell[] = instance.get_cells();
        const renderCell = (cell: core.Cell) => {
          ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);
        };
        cells.forEach(renderCell);
        initialized.current = true;
      }
    });

    return () => {
      instanceRef.current?.free()
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      switch (event.key) {
        case "ArrowUp":
          instanceRef.current?.move_selected_cell(core.Direction.UP);
          break;
        case "ArrowDown":
          instanceRef.current?.move_selected_cell(core.Direction.DOWN);
          break;
        case "ArrowLeft":
          instanceRef.current?.move_selected_cell(core.Direction.LEFT);
          break;
        case "ArrowRight":
          instanceRef.current?.move_selected_cell(core.Direction.RIGHT);
          break;
        default:
          return;
      }
      setPos(instanceRef.current?.get_cell());
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="relative">
      {pos !== null && (
        <div
          className="absolute border-sky-600 border-2"
          style={{
            width: (pos.width ?? 0) + 2,
            height: (pos.height ?? 0) + 2,
            left: (pos.x ?? 0) - 1,
            top: (pos.y ?? 0) - 1,
          }}
        />
      )}
      <canvas width={1200} height={1700} ref={canvasRef} />
    </div>
  );
}
