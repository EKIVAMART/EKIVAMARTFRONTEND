export default function VisionMission() {
  return (
    <section className="flex min-h-[240px] w-full items-center bg-[#228b22] py-10 text-white md:min-h-[280px] lg:min-h-[300px]">
      <div className="mx-auto grid w-[90%] grid-cols-1 items-center gap-7 md:grid-cols-2 md:gap-16 lg:gap-24">
        {/* Vision */}
        <div>
          <p className="text-2xl leading-tight tracking-tight md:text-3xl lg:text-[32px]">
            <span className="font-bold">Our Vision</span>{" "}
            <span className="font-normal">
              is to be the engine of commerce and trade in Africa.
            </span>
          </p>
        </div>

        {/* Mission */}
        <div>
          <p className="text-base leading-snug md:text-lg">
            <span className="font-bold">Our Mission</span>{" "}
            <span className="font-normal">
              is to create a trusted and vibrant retail ecosystem that
              facilitates trade across Africa - connecting millions of
              buyers and sellers while empowering everyone to grow, thrive,
              and succeed.
            </span>
          </p>

          <p className="mt-5 text-base leading-snug md:text-lg">
            To achieve this, we are committed to enabling buyers, sellers,
            and businesses to access best priced products, transact from
            anywhere, and grow their business with ease.
          </p>
        </div>
      </div>
    </section>
  );
}