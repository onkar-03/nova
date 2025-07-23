/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude system directories from being watched/scanned
    config.watchOptions = {
      eslint: { ignoreDuringBuilds: true },
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/C:/Users/*/Cookies/**',
        '**/C:/Users/*/AppData/**',
        '**/C:/Windows/**',
        '**/System32/**',
      ],
    };
    return config;
  },
};

module.exports = nextConfig;
