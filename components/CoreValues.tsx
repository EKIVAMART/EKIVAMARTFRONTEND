
import {
  Heart,
  ChartNoAxesColumnIncreasing,
  Blocks,
  GitCompareArrows,
  Sun,
  Workflow,
  type LucideIcon,
} from "lucide-react";

type CoreValue = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const coreValues: CoreValue[] = [
  {
    title: "Love for our customers",
    description:
      "Satisfied customers are essential to our success. There are no kings in Faflora, only servants of the customer.",
    icon: Heart,
  },
  {
    title: "Hardwork",
    description:
      "We embrace hard work. We understand that it is only through pushing ourselves beyond our limits of comfort that we become better.",
    icon: ChartNoAxesColumnIncreasing,
  },
  {
    title: "Teamwork & Sacrifice",
    description:
      "We work together, disregarding personal interests to meet the needs of our customers and build a stronger company.",
    icon: Blocks,
  },
  {
    title: "Honour & Integrity",
    description:
      "We are open, honest and trustworthy in all our dealings.",
    icon: GitCompareArrows,
  },
  {
    title: "Passion",
    description:
      "We are passionate about our brand and our mission.",
    icon: Sun,
  },
  {
    title: "Constant Evolution",
    description:
      "We always question the norm, looking for opportunities to birth new ideas. As individuals, we embrace flexibility and rapid change.",
    icon: Workflow,
  },
];

export default function CoreValues() {
  return (
    <section className="bg-[#FAF8FA] px-5 py-14 md:px-10 md:py-16 lg:px-16 lg:py-12">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#302C30] md:text-4xl lg:text-[42px]">
            Our Core Values
          </h2>

          <p className="mt-1 text-base leading-snug text-[#89808A] md:text-xl">
            Underpinning our vision are six core values. These six values,
            embedded across the Group, are the foundation of our corporate
            culture.
          </p>
        </div>

        {/* Core Values Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {coreValues.map((value) => {
            const Icon = value.icon;

            return (
              <article
                key={value.title}
                className="min-h-[200px] rounded-xl bg-[#F3F0F3] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md md:p-4"
              >
                {/* Icon */}
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-[#F2E8FC]">
                  <Icon
                    size={23}
                    strokeWidth={1.8}
                    className="text-[#8735C4]"
                    aria-hidden="true"
                  />
                </div>

                {/* Title */}
                <h3 className="mb-3 text-lg font-bold leading-tight tracking-tight text-[#211E22]">
                  {value.title}
                </h3>

                {/* Description */}
                <p className="text-[15px] leading-[1.35] text-[#514B53]">
                  {value.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
