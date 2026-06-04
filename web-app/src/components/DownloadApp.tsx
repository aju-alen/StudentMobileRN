import downloadCoachAcademGoogle from '../assets/download_coach_android.svg';
import downloadCoachAcademAppStore from '../assets/download_coach_apple.svg';
const APP_STORE_URL =
  'https://apps.apple.com/in/app/coach-academ/id6745173635';
const PLAY_STORE_URL = '#download-play-store';

const storeButtons = [
  {
    img: downloadCoachAcademAppStore,
    label: 'App Store',
    href: APP_STORE_URL,
    iconAlt: 'App Store',
  },
  {
    img: downloadCoachAcademGoogle,
    label: 'Google Play',
    href: PLAY_STORE_URL,
    iconAlt: 'Google Play Store',
  },
];

const DownloadApp = () => {
  return (
    <section className="home-section-spacing max-md:!py-12 max-md:min-h-0 md:min-h-[40rem] bg-gradient-to-r from-indigo-600 to-blue-700 text-white relative overflow-hidden">
      <div className="home-section !py-0 relative z-10 h-full flex items-center max-md:items-stretch">
        <div className="home-section-inner h-full flex items-center max-md:py-6">
          <div className="max-w-4xl mx-auto lg:mx-0 lg:max-w-2xl text-center lg:text-left home-section-stack max-md:gap-6">
          <div className="max-md:px-1">
          <h2 className="home-section-title lg:text-left leading-tight max-md:text-3xl max-md:!mb-4">
          CoachAcadem in your pocket
          </h2>
          <p className="home-section-lead text-indigo-100 lg:text-left md:pr-8 max-md:text-lg max-md:!-mt-2 max-md:!mb-6 max-md:leading-relaxed">
          Search tutors, manage bookings, communicate with tutors and continue learning from one platform.
          </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-5 md:gap-6 max-md:items-center max-md:gap-4">
            {storeButtons.map((store) => (
              <a
                key={store.label}
                href={store.href}
                target={store.href.startsWith('http') ? '_blank' : undefined}
                rel={
                  store.href.startsWith('http')
                    ? 'noopener noreferrer'
                    : undefined
                }
                className="inline-block transition-transform hover:scale-105 max-md:flex max-md:justify-center"
              >
                <img
                  src={store.img}
                  alt={store.label}
                  className="h-12 sm:h-14 md:h-16 lg:h-[4.5rem] w-auto max-md:h-11"
                />
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-2 text-[1.5rem] max-md:text-base max-md:gap-1.5 max-md:leading-snug">
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start">Made in the UAE</div>
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start">For your child's convenience.</div>
          </div>
          </div>
        </div>
      </div>

      <div
        className="hidden md:block absolute inset-y-0 right-0 w-[46%] lg:w-[42%] overflow-hidden pointer-events-none"
        aria-hidden
      >
        <img
          src="https://coachacademic.s3.ap-southeast-1.amazonaws.com/dummy-image/hero-screenshot-left.png"
          alt=""
          className="absolute bottom-0  h-[135%] lg:h-[255%] w-auto max-w-none object-contain object-bottom select-none opacity-95 top-[1%]"
        />
      </div>

      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-white opacity-5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-white opacity-5 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />
    </section>

  );
};

export default DownloadApp;
