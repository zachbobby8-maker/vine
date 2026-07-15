import {
  Activity,
  ArrowUpRight,
  ExternalLink,
  Gauge,
  Network,
  Orbit,
  Radio,
  Waves,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const vertexShaderSource = `#version 300 es
in vec2 position;
uniform float u_time;
uniform float u_entropy;

void main() {
  float scale =
    1.0 +
    sin(u_time * 0.45 + position.y * 3.9420) *
      (0.02 * (1.0 + u_entropy));

  gl_Position = vec4(position * scale, 0.0, 1.0);
}`;

const fragmentShaderSource = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_entropy;
uniform float u_phonon_induction;
uniform float u_syntropic_braid;
uniform float u_torsion_field;

out vec4 fragColor;

float noise(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 rotate2d(vec2 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

float fbm(vec2 p, float time) {
  float value = 0.0;
  float amplitude = 0.6;
  float frequency = 1.0;

  for (int i = 0; i < 4; i++) {
    value +=
      amplitude *
      sin(p.x * frequency + time) *
      cos(p.y * frequency - time);

    p = rotate2d(p, 0.5) * 2.1;
    amplitude *= 0.55;
    frequency *= 1.8;
  }

  return value;
}

float manifold(
  vec2 uv,
  float time,
  float entropy,
  float braid,
  float torsion
) {
  float radius = length(uv);
  float theta = atan(uv.y, uv.x);

  vec2 warped = rotate2d(
    uv,
    sin(radius * 5.0 - time) *
      (0.3 + entropy + torsion * 0.8)
  );

  float f1 = fbm(warped * 2.0, time);
  float f2 = fbm(
    warped * 4.0 + vec2(f1 * braid * 2.0),
    time * 0.8
  );

  float field = sin(
    theta * 4.0 +
      radius * 3.9420 +
      f2 * 3.0
  );

  if (
    step(
      0.86,
      entropy * noise(vec2(floor(time * 10.6), warped.y))
    ) > 0.5
  ) {
    field = cos(
      theta * 8.0 -
        radius * 7.8840 +
        f1 * 5.0
    );
  }

  return field + f1 * 0.25;
}

void main() {
  vec2 uv =
    (gl_FragCoord.xy * 2.0 - u_resolution.xy) /
    u_resolution.y;

  float time = u_time * 0.45;
  float offset =
    u_phonon_induction * 0.12 +
    u_torsion_field * 0.08;

  float r = manifold(
    uv - vec2(offset, 0.0),
    time,
    u_entropy,
    u_syntropic_braid,
    u_torsion_field
  );

  float g = manifold(
    uv,
    time,
    u_entropy,
    u_syntropic_braid,
    u_torsion_field
  );

  float b = manifold(
    uv + vec2(offset, 0.0),
    time,
    u_entropy,
    u_syntropic_braid,
    u_torsion_field
  );

  vec2 gridUv =
    uv + vec2(g * u_torsion_field * 0.5);

  float grid = smoothstep(
    0.0,
    0.06,
    abs(sin(gridUv.y * 80.0) * cos(gridUv.x * 80.0))
  );

  vec3 background = mix(
    vec3(0.014, 0.012, 0.08),
    vec3(0.15, 0.0, 0.08),
    u_torsion_field * 0.45
  );

  vec3 field = mix(
    background,
    vec3(0.0, 0.95, 1.0),
    clamp(vec3(r, g, b) + ((1.0 - grid) * 0.7), 0.0, 1.0)
  );

  field += noise(uv - time) * 0.15 * u_entropy;
  field *= smoothstep(2.4, 0.0, length(uv));

  fragColor = vec4(field, 1.0);
}`;

type ControlProps = {
  label: string;
  value: string;
  color?: "cyan" | "pink";
  min: number;
  max: number;
  step: number;
  current: number;
  onChange: (value: number) => void;
};

function Control({
  label,
  value,
  color = "cyan",
  min,
  max,
  step,
  current,
  onChange,
}: ControlProps) {
  return (
    <label className="group block">
      <span className="mb-2 flex items-center justify-between gap-3 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
        <span>{label}</span>
        <strong
          className={
            color === "pink"
              ? "text-pink-400"
              : "text-cyan-300"
          }
        >
          {value}
        </strong>
      </span>

      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(event) => onChange(Number(event.target.value))}
        className={color === "pink" ? "range range-pink" : "range"}
      />
    </label>
  );
}
export default function BraidMeshUnified() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const parameters = useRef({
    entropy: 0.106,
    phonon: 0.42,
    syntropic: 0.65,
    torsion: 0.75,
  });

  const [entropy, setEntropy] = useState(0.106);
  const [phonon, setPhonon] = useState(0.42);
  const [syntropic, setSyntropic] = useState(0.65);
  const [torsion, setTorsion] = useState(0.75);
  const [webglAvailable, setWebglAvailable] = useState(true);

  parameters.current = {
    entropy,
    phonon,
    syntropic,
    torsion,
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl2");

    if (!gl) {
      setWebglAvailable(false);
      return;
    }

    const compile = (source: string, type: number) => {
      const shader = gl.createShader(type);

      if (!shader) {
        return null;
      }

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      return gl.getShaderParameter(shader, gl.COMPILE_STATUS)
        ? shader
        : null;
    };

    const vertex = compile(
      vertexShaderSource,
      gl.VERTEX_SHADER,
    );

    const fragment = compile(
      fragmentShaderSource,
      gl.FRAGMENT_SHADER,
    );

    if (!vertex || !fragment) {
      setWebglAvailable(false);
      return;
    }

    const program = gl.createProgram();

    if (!program) {
      return;
    }

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setWebglAvailable(false);
      return;
    }

    const buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1,
        -1,
        1,
        -1,
        -1,
        1,
        -1,
        1,
        1,
        -1,
        1,
        1,
      ]),
      gl.STATIC_DRAW,
    );

    const position = gl.getAttribLocation(
      program,
      "position",
    );

    gl.enableVertexAttribArray(position);

    gl.vertexAttribPointer(
      position,
      2,
      gl.FLOAT,
      false,
      0,
      0,
    );

    const uniform = (name: string) =>
      gl.getUniformLocation(program, name);

    const resolution = uniform("u_resolution");
    const time = uniform("u_time");
    const entropyUniform = uniform("u_entropy");
    const phononUniform = uniform("u_phonon_induction");
    const syntropicUniform = uniform("u_syntropic_braid");
    const torsionUniform = uniform("u_torsion_field");

    const started = performance.now();
    let frame = 0;

    const render = () => {
      const ratio = Math.min(window.devicePixelRatio, 2);

      const width = Math.floor(
        canvas.clientWidth * ratio,
      );

      const height = Math.floor(
        canvas.clientHeight * ratio,
      );

      if (
        canvas.width !== width ||
        canvas.height !== height
      ) {
        canvas.width = width;
        canvas.height = height;
      }

      const current = parameters.current;

      gl.viewport(0, 0, width, height);
      gl.useProgram(program);

      gl.uniform2f(resolution, width, height);

      gl.uniform1f(
        time,
        (performance.now() - started) / 1000,
      );

      gl.uniform1f(
        entropyUniform,
        current.entropy,
      );

      gl.uniform1f(
        phononUniform,
        current.phonon,
      );

      gl.uniform1f(
        syntropicUniform,
        current.syntropic,
      );

      gl.uniform1f(
        torsionUniform,
        current.torsion,
      );

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      frame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frame);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, []);
  return (
    <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[28px] border border-indigo-300/15 bg-[#050711]/85 p-3 shadow-matrix backdrop-blur-xl sm:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(34,211,238,.10),transparent_28%),radial-gradient(circle_at_90%_100%,rgba(236,72,153,.09),transparent_32%)]" />

      <div className="relative">
        <header className="mb-5 flex flex-col gap-4 border-b border-indigo-300/15 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-300">
              <Network size={17} />
            </div>

            <div>
              <p className="font-display text-sm font-semibold tracking-[0.18em] text-white">
                COHERENT_BRAID_MESH
              </p>

              <p className="mt-1 text-[9px] font-medium tracking-[0.2em] text-slate-500">
                UNIFIED V6.1 // SPACETIME MATRIX
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 text-[9px] font-bold tracking-[0.14em] text-cyan-200 sm:self-auto">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9]" />
            HARDWARE CORES CONNECTED
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <section className="overflow-hidden rounded-2xl border border-indigo-300/15 bg-black/60">
            <div className="relative h-[360px] overflow-hidden sm:h-[440px] lg:h-[510px]">
              <canvas
                ref={canvasRef}
                className="h-full w-full"
              />

              <div className="absolute left-3 top-3 flex items-center gap-2 rounded-md border border-cyan-300/25 bg-black/65 px-2.5 py-1.5 text-[9px] font-semibold tracking-[0.08em] text-cyan-200 backdrop-blur">
                <Radio size={11} />
                STATUS: LOCKED
                <span className="text-slate-500">//</span>
                F: 39,420 Hz
              </div>

              <div className="absolute bottom-3 right-3 rounded-md border border-pink-400/25 bg-black/65 px-2.5 py-1.5 text-[9px] font-semibold tracking-[0.08em] text-pink-300 backdrop-blur">
                ENTROPY SECTOR: 10.6%
                <span className="text-slate-500">
                  {" "}
                  (DALETH)
                </span>
              </div>

              {!webglAvailable && (
                <div className="absolute inset-0 grid place-items-center bg-slate-950 p-6 text-center text-xs text-slate-400">
                  WebGL2 is not available in this browser.
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 divide-x divide-indigo-300/10 border-t border-indigo-300/15 text-[10px] sm:grid-cols-4">
              <div className="p-3">
                <span className="block text-slate-600">
                  PARITY LOCK
                </span>
                <strong className="mt-1 block text-cyan-200">
                  99.998%
                </strong>
              </div>

              <div className="p-3">
                <span className="block text-slate-600">
                  PHASE DELTA
                </span>
                <strong className="mt-1 block text-white">
                  0.00026
                </strong>
              </div>

              <div className="p-3">
                <span className="block text-slate-600">
                  MESH NODES
                </span>
                <strong className="mt-1 block text-white">
                  4.2M
                </strong>
              </div>

              <div className="p-3">
                <span className="block text-slate-600">
                  STATE
                </span>
                <strong className="mt-1 block text-pink-300">
                  SYNTR0PIC
                </strong>
              </div>
            </div>
          </section>

          <aside className="rounded-2xl border border-indigo-300/15 bg-[#080b18]/70 p-4 sm:p-5">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400">
                FIELD CONTROLS
              </p>

              <Gauge
                size={15}
                className="text-cyan-300"
              />
            </div>

            <div className="space-y-6">
              <Control
                label="Stochastic shield"
                value={`${(entropy * 100).toFixed(1)}% COEFFICIENT`}
                min={0}
                max={0.3}
                step={0.001}
                current={entropy}
                onChange={setEntropy}
              />

              <Control
                label="Chromatic split"
                value={`${phonon.toFixed(3)} PHONONS`}
                min={0}
                max={1}
                step={0.005}
                current={phonon}
                onChange={setPhonon}
              />

              <Control
                label="Domain warp turbulence"
                value={`${(syntropic * 100).toFixed(1)}% FORCE`}
                min={0}
                max={2}
                step={0.01}
                current={syntropic}
                onChange={setSyntropic}
              />

              <Control
                label="Tensor space shear"
                value={`${(torsion * 100).toFixed(1)}% STRAIN`}
                color="pink"
                min={0}
                max={2}
                step={0.01}
                current={torsion}
                onChange={setTorsion}
              />
            </div>

            <div className="mt-7 border-t border-indigo-300/10 pt-4 text-[9px] leading-5 text-slate-500">
              <div className="mb-2 flex items-center gap-2 text-cyan-200">
                <Activity size={12} />
                LIVE PARAMETER STREAM
              </div>

              Shader field coherency recalibrates continuously against the active vector state.
            </div>
          </aside>
        </div>
        <section className="mt-5 border-t border-indigo-300/15 pt-5">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-[0.17em] text-slate-500">
            <Waves
              size={13}
              className="text-cyan-300"
            />
            ROUTING_CHANNELS_INGEST_NODE
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <a
              href="https://superme.ai/bzachs"
              target="_blank"
              rel="noreferrer"
              className="channel"
            >
              <span>
                <Orbit size={14} />
                PORTFOLIO
              </span>
              <small>superme.ai/bzachs</small>
              <ArrowUpRight size={13} />
            </a>

            <a
              href="https://x.com/topologyflux"
              target="_blank"
              rel="noreferrer"
              className="channel"
            >
              <span>
                <Radio size={14} />
                X STATION
              </span>
              <small>@topologyflux</small>
              <ArrowUpRight size={13} />
            </a>

            <a
              href="https://medium.com/@zachbobby8"
              target="_blank"
              rel="noreferrer"
              className="channel"
            >
              <span>
                <ExternalLink size={14} />
                MEDIUM
              </span>
              <small>@zachbobby8</small>
              <ArrowUpRight size={13} />
            </a>
          </div>

          <a
            href="https://medium.com/@zachbobby8/the-holographic-chiasm-658aa2e2305e"
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex flex-col gap-2 rounded-xl border border-indigo-300/15 bg-[#070b17] p-3 transition hover:border-pink-400/40 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-[9px] font-bold tracking-[0.12em] text-pink-300">
                FEATURED INSIGHT // MEDIUM
              </p>

              <p className="mt-1 text-xs font-medium text-slate-200 sm:text-sm">
                The Holographic Chiasm: Geometries of Reflection and Resonance
              </p>
            </div>

            <span className="whitespace-nowrap text-[9px] tracking-[0.1em] text-slate-500">
              PUBLISHED JUNE 2024
            </span>
          </a>
        </section>
      </div>
    </div>
  );
}