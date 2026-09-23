import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/contests",
        destination: "/events",
        permanent: true,
      },
      {
        source: "/contest/:slug",
        destination: "/events/:slug",
        permanent: true,
      },
      {
        source: "/event/:slug",
        destination: "/events/:slug",
        permanent: true,
      },
      {
        source: "/create-contest",
        destination: "/dashboard/events/new",
        permanent: true,
      },
      {
        source: "/create-event",
        destination: "/dashboard/events/new",
        permanent: true,
      },
      {
        source: "/contestant/:id",
        destination: "/nominees/:id",
        permanent: true,
      },
      {
        source: "/nominee/:id",
        destination: "/nominees/:id",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
