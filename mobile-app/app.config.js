const base = require("./app.json");

/** @type {import('expo/config').ExpoConfig} */
module.exports = () => {
  const projectId =
    process.env.EAS_PROJECT_ID || base.expo.extra?.eas?.projectId;

  return {
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
};
