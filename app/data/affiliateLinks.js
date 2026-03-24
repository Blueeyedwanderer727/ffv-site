const AMAZON_BASE_URL = "https://www.amazon.com/s";

export function isAmazonAffiliateEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_AMAZON_AFFILIATE === "true";
}

function getAmazonAffiliateTag() {
  return process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || "";
}

export function buildAmazonWatchHref(movie) {
  const params = new URLSearchParams();
  const query = [movie?.title, movie?.year].filter(Boolean).join(" ");

  params.set("k", query);

  const affiliateTag = getAmazonAffiliateTag();
  if (affiliateTag) {
    params.set("tag", affiliateTag);
  }

  return `${AMAZON_BASE_URL}?${params.toString()}`;
}

export function buildTmdbWatchHref(movie) {
  if (!movie?.tmdbUrl) {
    return null;
  }

  const match = movie.tmdbUrl.match(/\/movie\/(\d+)/i);
  if (!match?.[1]) {
    return movie.tmdbUrl;
  }

  return `https://www.themoviedb.org/movie/${match[1]}/watch?locale=US`;
}