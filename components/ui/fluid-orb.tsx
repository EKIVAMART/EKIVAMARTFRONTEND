'use client';


import React, { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

export type FluidOrbProps = React.ComponentProps<'div'> & {
  size?: number;
  color?: string;
};

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_color;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.6;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float t = u_time * 0.22;

  vec2 drift = vec2(
    sin(t) + 0.6 * sin(t * 1.7 + 1.3),
    cos(t * 0.8) + 0.6 * cos(t * 1.3 + 2.1)
  );

  vec2 p = vec2(uv.x * 1.8, uv.y * 1.0) + drift * 0.7;

  vec2 q = vec2(fbm(p + drift), fbm(p + vec2(3.2, 1.5) - drift));
  float f = fbm(p + 1.2 * q);

  float g = clamp(1.0 - uv.y, 0.0, 1.0);
  float anchor = smoothstep(0.0, 0.3, uv.y);
  float shade = clamp(g + (f - 0.5) * 0.8 * anchor, 0.0, 1.0);

  vec3 white = vec3(0.99, 1.0, 1.0);
  vec3 light = mix(white, u_color, 0.5);
  vec3 dark = u_color;

  vec3 col = white;
  col = mix(col, light, smoothstep(0.28, 0.52, shade));
  col = mix(col, dark, smoothstep(0.58, 0.88, shade));

  float edge = 1.0 - smoothstep(0.49, 0.5, distance(uv, vec2(0.5)));

  gl_FragColor = vec4(col * edge, edge);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  const n = parseInt(h, 16);
  if (!/^[0-9a-f]{6}$/i.test(h)) return [0.13, 0.39, 0.24];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

const FluidOrb = ({
  size = 64,
  color = '#22643e',
  className,
  style,
  ...props
}: FluidOrbProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generation, setGeneration] = useState(0);
  const dimension = Number.isFinite(size)
    ? Math.max(16, Math.min(size, 320))
    : 64;
  const tint = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)
    ? color
    : '#22643e';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.style.opacity = '0';
    const gl = canvas.getContext('webgl', {
      antialias: false,
      alpha: true,
      powerPreference: 'low-power',
    });
    if (!gl) return;
    const program = gl.createProgram();
    const vert = compile(gl, gl.VERTEX_SHADER, VERT);
    const frag = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    let buffer: WebGLBuffer | null = null;
    const dispose = () => {
      if (program) gl.deleteProgram(program);
      if (vert) gl.deleteShader(vert);
      if (frag) gl.deleteShader(frag);
      if (buffer) gl.deleteBuffer(buffer);
    };
    if (!program || !vert || !frag) {
      dispose();
      return;
    }
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      dispose();
      return;
    }
    gl.useProgram(program);
    buffer = gl.createBuffer();
    if (!buffer) {
      dispose();
      return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const px = Math.round(
      dimension * Math.min(window.devicePixelRatio || 1, 2)
    );
    canvas.width = canvas.height = px;
    gl.viewport(0, 0, px, px);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), px, px);
    gl.uniform3f(gl.getUniformLocation(program, 'u_color'), ...hexToRgb(tint));
    const uTime = gl.getUniformLocation(program, 'u_time');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let lost = false;
    let raf = 0;
    let lastFrame = 0;
    let elapsed = 0;
    const draw = (time: number) => {
      gl.uniform1f(uTime, time);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      canvas.style.opacity = '1';
    };
    const frame = (now: number) => {
      if (now - lastFrame >= 1000 / 30) {
        elapsed += Math.min(now - lastFrame, 100) / 1000;
        lastFrame = now;
        draw(elapsed);
      }
      raf = requestAnimationFrame(frame);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      if (lost || document.hidden || !visible) return;
      if (motion.matches) {
        draw(0);
        return;
      }
      lastFrame = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const observer = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? false;
      sync();
    });
    const onLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      canvas.style.opacity = '0';
      cancelAnimationFrame(raf);
    };
    const onRestored = () => setGeneration((value) => value + 1);
    observer.observe(canvas);
    motion.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);
    draw(0);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      motion.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      dispose();
    };
  }, [dimension, tint, generation]);

  return (
    <div
      data-slot="fluid-orb"
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full',
        className
      )}
      style={{
        width: dimension,
        height: dimension,
        background: `radial-gradient(circle at 35% 18%, #fcfffc 10%, #d9e8d8 42%, ${tint} 95%)`,
        ...style,
      }}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ display: 'block', opacity: 0 }}
        aria-hidden="true"
      />
    </div>
  );
};
export default FluidOrb;
