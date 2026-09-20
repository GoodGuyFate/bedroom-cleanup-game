import "./room.css";
import { useState, useRef } from "react";

export default function Room() {
  const [pos, setPos] = useState({ x: 100, y: 100 });
  const offsets = useRef({ x: 0, y: 0 });
  const dragInProgress = useRef(false);
  const roomRef = useRef(null);

  const handlePointerDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    // console.log(rect);
    const xOffset = e.clientX - rect.left;
    const yOffset = e.clientY - rect.top;
    offsets.current.x = xOffset;
    offsets.current.y = yOffset;
    dragInProgress.current = true;

    e.currentTarget.setPointerCapture(e.pointerId)
    // console.log(roomRef.current);
  };

  const handlePointerUp = () => {
    // console.log(offsets.current);
    // console.log(dragInProgress.current);
    dragInProgress.current = false;
    // console.log(dragInProgress.current);
  };

  const handlePointerMove = (e) => {
    if (dragInProgress.current == false) {
      return;
    }

    const roomRect = roomRef.current.getBoundingClientRect();
    // console.log(roomRect);

    const newX = e.clientX - roomRect.left - offsets.current.x;
    const newY = e.clientY - roomRect.top - offsets.current.y;

    setPos({
      x: newX,
      y: newY,
    });
  };

  return (
    <div className="room" ref={roomRef}>
      room{" "}
      <div
        className="square"
        style={{ left: pos.x, top: pos.y }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerCancel={handlePointerUp}
      >
        square
      </div>
    </div>
  );
}
