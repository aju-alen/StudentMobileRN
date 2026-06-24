import type { NextConfig } from "next";

const curriculumSlugs = [
  "igcse-tutors",
  "ib-tutors",
  "a-level-tutors",
  "american-curriculum-tutors",
  "cbse-tutors",
];

const nextConfig: NextConfig = {
  async rewrites() {
    return curriculumSlugs.map((slug) => ({
      source: `/${slug}`,
      destination: `/curriculum/${slug}`,
    }));
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "coachacademic.s3.ap-southeast-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "api.qrserver.com",
      },
    ],
  },
};

export default nextConfig;
