export default function Section8() {
  return (
    <section className="py-12 px-6">
      <div className=" flex flex-1 max-w-7xl mx-auto bg-slate-100 rounded-[40px] py-16 px-10 md:px-20 flex flex-col md:flex-row items-center justify-between gap-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center md:text-left">
          Start monitoring with <span className="font-extrabold">IpHint</span>
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button className="bg-black text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95">
            Start Now
          </button>
          <button className="bg-white text-black border border-gray-200 px-10 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  );
}