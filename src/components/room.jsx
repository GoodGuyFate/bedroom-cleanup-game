import "./room.css";
import { useState, useRef, useEffect } from "react";
import { furniture } from "../data/furniture";
import { layouts } from "../data/layouts";

const ROOM_WIDTH = 790;
const ROOM_HEIGHT = 590;

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

function randomPosition(itemWidth, itemHeight, roomWidth, roomHeight) {
  const maxX = roomWidth - itemWidth;
  const maxY = roomHeight - itemHeight;

  const x = Math.floor(Math.random() * (maxX + 1));
  const y = Math.floor(Math.random() * (maxY + 1));

  return { x, y };
}

function randomizeLayout(items, roomWidth, roomHeight) {
  const placed = [];

  for (const item of items) {
    let pos = randomPosition(item.width, item.height, roomWidth, roomHeight);

    while (
      placed.some((p) =>
        rectsOverlap(
          { curPos: pos, width: item.width, height: item.height },
          p,
        ),
      )
    ) {
      pos = randomPosition(item.width, item.height, roomWidth, roomHeight);
    }

    placed.push({ ...item, curPos: pos });
  }

  return placed;
}

function applyLayout(catalog, layout) {
  return catalog.map((item) => {
    return { ...item, targetPos: layout[item.id] };
  });
}

function generateRandomLayout() {
  const randomLayout = Math.floor(Math.random() * layouts.length);
  const chosenLayout = layouts[randomLayout];
  const itemsWithTargetPos = applyLayout(furniture, chosenLayout);
  return randomizeLayout(itemsWithTargetPos, ROOM_WIDTH, ROOM_HEIGHT);
}

export default function Room() {
  const [items, setItems] = useState(generateRandomLayout);
  // const [hasWon, setHasWon] = useState(false)
  const hasWon = allPlaced(items, 20);
  const offsets = useRef({ x: 0, y: 0 });
  const draggedId = useRef(null);
  const roomRef = useRef(null);
  const [topId, setTopId] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [count, setCount] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const localStorageHighScore = Number(
    localStorage.getItem("roomCleanerHighScore"),
  );
  const [highScore, setHighScore] = useState(() => {
    return localStorageHighScore;
  });

  useEffect(() => {
    if (phase !== "countdown") return;

    const intervalId = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          setPhase("playing");
          return 3;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") return;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          setPhase("ended");
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [phase]);

  useEffect(() => {
    localStorage.setItem("roomCleanerHighScore", highScore.toString());
  }, [highScore]);

  const handlePointerDown = (e, itemId) => {
    if (phase !== "playing") return;

    const rect = e.currentTarget.getBoundingClientRect();

    // console.log(rect);
    const xOffset = e.clientX - rect.left;
    const yOffset = e.clientY - rect.top;
    offsets.current.x = xOffset;
    offsets.current.y = yOffset;
    draggedId.current = itemId;
    setTopId(itemId);

    e.currentTarget.setPointerCapture(e.pointerId);
    // console.log(roomRef.current);
  };

  const handlePointerUp = () => {
    const draggingId = draggedId.current;
    const i = items.find((item) => item.id === draggingId);

    if (isCloseEnough(i.curPos, i.targetPos, 20)) {
      const newItems = items.map((item) => {
        if (item.id === draggingId) {
          return {
            ...item,
            curPos: { x: item.targetPos.x, y: item.targetPos.y },
          };
        }
        return item;
      });

      if (allPlaced(newItems, 20)) {
        const newScore = score + 1;
        setScore(newScore);
        if (newScore > highScore) {
          setHighScore(newScore);
        }
        setItems(generateRandomLayout());
      } else {
        setItems(newItems);
      }
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

  const handlePlayAgain = () => {
    setScore(0);
    setItems(generateRandomLayout());
    setPhase("countdown");
  };

  return (
    <>
      <div
        className="room"
        ref={roomRef}
        style={{ filter: phase === "playing" ? "none" : "blur(4px)" }}
      >
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
              zIndex: item.id === topId ? 1 : 0,
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

      {phase !== "playing" && (
        <div className="game-overlay">
          {phase === "idle" && (
            <div className="overlay-card">
              <div className="overlay-title">Room Cleaner</div>
              <p className="overlay-subtitle">
                Drag each piece of furniture onto its matching outline. Clear as
                many rooms as you can in 60 seconds!
              </p>
              <div className="overlay-stat">High Score: {highScore}</div>
              <button
                className="overlay-button"
                onClick={() => setPhase("countdown")}
              >
                Start
              </button>
            </div>
          )}

          {phase === "countdown" && (
            <div className="overlay-countdown">{count}</div>
          )}

          {phase === "ended" && (
            <div className="overlay-card">
              <div className="overlay-title">Time's Up!</div>
              <p className="overlay-subtitle">
                You cleared {score} room{score !== 1 ? "s" : ""}.
              </p>
              <div className="overlay-stat">High Score: {highScore}</div>
              <button className="overlay-button" onClick={handlePlayAgain}>
                Play Again
              </button>
            </div>
          )}
        </div>
      )}

      <div className="hud">
        <div>High Score: {highScore}</div>
        {(phase === "playing" || phase === "ended") && (
          <div>Score: {score}</div>
        )}
        {phase === "playing" && <div>Time: {timeLeft}</div>}
      </div>
    </>
  );
}
