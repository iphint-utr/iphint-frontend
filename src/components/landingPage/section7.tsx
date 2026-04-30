const pressArticles = [
  { id: 1, source: "The New York Times", title: "Global war against counterfeit goods: Use IpHint (iphint.com) to ..." },
  { id: 2, source: "The New York Times", title: "Global war against counterfeit goods: Use ImgMov (iphint.com) to ..." },
  { id: 3, source: "The New York Times", title: "Global war against counterfeit goods: Use IpHint (iphint.com) to ..." },
];

export default function PressSection() {
  return (
    <section className="py-20 bg-white px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">Press</h2>
        <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4 hide-scrollbar">
          {pressArticles.map((article, idx) => (
            <div 
              key={article.id}
              className={`min-w-[300px] flex-1 p-8 rounded-3xl border-2 transition-all ${
                idx === 0 ? "border-black" : "border-gray-100 bg-white"
              }`}
            >
              <h3 className="text-xl font-bold mb-6 leading-tight">
                {article.title}
              </h3>
              <p className="text-sm font-medium text-slate-600">
                {article.source}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}