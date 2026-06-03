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
    <section className="bg-white  px-4 md:px-32 mt-32 mb-32">
      <div className="max-w-4xl mx-auto text-center mb-10 md:mb-14 ">
        <h2 className="text-4xl md:text-4xl font-bold text-gray-900 mb-4">
        Find trusted tutors for your child's curriculum
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 items-center justify-items-center max-w-5xl mx-auto">
        {logos.map((logo) => (
          <div
            key={logo.name}
            className="flex h-24 w-full  items-center justify-center rounded-xl border border-gray-100 pt-14 transition-shadow hover:shadow-sm"
          >
            <img
              src={logo.src}
              alt={logo.alt}
              className="max-h-28 w-auto object-contain opacity-80 hover:opacity-100 transition-all duration-300"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustScore;
