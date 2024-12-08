/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["adrdxahjylqbmxomhrmi.supabase.co"],
  },

  webpack: (config) => {
    config.module.rules.push({
      test: /\.(wav|mp3)$/i,
      use: [
        {
          loader: "file-loader",
          options: {
            publicPath: "/_next/static/media/",
            outputPath: "static/media/",
            name: "[name].[hash].[ext]",
          },
        },
      ],
    });
    return config;
  },
};

module.exports = nextConfig;
