import { readFileSync } from 'node:fs';

function read(path) {
  return readFileSync(path, 'utf8');
}

function expectEqual(label, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function capture(source, pattern, label) {
  const match = source.match(pattern);
  if (!match) throw new Error(`Could not read ${label}`);
  return match[1];
}

const packageJson = JSON.parse(read('package.json'));
const tauriConfig = JSON.parse(read('src-tauri/tauri.conf.json'));
const cargoToml = read('src-tauri/Cargo.toml');
const androidGradle = read('src-tauri/gen/android/app/build.gradle.kts');
const wrapperProperties = read('src-tauri/gen/android/gradle/wrapper/gradle-wrapper.properties');

const GRADLE_VERSION = '8.14.3';
const GRADLE_BIN_SHA256 = 'bd71102213493060956ec229d946beee57158dbd89d0e62b91bca0fa2c5f3531';

const cargoVersion = capture(cargoToml, /\[package\][\s\S]*?\nversion\s*=\s*"([^"]+)"/, 'Cargo package version');
expectEqual('package.json and tauri.conf.json versions', packageJson.version, tauriConfig.version);
expectEqual('package.json and Cargo.toml versions', packageJson.version, cargoVersion);

if (tauriConfig.bundle?.active !== true) {
  throw new Error('Tauri bundling must remain enabled');
}
if (!tauriConfig.plugins?.sql?.preload?.includes('sqlite:tulpa.db')) {
  throw new Error('SQLite must be preloaded so versioned migrations run before the first query');
}
const bundleTargets = tauriConfig.bundle.targets;
if (bundleTargets !== 'all' && (!Array.isArray(bundleTargets) || bundleTargets.length === 0)) {
  throw new Error('Tauri bundle.targets must be "all" or a non-empty target list');
}

const expectedApi = Number(process.env.ANDROID_API ?? 36);
const expectedMinSdk = Number(tauriConfig.bundle?.android?.minSdkVersion);
const compileSdk = Number(capture(androidGradle, /compileSdk\s*=\s*(\d+)/, 'compileSdk'));
const targetSdk = Number(capture(androidGradle, /targetSdk\s*=\s*(\d+)/, 'targetSdk'));
const minSdk = Number(capture(androidGradle, /minSdk\s*=\s*(\d+)/, 'minSdk'));

expectEqual('Android compileSdk', compileSdk, expectedApi);
expectEqual('Android targetSdk', targetSdk, expectedApi);
expectEqual('Android minSdk parity', minSdk, expectedMinSdk);

const gradleUrl = capture(wrapperProperties, /^distributionUrl=.*gradle-([\d.]+)-bin\.zip$/m, 'Gradle distribution URL');
const gradleSha256 = capture(wrapperProperties, /^distributionSha256Sum=([a-f0-9]{64})$/m, 'Gradle distribution checksum');
expectEqual('Gradle wrapper version', gradleUrl, GRADLE_VERSION);
expectEqual('Gradle binary checksum', gradleSha256, GRADLE_BIN_SHA256);

console.log(`Configuration verified: v${packageJson.version}, Android API ${expectedApi}, minSdk ${minSdk}`);
