const blogPosts = [
  { id: 1, title: "IpHint: A company providing AI-based Intellectual Property (IP) image protection solutions." },
  { id: 2, title: "Startup 'IpHint' expands beyond copyright to 'counterfeit detection'... Simultaneous launch of a global ..." },
  { id: 3, title: "The global war against counterfeit goods: Use IpHint (iphint.com) to stay protected from copyright ... hunters." },
  { id: 4, title: "The global war against counterfeit goods: Use IpHint (iphint.com) to stay protected from copyright ..." },
];

export default function Section6() {
  return (
    <section className="py-20 bg-white px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">Blog</h2>
        <div className="border-t border-gray-100">
          {blogPosts.map((post) => (
            <a
              key={post.id}
              href="#"
              className="group flex items-center justify-between py-8 border-b border-gray-100 hover:bg-slate-50 transition-colors px-4"
            >
              <h3 className="text-lg font-semibold text-slate-900 pr-8 leading-snug">
                {post.title}
              </h3>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>

            </a>
          ))}
        </div>
      </div>
    </section>
  );
}