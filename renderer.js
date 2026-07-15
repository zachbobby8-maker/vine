import { FRAGMENT_SHADER_SOURCE, VERTEX_SHADER_SOURCE } from './shader.js';

export function createRenderer(canvas, getState, onStatus) {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false });
  if (!gl) {
    onStatus('unsupported');
    return { start() {}, stop() {}, setPaused() {} };
  }

  const vertexShader = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
  const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
  if (!vertexShader || !fragmentShader) {
    onStatus('error');
    return { start() {}, stop() {}, setPaused() {} };
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    onStatus('error');
    return { start() {}, stop() {}, setPaused() {} };
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uniforms = Object.fromEntries(['u_resolution', 'u_time', 'u_entropy', 'u_phonon_induction', 'u_syntropic_braid', 'u_torsion_field', 'u_theme'].map((name) => [name, gl.getUniformLocation(program, name)]));

  let animationId = 0;
  let startTime = performance.now();
  let paused = false;
  let frozenTime = 0;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
    const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
  }

  function render(now) {
    resize();
    const state = getState();
    const elapsed = paused ? frozenTime : (now - startTime) * 0.001;
    if (!paused) frozenTime = elapsed;
    gl.useProgram(program);
    gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.u_time, elapsed);
    gl.uniform1f(uniforms.u_entropy, state.entropy);
    gl.uniform1f(uniforms.u_phonon_induction, state.phonon);
    gl.uniform1f(uniforms.u_syntropic_braid, state.syntropic);
    gl.uniform1f(uniforms.u_torsion_field, state.torsion);
    gl.uniform1f(uniforms.u_theme, state.theme === 'white' ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    animationId = requestAnimationFrame(render);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  onStatus('ready');
  return {
    start() { animationId = requestAnimationFrame(render); },
    stop() { cancelAnimationFrame(animationId); resizeObserver.disconnect(); gl.deleteBuffer(buffer); gl.deleteProgram(program); },
    setPaused(value) {
      if (paused && !value) startTime = performance.now() - frozenTime * 1000;
      paused = value;
    },
  };
}

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}