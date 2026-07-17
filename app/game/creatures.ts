// Canvas draw routines for the submarine, creatures and structures.
// Everything is drawn procedurally so the game needs no image assets.
import type { Creature, Vec } from "./types";

export function drawSub(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: Vec,
) {
  const angle = Math.atan2(facing.y, facing.x);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Hull.
  ctx.fillStyle = "#e8eef2";
  ctx.strokeStyle = "#9fb3c0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 20, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cockpit dome.
  ctx.fillStyle = "rgba(120,220,255,0.85)";
  ctx.beginPath();
  ctx.arc(7, 0, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#bfe9ff";
  ctx.stroke();

  // Tail fin.
  ctx.fillStyle = "#c3d2db";
  ctx.beginPath();
  ctx.moveTo(-16, -8);
  ctx.lineTo(-26, -14);
  ctx.lineTo(-20, 0);
  ctx.lineTo(-26, 14);
  ctx.lineTo(-16, 8);
  ctx.closePath();
  ctx.fill();

  // Headlamp lens.
  ctx.fillStyle = "#fffbe0";
  ctx.beginPath();
  ctx.arc(18, 0, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Thruster bubbles trailing behind.
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 3; i++) {
    const bx = x - facing.x * (24 + i * 6) + (Math.random() - 0.5) * 4;
    const by = y - facing.y * (24 + i * 6) + (Math.random() - 0.5) * 4;
    ctx.fillStyle = `rgba(200,240,255,${0.18 - i * 0.05})`;
    ctx.beginPath();
    ctx.arc(bx, by, 2.5 - i * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawCreature(
  ctx: CanvasRenderingContext2D,
  c: Creature,
  x: number,
  y: number,
) {
  const s = c.def.size;
  const t = c.phase;
  ctx.save();
  ctx.translate(x, y);

  switch (c.def.id) {
    case "clownfish":
    case "lanternfish":
    case "anglerfish": {
      const dir = c.vel.x >= 0 ? 1 : -1;
      ctx.scale(dir, 1);
      ctx.fillStyle = c.def.glow;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.ellipse(0, 0, s, s * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      // Tail.
      ctx.beginPath();
      ctx.moveTo(-s, 0);
      ctx.lineTo(-s - s * 0.7, -s * 0.5);
      ctx.lineTo(-s - s * 0.7, s * 0.5);
      ctx.closePath();
      ctx.fill();
      // Eye.
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#05121c";
      ctx.beginPath();
      ctx.arc(s * 0.55, -s * 0.1, s * 0.14, 0, Math.PI * 2);
      ctx.fill();
      if (c.def.id === "anglerfish") {
        // Lure.
        ctx.strokeStyle = c.def.glow;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s * 0.8, -s * 0.3);
        ctx.quadraticCurveTo(s * 1.6, -s, s * 1.3, -s * 1.2);
        ctx.stroke();
        ctx.fillStyle = "#fff2b0";
        ctx.beginPath();
        ctx.arc(s * 1.3, -s * 1.2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "moonjelly":
    case "siphonophore": {
      const pulse = 1 + Math.sin(t) * 0.14;
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = c.def.glow;
      ctx.beginPath();
      ctx.ellipse(0, 0, s * pulse, s * 0.8 * pulse, 0, Math.PI, 0);
      ctx.fill();
      // Tentacles.
      ctx.strokeStyle = c.def.glow;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1.5;
      const strands = c.def.id === "siphonophore" ? 9 : 6;
      for (let i = 0; i < strands; i++) {
        const tx = (-s + (i / (strands - 1)) * 2 * s) * 0.8;
        ctx.beginPath();
        ctx.moveTo(tx, 0);
        ctx.quadraticCurveTo(
          tx + Math.sin(t + i) * 4,
          s * 1.4,
          tx + Math.sin(t + i) * 2,
          s * (c.def.id === "siphonophore" ? 3.2 : 2),
        );
        ctx.stroke();
      }
      break;
    }
    case "vampsquid":
    case "sentinel": {
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = c.def.glow;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(s * 0.9, -s * 0.4, s * 0.5, s * 0.7);
      ctx.quadraticCurveTo(0, s * 0.4, -s * 0.5, s * 0.7);
      ctx.quadraticCurveTo(-s * 0.9, -s * 0.4, 0, -s);
      ctx.fill();
      // Arms / spines.
      ctx.strokeStyle = c.def.glow;
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 2;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * s * 0.22, s * 0.5);
        ctx.quadraticCurveTo(
          i * s * 0.4 + Math.sin(t + i) * 3,
          s * 1.2,
          i * s * 0.3,
          s * 1.7,
        );
        ctx.stroke();
      }
      // Eyes.
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#eaffff";
      ctx.beginPath();
      ctx.arc(-s * 0.25, -s * 0.15, s * 0.1, 0, Math.PI * 2);
      ctx.arc(s * 0.25, -s * 0.15, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "greenturtle": {
      ctx.fillStyle = c.def.glow;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.ellipse(0, 0, s, s * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
      // Shell segments.
      ctx.strokeStyle = "rgba(10,40,20,0.5)";
      ctx.lineWidth = 1.5;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.arc(i * s * 0.4, 0, s * 0.35, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Head + flippers.
      ctx.fillStyle = c.def.glow;
      ctx.beginPath();
      ctx.arc(s, 0, s * 0.28, 0, Math.PI * 2);
      ctx.ellipse(-s * 0.4, -s * 0.7, s * 0.4, s * 0.2, -0.6, 0, Math.PI * 2);
      ctx.ellipse(-s * 0.4, s * 0.7, s * 0.4, s * 0.2, 0.6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    default: {
      ctx.fillStyle = c.def.glow;
      ctx.beginPath();
      ctx.arc(0, 0, s, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export function drawLog(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
) {
  const bob = Math.sin(time * 1.5) * 3;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 26);
  g.addColorStop(0, "rgba(120,255,220,0.9)");
  g.addColorStop(1, "rgba(120,255,220,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  // Spiral glyph — the recurring motif.
  ctx.strokeStyle = "#c8fff0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 4; a += 0.2) {
    const r = a * 1.4;
    const px = Math.cos(a + time) * r;
    const py = Math.sin(a + time) * r;
    if (a === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
}

export function drawCoral(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  progress: number,
) {
  ctx.save();
  ctx.translate(x, y);
  const alpha = 1 - progress * 0.7;
  ctx.globalAlpha = alpha;
  const branches = 6;
  ctx.strokeStyle = "#ff7ba8";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  for (let i = 0; i < branches; i++) {
    const a = -Math.PI / 2 + (i - branches / 2) * 0.4;
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.quadraticCurveTo(
      Math.cos(a) * 20,
      Math.sin(a) * 20,
      Math.cos(a) * 40,
      Math.sin(a) * 40 + 10,
    );
    ctx.stroke();
  }
  ctx.strokeStyle = "#ffd0e0";
  ctx.lineWidth = 2;
  for (let i = 0; i < branches; i++) {
    const a = -Math.PI / 2 + (i - branches / 2) * 0.4;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 40, Math.sin(a) * 40 + 10, 4, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (progress > 0) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(150,255,200,0.9)";
    ctx.font = "10px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillText(`${Math.round(progress * 100)}%`, 0, -30);
  }
  ctx.restore();
}

export function drawDoor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  opened: boolean,
) {
  ctx.save();
  ctx.translate(x, y);
  // Ancient stone frame.
  ctx.fillStyle = opened ? "#0a2030" : "#132436";
  ctx.strokeStyle = "#2f5670";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.rect(-70, -110, 140, 150);
  ctx.fill();
  ctx.stroke();

  if (opened) {
    // Glowing threshold into the city.
    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createRadialGradient(0, -30, 5, 0, -30, 90);
    g.addColorStop(0, "rgba(120,255,230,0.9)");
    g.addColorStop(1, "rgba(120,255,230,0)");
    ctx.fillStyle = g;
    ctx.fillRect(-60, -100, 120, 130);
  } else {
    // Sealed door leaves with the spiral sigil.
    ctx.fillStyle = "#0c1a28";
    ctx.fillRect(-56, -96, 112, 128);
    ctx.strokeStyle = "#4aa0c0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 5; a += 0.2) {
      const r = a * 3.2;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r - 32;
      if (a === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}
