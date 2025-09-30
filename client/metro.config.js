const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname,{
    enableSourceContextInDevelopment: true,
    annotateReactComponents: true,
});

module.exports = config;
