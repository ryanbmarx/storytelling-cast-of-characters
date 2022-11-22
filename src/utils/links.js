/* link utilities */

const CDN_ROOT =
  "https://www.gannett-cdn.com/usat-storytelling/storytelling-studio-apps";
const GIT_BRANCH = process.env.GIT_BRANCH || "dev";
const PROJECT_SLUG = process.env.PROJECT_SLUG;
const DEFAULT_ASSET_PATH = `${CDN_ROOT}/${GIT_BRANCH}/${PROJECT_SLUG}/`;

export function urlFor(path, base) {
  base = base || undefined;
  const url = new URL(path, base);
  return url.toString();
}

export function base(domain = "www.usatoday.com") {
  let ASSET_PATH = process.env.ASSET_PATH || DEFAULT_ASSET_PATH;
  let BASE_URL;

  if (typeof window === "undefined") {
    BASE_URL = `https://${domain}/storytelling/${PROJECT_SLUG}`;

    return {
      BASE_URL,
      ASSET_PATH
    };
  }

  if (!ASSET_PATH) ASSET_PATH = `${window.location.origin}/`;

  switch (window.location.hostname) {
    case "localhost":
    case "0.0.0.0":
      BASE_URL = ASSET_PATH = `${window.location.origin}/`;
      break;

    case "www.gannett-cdn.com":
      BASE_URL = ASSET_PATH;
      break;

    case "dev-uw.usatoday.com":
      BASE_URL = `https://dev-uw.usatoday.com/storytelling/${PROJECT_SLUG}/`;
      break;

    default:
      BASE_URL = `https://${
        window.location.hostname
      }/storytelling/${PROJECT_SLUG}/`;
  }

  return {
    BASE_URL,
    ASSET_PATH
  };
}
