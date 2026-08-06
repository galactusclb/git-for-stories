import path from 'path';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    cacheComponents: true,
    cacheHandlers: {
        default: path.resolve('./src/lib/redis/index.mjs'),
    },
    reactCompiler: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.cloudfront.net',
                port: '',
                pathname: '**',
            },
        ],
    },
    headers: () => {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, s-maxage=60, stale-while-revalidate=30',
                    },
                ],
            },
            {
                source: '/_next/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
