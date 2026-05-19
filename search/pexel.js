/*
Sumber: https://whatsapp.com/channel/0029Vb7Dpq5GZNCu2OKoZl15
App: https://play.google.com/store/apps/details?id=com.pexels.app
*/

class PexelsAPI {
  constructor() {
    this.baseUrl = 'https://www.pexels.com/en-us/api';
    this.headers = {
      'accept-encoding': 'gzip',
      'authorization': '',
      'cache-control': 'no-cache, no-store, must-revalidate',
      'connection': 'Keep-Alive',
      'content-type': 'application/json',
      'expires': '0',
      'host': 'www.pexels.com',
      'pragma': 'no-cache',
      'secret-key': 'H2jk9uKnhRmL6WPwh89zBezWvr',
      'user-agent': 'PexelsMobileApp/8.3.6 (android 28)',
      'x-client-type': 'mobile',
      'x-client-version': '8.3.6'
    };
  }

  async request(url) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Gagal mengambil data dari ${url}:`, error);
      throw error;
    }
  }

  // 1. Get Feed (v2)
  async getFeed() {
    const url = `${this.baseUrl}/v2/feed`;
    return await this.request(url);
  }

  // 2. Get Trending Search Topics (v2)
  async getTrendingSearches() {
    const url = `${this.baseUrl}/v2/search/trending`;
    return await this.request(url);
  }

  // 3. Search Photos (v3)
  async searchPhotos(query, perPage = 15, page = 1) {
    const encodedQuery = encodeURIComponent(query);
    const url = `${this.baseUrl}/v3/search/photos?query=${encodedQuery}&per_page=${perPage}&page=${page}`;
    return await this.request(url);
  }

  // 4. Search Videos (v3)
  async searchVideos(query, perPage = 15, page = 2) {
    const encodedQuery = encodeURIComponent(query);
    const url = `${this.baseUrl}/v3/search/videos/?query=${encodedQuery}&per_page=${perPage}&page=${page}`;
    return await this.request(url);
  }
}
/*
async function main() {
  const pexels = new PexelsAPI();
  try {
    console.log('Mengambil Feed...');
    const feed = await pexels.getFeed();

    console.log('Mengambil Topik Trending...');
    const trending = await pexels.getTrendingSearches();

    console.log('Mencari Foto...');
    const photos = await pexels.searchPhotos('thank you', 15, 1);

    console.log('Mencari Video...');
    const videos = await pexels.searchVideos('thank you', 15, 2);

    console.log({ feed, trending, photos, videos });
  } catch (error) {
    console.error('Terjadi kesalahan pada main function:', error);
  }
}
main();
*/
