import React from "react";

const LoveLessonsBanner = ({ children }: { children: React.ReactNode }) => (
  <section className={`bg-[#205072] py-20 w-full`}>
    <div className="container mx-auto px-4 text-center">
      {children}
    </div>
  </section>
);

export default LoveLessonsBanner;