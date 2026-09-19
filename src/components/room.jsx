import "./room.css";
import { useState } from "react";

export default function Room() {
  const [pos, setPos] = useState({x: 100, y: 100})

  return (
    <div className="room">
      room <div className="square" style={{left: pos.x, top: pos.y}}>square</div>
    </div>
  );
}
