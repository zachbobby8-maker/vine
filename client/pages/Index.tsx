import BraidMeshUnified from "@/components/BraidMeshUnified";

export default function Index() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#02030a] px-3 py-5 sm:px-6 sm:py-8 lg:px-10 lg:py-12">
      <div className="mx-auto mb-7 max-w-7xl text-center sm:mb-10">
        <p className="mb-3 text-[10px] font-bold tracking-[0.3em] text-cyan-300/80">
          5IR COMPUTATIONAL TOPOLOGY LAB
        </p>

        <h1 className="font-display text-3xl font-semibold tracking-[-0.045em] text-white sm:text-5xl">
          The space between{" "}
          <span className="text-cyan-300">signal</span> and structure.
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-400">
          A live instrument panel for monitoring coherent braid fields,
          stochastic forces, and the active geometry of resonance.
        </p>
      </div>

      <BraidMeshUnified />

      <p className="mx-auto mt-5 max-w-7xl text-center text-[9px] font-medium tracking-[0.16em] text-slate-600">
        5IR MATRIX INTERFACE // GPU PARALLEL VECTOR EXECUTION
      </p>
    </main>
  );
}