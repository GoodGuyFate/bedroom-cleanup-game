import "./room.css";
import { useState, useRef } from "react";

export default function Room() {
  const [pos, setPos] = useState({ x: 100, y: 100 });
  const offsets = useRef({x: 0, y: 0})
  const dragInProgress = useRef(false)

  const handlePointerDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    console.log(rect);
    const xOffset = e.clientX - rect.left;
    const yOffset = e.clientY - rect.top;
    offsets.current.x = xOffset
    offsets.current.y = yOffset
    dragInProgress.current = true
    
  };

  const handlePointerUp = (e) => {
    console.log(offsets.current)
    console.log(dragInProgress.current)
    dragInProgress.current = false
    console.log(dragInProgress.current)
    
  };


  return (
    <div className="room">
      room{" "}
      <div
        className="square"
        style={{ left: pos.x, top: pos.y }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        square
      </div>
    </div>
  );
}
