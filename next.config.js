/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // canvasとencodingを無効化
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    // pdfjs-distを外部化（サーバーサイドのみ）
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'pdfjs-dist': 'commonjs pdfjs-dist',
        'canvas': 'commonjs canvas',
      });
    }

    return config;
  },
  // 実験的な機能を有効化
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'pdfjs-dist'],
  },
};

module.exports = nextConfig;
