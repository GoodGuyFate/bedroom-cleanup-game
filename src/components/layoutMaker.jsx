import { useState, useRef } from "react";
import { furniture } from "../data/furniture";

const ROOM_WIDTH = 790;
const ROOM_HEIGHT = 590;

// Starting spot for every item when you open the maker — doesn't matter where,
// you're about to drag them all anyway.
function startingItems() {
  return furniture.map((item) => ({
    ...item,
    curPos: { x: 20, y: 20 },
  }));
}

export default function LayoutMaker() {
  const [items, setItems] = useState(startingItems);
  const [copied, setCopied] = useState(false);
  const offsets = useRef({ x: 0, y: 0 });
  const draggedId = useRef(null);
  const roomRef = useRef(null);
  const [topId, setTopId] = useState(null);

  const handlePointerDown = (e, itemId) => {
    const rect = e.currentTarget.getBoundingClientRect();
    offsets.current.x = e.clientX - rect.left;
    offsets.current.y = e.clientY - rect.top;
    draggedId.current = itemId;
    setTopId(itemId);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerUp = () => {
    draggedId.current = null;
  };

  const handlePointerMove = (e) => {
    if (draggedId.current == null) return;

    const roomRect = roomRef.current.getBoundingClientRect();
    const newX =
      e.clientX - roomRect.left - roomRef.current.clientLeft - offsets.current.x;
    const newY =
      e.clientY - roomRect.top - roomRef.current.clientTop - offsets.current.y;

    const maxX = roomRef.current.clientWidth - e.currentTarget.offsetWidth;
    const maxY = roomRef.current.clientHeight - e.currentTarget.offsetHeight;
    const clampedX = Math.min(Math.max(newX, 0), maxX);
    const clampedY = Math.min(Math.max(newY, 0), maxY);
    const draggingId = draggedId.current;

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === draggingId
          ? { ...item, curPos: { x: clampedX, y: clampedY } }
          : item,
      ),
    );
  };

  // Turns current positions into the exact { id: {x, y} } shape layouts.js expects.
  function buildLayoutObject() {
    const layout = {};
    items.forEach((item) => {
      layout[item.id] = { x: item.curPos.x, y: item.curPos.y };
    });
    return layout;
  }

  function handleExport() {
    const layout = buildLayoutObject();
    const text = JSON.stringify(layout, null, 2);
    console.log(text);

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        // Clipboard can fail (permissions, non-https, etc). Console.log above
        // still has it either way.
        console.warn("Couldn't copy automatically — grab it from the console log above.");
      });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button onClick={handleExport}>Export Layout</button>
        <button onClick={() => setItems(startingItems())}>Reset Positions</button>
        {copied && <span>Copied to clipboard ✓</span>}
      </div>

      <div className="room" ref={roomRef} style={{ width: ROOM_WIDTH, height: ROOM_HEIGHT }}>
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
              zIndex: item.id === topId ? 1 : 0,
              cursor: "grab",
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
    </div>
  );
}