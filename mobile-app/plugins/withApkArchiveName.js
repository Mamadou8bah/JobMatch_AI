const { withAppBuildGradle } = require("expo/config-plugins");

/** Names release APK/AAB artifacts JobMatch-AI-v{version} instead of app-release.apk */
function withApkArchiveName(config) {
  return withAppBuildGradle(config, (mod) => {
    const version = config.version || "1.0.0";
    const marker = 'setProperty("archivesBaseName"';
    if (mod.modResults.contents.includes(marker)) {
      return mod;
    }
    mod.modResults.contents = mod.modResults.contents.replace(
      /defaultConfig\s*\{/,
      `defaultConfig {
        setProperty("archivesBaseName", "JobMatch-AI-v${version}")`
    );
    return mod;
  });
}

module.exports = withApkArchiveName;
