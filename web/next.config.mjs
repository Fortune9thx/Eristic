/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  webpack(config) {
    // MetaMask SDK pulls in a React Native dep that doesn't exist in browsers
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@react-native-async-storage/async-storage": false,
    };
    return config;
  },
};
