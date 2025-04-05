const BASE_URL = "https://chrome.browserless.io";

/**
 * @description Represents the response structure from the Browserless API.
 */
interface BrowserlessApiResponse<T = unknown> {
  data: T;
  error?: { message: string; [key: string]: unknown }; // For error structure
}

/**
 * @description Parameters for content API
 */
export interface ContentParams {
  url: string;
  gotoOptions?: {
    timeout?: number;
    waitUntil?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
  };
  elements?: string[];
  cookies?: Array<{
    name: string;
    value: string;
    domain: string;
    path?: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
  }>;
  authenticate?: {
    username: string;
    password: string;
  };
  // Additional options based on docs
  rejectResourceTypes?: string[];
  rejectRequestPattern?: string[];
  requestInterceptors?: Array<{
    pattern: string;
    response: {
      status: number;
      headers: Record<string, string>;
      body: string;
    };
  }>;
  addScriptTag?: Array<{
    url?: string;
    path?: string;
    content?: string;
    type?: string;
  }>;
  addStyleTag?: Array<{
    url?: string;
    path?: string;
    content?: string;
  }>;
  setExtraHTTPHeaders?: Record<string, string>;
  setJavaScriptEnabled?: boolean;
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
    deviceScaleFactor?: number;
    isMobile?: boolean;
    hasTouch?: boolean;
    isLandscape?: boolean;
  };
  waitForFunction?: {
    fn: string;
    args?: unknown[];
    polling?: "raf" | "mutation" | number;
    timeout?: number;
  };
  waitForSelector?: {
    selector: string;
    hidden?: boolean;
    timeout?: number;
    visible?: boolean;
  };
  waitForEvent?: {
    event: string;
    timeout?: number;
  };
  waitForTimeout?: number;
}

/**
 * @description Parameters for screenshot API
 */
export interface ScreenshotParams {
  url: string;
  gotoOptions?: {
    timeout?: number;
    waitUntil?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
  };
  options?: {
    type?: "png" | "jpeg" | "webp";
    quality?: number;
    fullPage?: boolean;
    clip?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    omitBackground?: boolean;
    encoding?: "base64" | "binary";
  };
  cookies?: Array<{
    name: string;
    value: string;
    domain: string;
    path?: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
  }>;
  authenticate?: {
    username: string;
    password: string;
  };
  // Additional options based on docs
  rejectResourceTypes?: string[];
  rejectRequestPattern?: string[];
  requestInterceptors?: Array<{
    pattern: string;
    response: {
      status: number;
      headers: Record<string, string>;
      body: string;
    };
  }>;
  addScriptTag?: Array<{
    url?: string;
    path?: string;
    content?: string;
    type?: string;
  }>;
  addStyleTag?: Array<{
    url?: string;
    path?: string;
    content?: string;
  }>;
  setExtraHTTPHeaders?: Record<string, string>;
  setJavaScriptEnabled?: boolean;
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
    deviceScaleFactor?: number;
    isMobile?: boolean;
    hasTouch?: boolean;
    isLandscape?: boolean;
  };
  waitForFunction?: {
    fn: string;
    args?: unknown[];
    polling?: "raf" | "mutation" | number;
    timeout?: number;
  };
  waitForSelector?: {
    selector: string;
    hidden?: boolean;
    timeout?: number;
    visible?: boolean;
  };
  waitForEvent?: {
    event: string;
    timeout?: number;
  };
  waitForTimeout?: number;
  selector?: string;
  transparent?: boolean;
}

/**
 * @description Parameters for PDF API
 */
export interface PdfParams {
  url: string;
  gotoOptions?: {
    timeout?: number;
    waitUntil?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
  };
  options?: {
    displayHeaderFooter?: boolean;
    footerTemplate?: string;
    format?:
      | "Letter"
      | "Legal"
      | "Tabloid"
      | "A0"
      | "A1"
      | "A2"
      | "A3"
      | "A4"
      | "A5";
    headerTemplate?: string;
    height?: number | string;
    landscape?: boolean;
    margin?: {
      top?: number | string;
      right?: number | string;
      bottom?: number | string;
      left?: number | string;
    };
    pageRanges?: string;
    preferCSSPageSize?: boolean;
    printBackground?: boolean;
    scale?: number;
    width?: number | string;
  };
  cookies?: Array<{
    name: string;
    value: string;
    domain: string;
    path?: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
  }>;
  authenticate?: {
    username: string;
    password: string;
  };
  // Additional options based on docs
  rejectResourceTypes?: string[];
  rejectRequestPattern?: string[];
  requestInterceptors?: Array<{
    pattern: string;
    response: {
      status: number;
      headers: Record<string, string>;
      body: string;
    };
  }>;
  addScriptTag?: Array<{
    url?: string;
    path?: string;
    content?: string;
    type?: string;
  }>;
  addStyleTag?: Array<{
    url?: string;
    path?: string;
    content?: string;
  }>;
  setExtraHTTPHeaders?: Record<string, string>;
  setJavaScriptEnabled?: boolean;
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
    deviceScaleFactor?: number;
    isMobile?: boolean;
    hasTouch?: boolean;
    isLandscape?: boolean;
  };
  waitForFunction?: {
    fn: string;
    args?: unknown[];
    polling?: "raf" | "mutation" | number;
    timeout?: number;
  };
  waitForSelector?: {
    selector: string;
    hidden?: boolean;
    timeout?: number;
    visible?: boolean;
  };
  waitForEvent?: {
    event: string;
    timeout?: number;
  };
  waitForTimeout?: number;
  safeMode?: boolean;
  html?: string;
  emulateMedia?: "screen" | "print";
}

/**
 * @description Parameters for scrape API
 */
export interface ScrapeParams {
  url: string;
  gotoOptions?: {
    timeout?: number;
    waitUntil?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
  };
  elements?: Array<{
    selector: string;
    timeout?: number;
    attribute?: string;
  }>;
  cookies?: Array<{
    name: string;
    value: string;
    domain: string;
    path?: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
  }>;
  authenticate?: {
    username: string;
    password: string;
  };
  // Additional options based on docs
  rejectResourceTypes?: string[];
  rejectRequestPattern?: string[];
  requestInterceptors?: Array<{
    pattern: string;
    response: {
      status: number;
      headers: Record<string, string>;
      body: string;
    };
  }>;
  addScriptTag?: Array<{
    url?: string;
    path?: string;
    content?: string;
    type?: string;
  }>;
  addStyleTag?: Array<{
    url?: string;
    path?: string;
    content?: string;
  }>;
  setExtraHTTPHeaders?: Record<string, string>;
  setJavaScriptEnabled?: boolean;
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
    deviceScaleFactor?: number;
    isMobile?: boolean;
    hasTouch?: boolean;
    isLandscape?: boolean;
  };
  waitForFunction?: {
    fn: string;
    args?: unknown[];
    polling?: "raf" | "mutation" | number;
    timeout?: number;
  };
  waitForSelector?: {
    selector: string;
    hidden?: boolean;
    timeout?: number;
    visible?: boolean;
  };
  waitForEvent?: {
    event: string;
    timeout?: number;
  };
  waitForTimeout?: number;
  debug?: boolean;
  includeMetadata?: boolean;
  manipulate?: {
    selector: string;
    function: string;
  };
}

/**
 * @description Parameters for function API
 */
export interface FunctionParams {
  code: string;
  context?: Record<string, unknown>;
  detached?: boolean;
  // Additional options based on docs
  cookies?: Array<{
    name: string;
    value: string;
    domain: string;
    path?: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
  }>;
  authenticate?: {
    username: string;
    password: string;
  };
  html?: string;
  addScriptTag?: Array<{
    url?: string;
    path?: string;
    content?: string;
    type?: string;
  }>;
  addStyleTag?: Array<{
    url?: string;
    path?: string;
    content?: string;
  }>;
  rejectResourceTypes?: string[];
  rejectRequestPattern?: string[];
  requestInterceptors?: Record<string, {
    pattern: string;
    response: {
      status: number;
      headers: Record<string, string>;
      body: string;
    };
  }>;
  url?: string;
  gotoOptions?: {
    timeout?: number;
    waitUntil?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
  };
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
    deviceScaleFactor?: number;
    isMobile?: boolean;
    hasTouch?: boolean;
    isLandscape?: boolean;
  };
}

/**
 * @description Parameters for unblock API
 */
export interface UnblockParams {
  url: string;
  gotoOptions?: {
    timeout?: number;
    waitUntil?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
  };
  cookies?: Array<{
    name: string;
    value: string;
    domain: string;
    path?: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
  }>;
  authenticate?: {
    username: string;
    password: string;
  };
  returnType?: "html" | "screenshot" | "cookies";
  // Additional options based on docs
  rejectResourceTypes?: string[];
  rejectRequestPattern?: string[];
  requestInterceptors?: Array<{
    pattern: string;
    response: {
      status: number;
      headers: Record<string, string>;
      body: string;
    };
  }>;
  addScriptTag?: Array<{
    url?: string;
    path?: string;
    content?: string;
    type?: string;
  }>;
  addStyleTag?: Array<{
    url?: string;
    path?: string;
    content?: string;
  }>;
  setExtraHTTPHeaders?: Record<string, string>;
  setJavaScriptEnabled?: boolean;
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
    deviceScaleFactor?: number;
    isMobile?: boolean;
    hasTouch?: boolean;
    isLandscape?: boolean;
  };
  waitForFunction?: {
    fn: string;
    args?: unknown[];
    polling?: "raf" | "mutation" | number;
    timeout?: number;
  };
  waitForSelector?: {
    selector: string;
    hidden?: boolean;
    timeout?: number;
    visible?: boolean;
  };
  waitForEvent?: {
    event: string;
    timeout?: number;
  };
  waitForTimeout?: number;
  stealth?: boolean;
  proxy?: {
    server: string;
    bypass?: string;
    username?: string;
    password?: string;
  };
}

/**
 * @description Parameters for performance API
 */
export interface PerformanceParams {
  url: string;
  runs?: number;
  budget?: {
    performance?: number;
    accessibility?: number;
    bestPractices?: number;
    seo?: number;
    pwa?: number;
  };
  throttling?: {
    downloadThroughput?: number;
    uploadThroughput?: number;
    latency?: number;
    cpuSlowdownMultiplier?: number;
  };
  cookies?: Array<{
    name: string;
    value: string;
    domain: string;
    path?: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
  }>;
  authenticate?: {
    username: string;
    password: string;
  };
  userAgent?: string;
  emulatedFormFactor?: "mobile" | "desktop" | "none";
  output?: "json" | "html";
  gotoOptions?: {
    timeout?: number;
    waitUntil?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
  };
  viewport?: {
    width: number;
    height: number;
    deviceScaleFactor?: number;
    isMobile?: boolean;
    hasTouch?: boolean;
    isLandscape?: boolean;
  };
}

/**
 * @description Parameters for download API
 */
export interface DownloadParams {
  url: string;
  gotoOptions?: {
    timeout?: number;
    waitUntil?: "load" | "domcontentloaded" | "networkidle0" | "networkidle2";
  };
  cookies?: Array<{
    name: string;
    value: string;
    domain: string;
    path?: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
  }>;
  authenticate?: {
    username: string;
    password: string;
  };
  selector?: string;
  timeout?: number;
  rejectResourceTypes?: string[];
  rejectRequestPattern?: string[];
  userAgent?: string;
}

/**
 * @description Client for interacting with Browserless APIs
 */
export class BrowserlessClient {
  private token?: string;
  private baseUrl: string;

  constructor(
    token?: string,
    baseUrl: string = BASE_URL,
  ) {
    this.token = token;
    this.baseUrl = baseUrl;
  }

  /**
   * @description Convert blob to base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remove data URL prefix
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * @description Get HTML content from a URL
   */
  async getContent(params: ContentParams): Promise<{ content: string }> {
    const url = new URL(`${this.baseUrl}/content`);
    if (this.token) {
      url.searchParams.append("token", this.token);
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      let errorMessage =
        `Browserless API failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage += `. Details: ${JSON.stringify(errorData)}`;
      } catch (_) {
        // Ignore JSON parsing error
      }
      throw new Error(errorMessage);
    }

    const content = await response.text();
    return { content };
  }

  /**
   * @description Download files using the browser
   */
  async download(params: DownloadParams): Promise<{ base64Image: string }> {
    const url = new URL(`${this.baseUrl}/download`);
    if (this.token) {
      url.searchParams.append("token", this.token);
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      let errorMessage =
        `Browserless API failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage += `. Details: ${JSON.stringify(errorData)}`;
      } catch (_) {
        // Ignore JSON parsing error
      }
      throw new Error(errorMessage);
    }

    const blob = await response.blob();
    const base64Image = await this.blobToBase64(blob);
    return { base64Image };
  }

  /**
   * @description Capture a screenshot from a URL
   */
  async getScreenshot(
    params: ScreenshotParams,
  ): Promise<{ base64Image: string }> {
    const url = new URL(`${this.baseUrl}/screenshot`);
    if (this.token) {
      url.searchParams.append("token", this.token);
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      let errorMessage =
        `Browserless API failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage += `. Details: ${JSON.stringify(errorData)}`;
      } catch (_) {
        // Ignore JSON parsing error
      }
      throw new Error(errorMessage);
    }

    const blob = await response.blob();
    const base64Image = await this.blobToBase64(blob);
    return { base64Image };
  }

  /**
   * @description Generate a PDF from a URL
   */
  async getPdf(params: PdfParams): Promise<{ base64PDF: string }> {
    const url = new URL(`${this.baseUrl}/pdf`);
    if (this.token) {
      url.searchParams.append("token", this.token);
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      let errorMessage =
        `Browserless API failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage += `. Details: ${JSON.stringify(errorData)}`;
      } catch (_) {
        // Ignore JSON parsing error
      }
      throw new Error(errorMessage);
    }

    const blob = await response.blob();
    const base64PDF = await this.blobToBase64(blob);
    return { base64PDF };
  }

  /**
   * @description Scrape structured data from a URL
   */
  async scrape<T = Record<string, unknown>>(
    params: ScrapeParams,
  ): Promise<{ data: T }> {
    const url = new URL(`${this.baseUrl}/scrape`);
    if (this.token) {
      url.searchParams.append("token", this.token);
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      let errorMessage =
        `Browserless API failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage += `. Details: ${JSON.stringify(errorData)}`;
      } catch (_) {
        // Ignore JSON parsing error
      }
      throw new Error(errorMessage);
    }

    const data = await response.json() as T;
    return { data };
  }

  /**
   * @description Execute a function in the browser
   */
  async executeFunction<T = unknown>(
    params: FunctionParams,
  ): Promise<{ result: T }> {
    const url = new URL(`${this.baseUrl}/function`);
    if (this.token) {
      url.searchParams.append("token", this.token);
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      let errorMessage =
        `Browserless API failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage += `. Details: ${JSON.stringify(errorData)}`;
      } catch (_) {
        // Ignore JSON parsing error
      }
      throw new Error(errorMessage);
    }

    const result = await response.json() as T;
    return { result };
  }

  /**
   * @description Unblock a page and return content, screenshot, or cookies
   */
  async unblock(params: UnblockParams): Promise<{ result: unknown }> {
    const url = new URL(`${this.baseUrl}/unblock`);
    if (this.token) {
      url.searchParams.append("token", this.token);
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      let errorMessage =
        `Browserless API failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage += `. Details: ${JSON.stringify(errorData)}`;
      } catch (_) {
        // Ignore JSON parsing error
      }
      throw new Error(errorMessage);
    }

    if (params.returnType === "screenshot") {
      const blob = await response.blob();
      const base64Image = await this.blobToBase64(blob);
      return { result: { base64Image } };
    } else if (params.returnType === "cookies") {
      const cookies = await response.json();
      return { result: cookies };
    } else {
      // Default is HTML content
      const content = await response.text();
      return { result: content };
    }
  }

  /**
   * @description Run performance tests on a page
   */
  async testPerformance(
    params: PerformanceParams,
  ): Promise<{ results: unknown }> {
    const url = new URL(`${this.baseUrl}/performance`);
    if (this.token) {
      url.searchParams.append("token", this.token);
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      let errorMessage =
        `Browserless API failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage += `. Details: ${JSON.stringify(errorData)}`;
      } catch (_) {
        // Ignore JSON parsing error
      }
      throw new Error(errorMessage);
    }

    const results = await response.json();
    return { results };
  }

  /**
   * @description Get info about active sessions
   */
  async getSessions(): Promise<{ sessions: unknown }> {
    const url = new URL(`${this.baseUrl}/sessions`);
    if (this.token) {
      url.searchParams.append("token", this.token);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      let errorMessage =
        `Browserless API failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage += `. Details: ${JSON.stringify(errorData)}`;
      } catch (_) {
        // Ignore JSON parsing error
      }
      throw new Error(errorMessage);
    }

    const sessions = await response.json();
    return { sessions };
  }

  /**
   * @description Get worker metrics
   */
  async getMetrics(): Promise<{ metrics: unknown }> {
    const url = new URL(`${this.baseUrl}/metrics`);
    if (this.token) {
      url.searchParams.append("token", this.token);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      let errorMessage =
        `Browserless API failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage += `. Details: ${JSON.stringify(errorData)}`;
      } catch (_) {
        // Ignore JSON parsing error
      }
      throw new Error(errorMessage);
    }

    const metrics = await response.json();
    return { metrics };
  }

  /**
   * @description Get configuration info
   */
  async getConfig(): Promise<{ config: unknown }> {
    const url = new URL(`${this.baseUrl}/config`);
    if (this.token) {
      url.searchParams.append("token", this.token);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      let errorMessage =
        `Browserless API failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage += `. Details: ${JSON.stringify(errorData)}`;
      } catch (_) {
        // Ignore JSON parsing error
      }
      throw new Error(errorMessage);
    }

    const config = await response.json();
    return { config };
  }
}
