import React from "react";

const LoveLessonsBanner = ({ children, bgColor }: { children: React.ReactNode, bgColor: string }) => (
  <section className={`bg-${bgColor}-400 py-20 w-full`}>
    <div className="container mx-auto px-4 text-center">
      {children}
    </div>
  </section>
);

export default LoveLessonsBanner;