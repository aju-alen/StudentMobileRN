const BecomeTutor = () => {
  return (
    <div className="flex flex-col md:flex-row bg-teal-400 rounded-xl overflow-hidden shadow-lg my-8 mx-auto max-w-7xl w-full">
      {/* Left: Tutor Image */}
      <div className="md:w-1/2 w-full flex items-center  bg-white">
        <img
          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Tutor"
          className=" object-contain w-full h-56 sm:h-72 md:h-[420px] "
        />
      </div>
      {/* Right: Content */}
      <div className="md:w-1/2 w-full p-5 sm:p-8 flex flex-col justify-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-black mb-3 sm:mb-4 leading-tight">
          Become a<br className="hidden sm:block" /> tutor
        </h1>
        <p className="text-base sm:text-lg text-black/80 mb-4 sm:mb-6">
        Earn money for sharing knowledge with students. Sign up to start tutoring online with Coach Academ

        </p>
        <ul className="mb-6 sm:mb-8 space-y-2">
          <li className="font-bold text-black flex items-center text-base sm:text-lg"><span className="mr-2">•</span>Find new students</li>
          <li className="font-bold text-black flex items-center text-base sm:text-lg"><span className="mr-2">•</span>Grow your business</li>
          <li className="font-bold text-black flex items-center text-base sm:text-lg"><span className="mr-2">•</span>Get paid securely</li>
        </ul>
        <button className="bg-black text-white py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg font-semibold text-base sm:text-lg flex items-center justify-center mb-3 sm:mb-4 hover:bg-gray-900 transition w-full">
          Become a tutor <span className="ml-2">→</span>
        </button>
        <div className="flex justify-center w-full">
          <a href="https://help.coachacadem.ae/resources/ca-help-for-tutors#becoming-a-ca-tutor" className="text-black underline text-sm sm:text-base hover:text-gray-700">How our platform works</a>
        </div>
      </div>
    </div>
  );
};

export default BecomeTutor; 