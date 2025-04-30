import {
  SimpleUnsplashPhoto,
  SimpleUnsplashSearchResult,
  UnsplashPhoto,
  UnsplashPhotoUrls,
  UnsplashSearchResult,
} from "./types.ts";

export interface UnsplashClientInterface {
  "GET /photos": {
    response: UnsplashPhoto[];
  };
  "GET /photos/:id": {
    response: UnsplashPhoto;
  };
  "GET /search/photos": {
    response: UnsplashSearchResult;
    params: {
      query: string;
      page?: number;
      per_page?: number;
      orientation?: "landscape" | "portrait" | "squarish";
      collections?: string;
      content_filter?: "low" | "high";
      color?: string;
    };
  };
}

/**
 * Client for interacting with the Unsplash API
 */
export class UnsplashClient {
  private accessKey: string;
  private baseUrl = "https://api.unsplash.com";

  constructor(accessKey: string) {
    this.accessKey = accessKey;
  }

  /**
   * Get a photo by ID
   */
  async getPhoto(id: string): Promise<UnsplashPhoto> {
    return await this.fetch(`/photos/${id}`);
  }

  /**
   * Get a photo by ID in simplified format
   */
  async getPhotoSimple(id: string): Promise<SimpleUnsplashPhoto> {
    const photo = await this.fetch<UnsplashPhoto>(`/photos/${id}`);
    return this.simplifyPhoto(photo);
  }

  /**
   * Get only the URLs of a photo by ID
   */
  async getPhotoUrls(id: string): Promise<UnsplashPhotoUrls> {
    const photo = await this.fetch<UnsplashPhoto>(`/photos/${id}`);
    return this.extractPhotoUrls(photo);
  }

  /**
   * List photos with pagination
   */
  async listPhotos(page = 1, perPage = 10): Promise<UnsplashPhoto[]> {
    return await this.fetch(`/photos`, {
      page: page.toString(),
      per_page: perPage.toString(),
    });
  }

  /**
   * List photos with pagination in simplified format
   */
  async listPhotosSimple(
    page = 1,
    perPage = 10,
  ): Promise<SimpleUnsplashPhoto[]> {
    const photos = await this.fetch<UnsplashPhoto[]>(`/photos`, {
      page: page.toString(),
      per_page: perPage.toString(),
    });
    return photos.map((photo) => this.simplifyPhoto(photo));
  }

  /**
   * List only the URLs of photos
   */
  async listPhotosUrls(page = 1, perPage = 10): Promise<UnsplashPhotoUrls[]> {
    const photos = await this.fetch<UnsplashPhoto[]>(`/photos`, {
      page: page.toString(),
      per_page: perPage.toString(),
    });
    return photos.map((photo) => this.extractPhotoUrls(photo));
  }

  /**
   * Search photos by term
   */
  async searchPhotos(
    query: string,
    page = 1,
    perPage = 10,
    params: {
      orientation?: "landscape" | "portrait" | "squarish";
      collections?: string;
      contentFilter?: "low" | "high";
      color?: string;
    } = {},
  ): Promise<UnsplashSearchResult> {
    const searchParams: Record<string, string> = {
      query,
      page: page.toString(),
      per_page: perPage.toString(),
    };

    if (params.orientation) {
      searchParams.orientation = params.orientation;
    }

    if (params.collections) {
      searchParams.collections = params.collections;
    }

    if (params.contentFilter) {
      searchParams.content_filter = params.contentFilter;
    }

    if (params.color) {
      searchParams.color = params.color;
    }

    return await this.fetch("/search/photos", searchParams);
  }

  /**
   * Search photos by term and return in simplified format
   */
  async searchPhotosSimple(
    query: string,
    page = 1,
    perPage = 10,
    params: {
      orientation?: "landscape" | "portrait" | "squarish";
      collections?: string;
      contentFilter?: "low" | "high";
      color?: string;
    } = {},
  ): Promise<SimpleUnsplashSearchResult> {
    const result = await this.searchPhotos(query, page, perPage, params);
    return {
      total: result.total,
      total_pages: result.total_pages,
      results: result.results.map((photo) => this.simplifyPhoto(photo)),
    };
  }

  /**
   * Search photos by term and return only URLs
   */
  async searchPhotosUrls(
    query: string,
    page = 1,
    perPage = 10,
    params: {
      orientation?: "landscape" | "portrait" | "squarish";
      collections?: string;
      contentFilter?: "low" | "high";
      color?: string;
    } = {},
  ): Promise<
    { total: number; total_pages: number; results: UnsplashPhotoUrls[] }
  > {
    const result = await this.searchPhotos(query, page, perPage, params);
    return {
      total: result.total,
      total_pages: result.total_pages,
      results: result.results.map((photo) => this.extractPhotoUrls(photo)),
    };
  }

  /**
   * Transform a complete photo into a simplified version
   */
  private simplifyPhoto(photo: UnsplashPhoto): SimpleUnsplashPhoto {
    return {
      id: photo.id,
      urls: photo.urls,
      width: photo.width,
      height: photo.height,
      description: photo.description,
      alt_description: photo.alt_description,
      color: photo.color,
      user: {
        name: photo.user.name,
        username: photo.user.username,
        profile_url: photo.user.links.html,
      },
    };
  }

  /**
   * Extract only URLs and minimal information from a photo
   */
  private extractPhotoUrls(photo: UnsplashPhoto): UnsplashPhotoUrls {
    return {
      id: photo.id,
      urls: photo.urls,
      description: photo.description,
      alt_description: photo.alt_description,
    };
  }

  /**
   * Generic fetch method for making requests
   */
  private async fetch<T>(
    endpoint: string,
    params: Record<string, string> = {},
  ): Promise<T> {
    const url = new URL(this.baseUrl + endpoint);

    // Add query parameters to URL
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        "Authorization": `Client-ID ${this.accessKey}`,
        "Accept-Version": "v1",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Unsplash API request failed: ${response.status} ${errorText}`,
      );
    }

    return await response.json() as T;
  }
}
