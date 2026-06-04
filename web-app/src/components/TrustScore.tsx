import aLevelLogo from '../assets/ALevel.svg.png';
import cbseLogo from '../assets/CBSE_new_logo.svg.png';
import igcseLogo from '../assets/IGCSE_cover.png';
import ibLogo from '../assets/International_Baccalaureate_Logo.svg.png';

const logos = [
  { name: 'IGCSE', src: igcseLogo, alt: 'IGCSE curriculum logo' },
  { name: 'International Baccalaureate', src: ibLogo, alt: 'IB curriculum logo' },
  { name: 'A-Level', src: aLevelLogo, alt: 'A-Level curriculum logo' },
  { name: 'CBSE', src: cbseLogo, alt: 'CBSE curriculum logo' },
];

type Logo = (typeof logos)[number];

const LogoCard = ({ logo }: { logo: Logo }) => (
  <div className="flex h-24 md:h-24 w-full min-w-0 items-center justify-center p-3 sm:p-4">
    <img
      src={logo.src}
      alt={logo.alt}
      className="max-h-16 sm:max-h-20 md:max-h-28 w-full max-w-full object-contain opacity-80 hover:opacity-100 transition-all duration-300"
    />
  </div>
);

const logoPairs = [
  logos.slice(0, 2),
  logos.slice(2, 4),
];

const TrustScore = () => {
  return (
    <section className="home-section home-section-spacing bg-white">
      <div className="home-section-inner">
        <h2 className="home-section-title text-gray-900 text-3xl sm:text-4xl md:text-5xl leading-tight px-1 sm:px-0">
          Find trusted tutors for your child's curriculum
        </h2>

        <div className="pt-10 sm:pt-12 md:pt-14">
        {/* Desktop: 4 logos */}
        <div className="hidden md:grid md:grid-cols-4 gap-6 md:gap-8 lg:gap-12 items-center justify-items-center max-w-5xl mx-auto w-full">
          {logos.map((logo) => (
            <LogoCard key={logo.name} logo={logo} />
          ))}
        </div>

        {/* Mobile: swipe carousel */}
        <div className="md:hidden -mx-4 px-4">
          <div
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Curriculum logos carousel"
          >
            {logoPairs.map((pair, index) => (
              <div
                key={index}
                className="w-[88vw] max-w-md flex-shrink-0 snap-center grid grid-cols-2 gap-3"
              >
                {pair.map((logo) => (
                  <LogoCard key={logo.name} logo={logo} />
                ))}
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </section>
  );
};

export default TrustScore;
