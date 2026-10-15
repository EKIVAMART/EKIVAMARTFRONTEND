import Image from "next/image";

type TeamMember = {
  id: number;
  name: string;
  role: string;
  image: string;
};

const team: TeamMember[] = [
  { id: 1, name: "Oghenefego Oghenekohworo", role: "Found", image: "/team/founder.jpg" },
  { id: 2, name: "Oghenefego Oghenekohworo", role: "Founder", image: "/team/founder.jpg" },
  { id: 3, name: "Oghenefego Oghenekohworo", role: "Founder", image: "/team/founder.jpg" },
  { id: 4, name: "Oghenefego Oghenekohworo", role: "Founder", image: "/team/founder.jpg" },
  { id: 5, name: "Oghenefego Oghenekohworo", role: "Founder", image: "/team/founder.jpg" },
];

function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="relative aspect-[298/284] w-full overflow-hidden rounded-lg">
      <Image
        src={member.image}
        alt={member.name}
        fill
        sizes="(min-width: 1024px) 298px, (min-width: 640px) 33vw, 50vw"
        className="object-cover object-top"
      />

      <div className="absolute inset-x-0 bottom-0 flex flex-col justify-center gap-0.5 bg-gradient-to-tr from-[#2b2457] via-[#a3a1da] to-[#aeacdf] px-3 py-3 backdrop-blur-md">
        <h3 className="truncate text-lg font-medium leading-tight text-white">
          {member.name}
        </h3>
        <p className="text-sm italic leading-tight text-[#f4ff3a]">{member.role}</p>
      </div>
    </article>
  );
}

export default function MeetTheTeam() {
  return (
    <section className="bg-[#fafafa] px-6 py-12 md:px-12 lg:px-[85px]">
      <div className="mx-auto flex max-w-[1272px] flex-col gap-10 lg:flex-row lg:gap-[52px]">
        {/* Intro */}
        <div className="shrink-0 lg:w-[262px]">
          <h2 className="text-[40px] font-extrabold leading-[0.95] tracking-tight text-[#2b2929]">
            Meet The
            <br />
            Team
          </h2>
          <p className="mt-4 text-lg leading-[1.4] tracking-tight text-[#8b8794]">
            Underpinning our vision are six core values. These six values,
            embedded across the Group, are the foundation of our corporate
            culture.
          </p>
        </div>

        {/* Grid */}
        <div className="grid flex-1 grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {team.map((member) => (
            <TeamCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}