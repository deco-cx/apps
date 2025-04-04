/**
 * Data types for Unsplash API
 */

// Types for search results
export interface UnsplashSearchResult {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

// Types for users
export interface UnsplashUser {
  id: string;
  username: string;
  name: string;
  portfolio_url: string | null;
  bio: string | null;
  location: string | null;
  total_likes: number;
  total_photos: number;
  total_collections: number;
  instagram_username: string | null;
  twitter_username: string | null;
  profile_image: {
    small: string;
    medium: string;
    large: string;
  };
  links: {
    self: string;
    html: string;
    photos: string;
    likes: string;
    portfolio: string;
    following: string;
    followers: string;
  };
}

// Types for images
export interface UnsplashPhoto {
  id: string;
  created_at: string;
  updated_at: string;
  width: number;
  height: number;
  color: string;
  blur_hash: string;
  likes: number;
  liked_by_user: boolean;
  description: string | null;
  alt_description: string | null;
  user: UnsplashUser;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  links: {
    self: string;
    html: string;
    download: string;
    download_location: string;
  };
  tags?: Array<{
    title: string;
  }>;
}

// Simplified version of photo for lighter responses
export interface SimpleUnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  width: number;
  height: number;
  description: string | null;
  alt_description: string | null;
  color: string;
  user: {
    name: string;
    username: string;
    profile_url: string;
  };
}

// Simplified search result
export interface SimpleUnsplashSearchResult {
  total: number;
  total_pages: number;
  results: SimpleUnsplashPhoto[];
}

// Types for collections
export interface UnsplashCollection {
  id: string;
  title: string;
  description: string | null;
  published_at: string;
  last_collected_at: string;
  updated_at: string;
  total_photos: number;
  private: boolean;
  share_key: string;
  cover_photo: UnsplashPhoto | null;
  user: UnsplashUser;
  links: {
    self: string;
    html: string;
    photos: string;
  };
}

// Ultra simplified version with only image URLs
export interface UnsplashPhotoUrls {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  description: string | null;
  alt_description: string | null;
}

// Interface for client methods
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
