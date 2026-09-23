import "./room.css";
import { useState, useRef } from "react";
import { furniture } from "../data/furniture";

function isCloseEnough(posA, posB, tolerance) {
  return (
    Math.abs(posA.x - posB.x) <= tolerance &&
    Math.abs(posA.y - posB.y) <= tolerance
  );
}

function allPlaced(items, tolerance) {
  return items.every((item) =>
    isCloseEnough(item.curPos, item.targetPos, tolerance),
  );
}

function rectsOverlap(itemA, itemB) {
  const aLeft = itemA.curPos.x;
  const aRight = itemA.curPos.x + itemA.width;
  const aTop = itemA.curPos.y;
  const aBottom = itemA.curPos.y + itemA.height;

  const bLeft = itemB.curPos.x;
  const bRight = itemB.curPos.x + itemB.width;
  const bTop = itemB.curPos.y;
  const bBottom = itemB.curPos.y + itemB.height;

  const xOverlap = aLeft < bRight && aRight > bLeft;
  const yOverlap = aTop < bBottom && aBottom > bTop;

  return xOverlap && yOverlap;
}

export default function Room() {
  const [items, setItems] = useState(furniture);
  // const [hasWon, setHasWon] = useState(false)
  const hasWon = allPlaced(items, 20);
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
    const draggingId = draggedId.current;
    const i = items.find((item) => item.id === draggingId);
    if (isCloseEnough(i.curPos, i.targetPos, 20)) {
      setItems((prevItems) => {
        const newItems = prevItems.map((item) => {
          if (item.id === draggingId) {
            return {
              ...item,
              curPos: { x: item.targetPos.x, y: item.targetPos.y },
            };
          }
          return item;
        });
        // if (allPlaced(newItems, 20)) {
        //   setHasWon(true);
        // }
        return newItems;
      });
    }
    draggedId.current = null;
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
        ></div>
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
      {hasWon && <div className="win-message">You win!</div>}
    </div>
  );
}
