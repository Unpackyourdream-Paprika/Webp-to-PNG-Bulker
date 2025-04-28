/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // 소스 디렉토리 내의 이미지를 허용하도록 설정
  experimental: {
    images: {
      allowFutureImage: true,
    },
  },
  // 이미지 처리 설정
  webpack(config) {
    // .webp 파일을 처리하기 위한 설정
    config.module.rules.push({
      test: /\.(webp)$/i,
      type: 'asset/resource',
    });

    return config;
  },
}

module.exports = nextConfig 