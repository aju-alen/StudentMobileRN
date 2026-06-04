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

const TrustScore = () => {
  return (
    <section className="home-section home-section-spacing bg-white">
      <div className="home-section-inner">
        <h2 className="home-section-title text-gray-900 text-3xl sm:text-4xl md:text-5xl !mb-6 sm:!mb-8 md:!mb-10 leading-tight px-1 sm:px-0">
          Find trusted tutors for your child's curriculum
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-12 items-center justify-items-center max-w-5xl mx-auto w-full">
        {logos.map((logo) => (
          <div
            key={logo.name}
            className="flex h-20 sm:h-24 w-full min-w-0 items-center justify-center rounded-lg sm:rounded-xl border border-gray-100 p-2.5 sm:p-4 transition-shadow hover:shadow-sm"
          >
            <img
              src={logo.src}
              alt={logo.alt}
              className="max-h-14 sm:max-h-20 md:max-h-28 w-full max-w-full object-contain opacity-80 hover:opacity-100 transition-all duration-300"
            />
          </div>
        ))}
        </div>
      </div>
    </section>
  );
};

export default TrustScore;
