import "./room.css";
import { useState, useRef } from "react";

const furniture = [
  {
    id: 1,
    name: "bed",
    width: 200,
    height: 100,
    color: "blue",
    curPos: { x: 100, y: 100 },
    targetPos: { x: 300, y: 300 },
  },
  {
    id: 2,
    name: "desk",
    width: 100,
    height: 50,
    color: "red",
    curPos: { x: 50, y: 50 },
    targetPos: { x: 150, y: 150 },
  },
  {
    id: 3,
    name: "lamp",
    width: 50,
    height: 50,
    color: "brown",
    curPos: { x: 10, y: 120 },
    targetPos: { x: 120, y: 10 },
  },
];

export default function Room() {
  const [items, setItems] = useState(furniture);
  const offsets = useRef({ x: 0, y: 0 });
  const draggedId = useRef(null);
  const roomRef = useRef(null);

  const handlePointerDown = (e, itemId) => {
    const rect = e.currentTarget.getBoundingClientRect();

    // console.log(rect);
    const xOffset = e.clientX - rect.left;
    const yOffset = e.clientY - rect.top;
    offsets.current.x = xOffset;
    offsets.current.y = yOffset;
    draggedId.current = itemId;

    e.currentTarget.setPointerCapture(e.pointerId);
    // console.log(roomRef.current);
  };

  const handlePointerUp = () => {
    // console.log(offsets.current);
    // console.log(dragInProgress.current);
    draggedId.current = null;
    // console.log(dragInProgress.current);
  };

  const handlePointerMove = (e) => {
    if (draggedId.current == null) {
      return;
    }

    const roomRect = roomRef.current.getBoundingClientRect();
    // console.log(roomRect);

    const newX =
      e.clientX -
      roomRect.left -
      roomRef.current.clientLeft -
      offsets.current.x;
    const newY =
      e.clientY - roomRect.top - roomRef.current.clientTop - offsets.current.y;

    const maxX = roomRef.current.clientWidth - e.currentTarget.offsetWidth;
    const maxY = roomRef.current.clientHeight - e.currentTarget.offsetHeight;
    const clampedX = Math.min(Math.max(newX, 0), maxX);
    const clampedY = Math.min(Math.max(newY, 0), maxY);
    const draggingId = draggedId.current;

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === draggingId) {
          return { ...item, curPos: { x: clampedX, y: clampedY } };
        }
        return item;
      }),
    );
  };

  return (
    <div className="room" ref={roomRef}>
      room{" "}
      {items.map((item) => (
        <div
          key={item.id}
          className="target-outline"
          style={{
            left: item.targetPos.x,
            top: item.targetPos.y,
            width: item.width,
            height: item.height,
          }}
        >
        </div>
      ))}
      {items.map((item) => (
        <div
          key={item.id}
          className="furniture-item"
          style={{
            left: item.curPos.x,
            top: item.curPos.y,
            width: item.width,
            height: item.height,
            backgroundColor: item.color,
          }}
          onPointerDown={(e) => handlePointerDown(e, item.id)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
}
