import "./room.css";
import { useState, useRef } from "react";

export default function Room() {
  const [pos, setPos] = useState({x: 100, y: 100})

  const handlePointerDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()

    console.log(rect)
    console.log(e.clientX)
    console.log(e.clientY)
    const xOffset = e.clientX - rect.left
    const yOffset = e.clientY - rect.top
    console.log(xOffset, yOffset)
    
  }

  

  return (
    <div className="room">
      room <div className="square" style={{left: pos.x, top: pos.y}} onPointerDown={handlePointerDown}>square</div>
    </div>
  );

  
}
