const base = require("./app.json");
const withApkArchiveName = require("./plugins/withApkArchiveName");

/** @type {import('expo/config').ExpoConfig} */
module.exports = () => {
  const projectId =
    process.env.EAS_PROJECT_ID || base.expo.extra?.eas?.projectId;

  const config = {
    expo: {
      ...base.expo,
      runtimeVersion: {
        policy: "appVersion",
      },
      ...(projectId
        ? {
            updates: {
              url: `https://u.expo.dev/${projectId}`,
              enabled: true,
              checkAutomatically: "ON_LOAD",
              fallbackToCacheTimeout: 0,
            },
            extra: {
              ...base.expo.extra,
              eas: { projectId },
            },
          }
        : {
            extra: { ...base.expo.extra },
          }),
    },
  };

  return withApkArchiveName(config);
};
