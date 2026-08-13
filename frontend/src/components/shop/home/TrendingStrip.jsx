export default function TrendingStrip({ products = [] }) {
  if (!products.length) return null;

  const items = [...products, ...products];

  return (
    <div className="relative z-10 mt-1">
      <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide text-stone-400 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 live-dot" />
        Tendance en ce moment
      </div>
      <div className="overflow-hidden">
        <div className="flex gap-3 vitrine-track w-max">
          {items.map((p, i) => {
            const mainImage =
              p.images?.find((img) => img.isMain)?.url || p.images?.[0]?.url;
            return (
              <div
                key={`${p.id}-${i}`}
                className="w-14 h-14 rounded-2xl border-2 border-white shadow-md shrink-0 overflow-hidden bg-rose-100 flex items-center justify-center"
              >
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={p.name || ""}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl">🛍️</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
