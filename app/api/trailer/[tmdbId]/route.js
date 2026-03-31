import { NextResponse } from "next/server";

export async function GET(_request, context) {
  const { tmdbId } = await context.params;

  if (!tmdbId) {
    return NextResponse.json(
      { trailer: null, reason: "missing_tmdb_id" },
      { status: 400 },
    );
  }

  const token = process.env.TMDB_API_READ_ACCESS_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;
  if (!token && !apiKey) {
    return NextResponse.json({ trailer: null, reason: "missing_credentials" });
  }

  try {
    const requestUrl = apiKey
      ? `https://api.themoviedb.org/3/movie/${tmdbId}/videos?language=en-US&api_key=${apiKey}`
      : `https://api.themoviedb.org/3/movie/${tmdbId}/videos?language=en-US`;
    const headers = {
      accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(requestUrl, {
      headers,
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { trailer: null, reason: "request_failed" },
        { status: response.status },
      );
    }

    const data = await response.json();
    const trailer =
      data.results?.find(
        (video) =>
          video.site === "YouTube" &&
          video.type === "Trailer" &&
          video.official === true,
      ) ||
      data.results?.find(
        (video) => video.site === "YouTube" && video.type === "Trailer",
      ) ||
      data.results?.find((video) => video.site === "YouTube");

    if (!trailer) {
      return NextResponse.json({ trailer: null, reason: "no_trailer_found" });
    }

    return NextResponse.json({
      trailer: {
        key: trailer.key,
        name: trailer.name,
        site: trailer.site,
        type: trailer.type,
      },
      reason: null,
    });
  } catch {
    return NextResponse.json(
      { trailer: null, reason: "request_failed" },
      { status: 500 },
    );
  }
}