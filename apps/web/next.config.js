/** @type {import('next').NextConfig} */
const webpack = require('webpack');

const nextConfig = {
    images: {
        domains: ['avatars.githubusercontent.com']
    },
    env: {},
    webpack: (config, { isServer }) => {
        // Ignore optional dependencies that aren't needed for web
        config.resolve.fallback = {
            ...config.resolve.fallback,
            '@react-native-async-storage/async-storage': false,
            'pino-pretty': false,
        };
        
        // Use IgnorePlugin to completely ignore these modules
        config.plugins.push(
            new webpack.IgnorePlugin({
                resourceRegExp: /^@react-native-async-storage\/async-storage$/,
            }),
            new webpack.IgnorePlugin({
                resourceRegExp: /^pino-pretty$/,
            })
        );

        return config;
    },
};

module.exports = nextConfig;
