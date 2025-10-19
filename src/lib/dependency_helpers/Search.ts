import { config } from "../config";

interface BraveSearchResult {
  title: string;
  url: string;
  description: string;
}

interface BraveSearchResponse {
  query: string;
  results: BraveSearchResult[];
}

export async function googleSearch(query: string): Promise<any> {
  const url = `https://www.googleapis.com/customsearch/v1?key=${config.google.google_search_api_key}&cx=${config.google.search_engine_id}&q=${encodeURIComponent(query)}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  return data.items;
}

export async function braveSearch(query: string): Promise<any> {
  const url = new URL('https://api.search.brave.com/res/v1/web/search');
  url.searchParams.append('q', query);
  url.searchParams.append('count', '20');

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': config.brave.search_api_key,
    },
  });

  if (!response.ok) {
    console.log(`lib/dependency_helpers/braveSearch error: ${response}`);
  }

  const data = await response.json();

  // Extract only the essential data
  // Filter urls that do not have 4 '/'
  const results: BraveSearchResult[] = (data.web?.results || [])
    .filter((result: any) => {
      try {
        const urlString = result.url || "";
        const normalized = urlString.replace(/\/$/, "");
        return (normalized.match(/\//g) || []).length === 4;
      } catch {
        return false;
      }
    })
    .map((result: any) => ({
      title: result.title,
      url: result.url,
    }));

  return {
    query: data.query?.original || query,
    results,
  };
}