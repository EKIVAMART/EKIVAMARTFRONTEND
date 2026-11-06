type StoreStat = {
  value: string;
  highlight: string;
  label: string;
};

const storeStats: StoreStat[] = [
  {
    value: "100",
    highlight: "+",
    label: "Vendor Partners",
  },
  {
    value: "3",
    highlight: "min",
    label: "Store setup time",
  },
  {
    value: "0",
    highlight: "₦",
    label: "Setup cost — start free",
  },
  {
    value: "24",
    highlight: "/7",
    label: "Orders, even while you sleep",
  },
];

export default function StoreStats() {
  return (
    <section className="w-full bg-[#228b22] py-10 text-white md:py-12">
      <div className="mx-auto grid w-[90%] grid-cols-2 items-center gap-x-4 gap-y-8 md:grid-cols-4 md:gap-8">
        {storeStats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center text-center"
          >
            <p className="text-3xl font-bold leading-none tracking-tight md:text-4xl">
              <span>{stat.value}</span>
              <span className="text-[#FFE500]">{stat.highlight}</span>
            </p>

            <p className="mt-2 text-xs leading-snug text-white md:text-sm">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}