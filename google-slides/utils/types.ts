// Types for Google Slides API entities
export interface Presentation {
  presentationId: string;
  title: string;
  locale?: string;
  slides?: Slide[];
  masters?: Page[];
  layouts?: Page[];
  pageSize?: {
    width: { magnitude: number; unit: string };
    height: { magnitude: number; unit: string };
  };
}

export interface Page {
  objectId: string;
  pageType?: string;
  pageElements?: PageElement[];
}

export interface Slide extends Page {
  slideProperties?: {
    layoutObjectId?: string;
    masterObjectId?: string;
  };
}

export interface PageElement {
  objectId: string;
  size?: {
    width: { magnitude: number; unit: string };
    height: { magnitude: number; unit: string };
  };
  transform?: {
    scaleX?: number;
    scaleY?: number;
    translateX?: number;
    translateY?: number;
    unit?: string;
  };
  shape?: Shape;
  text?: TextContent;
  image?: Image;
  video?: Video;
  table?: Table;
}

export interface Shape {
  shapeType: string;
  text?: TextContent;
}

export interface TextContent {
  textElements?: {
    textRun?: {
      content: string;
      style?: TextStyle;
    };
  }[];
}

export interface Image {
  imageProperties: {
    contentUrl?: string;
  };
}

export interface Video {
  videoProperties: {
    videoId: string;
  };
}

export interface Table {
  rows: number;
  columns: number;
  tableRows?: TableRow[];
}

export interface TableRow {
  tableCells?: TableCell[];
}

export interface TableCell {
  text?: TextContent;
}

export interface TextStyle {
  foregroundColor?: {
    opaqueColor?: {
      rgbColor?: {
        red?: number;
        green?: number;
        blue?: number;
      };
    };
  };
  fontSize?: {
    magnitude: number;
    unit: string;
  };
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

// Request types
export interface BatchUpdateRequest {
  requests: Request[];
}

export interface Request {
  createSlide?: {
    objectId?: string;
    insertionIndex?: number;
    slideLayoutReference?: {
      predefinedLayout: string;
    };
  };
  insertText?: {
    objectId: string;
    insertionIndex?: number;
    text: string;
  };
  deleteText?: {
    objectId: string;
    textRange: {
      type: string;
    };
  };
  createShape?: {
    objectId?: string;
    shapeType: string;
    elementProperties: {
      pageObjectId: string;
      size?: {
        width: { magnitude: number; unit: string };
        height: { magnitude: number; unit: string };
      };
      transform?: {
        scaleX: number;
        scaleY: number;
        translateX: number;
        translateY: number;
        unit: string;
      };
    };
  };
  createImage?: {
    objectId?: string;
    url: string;
    elementProperties: {
      pageObjectId: string;
      size?: {
        width: { magnitude: number; unit: string };
        height: { magnitude: number; unit: string };
      };
      transform?: {
        scaleX: number;
        scaleY: number;
        translateX: number;
        translateY: number;
        unit: string;
      };
    };
  };
  replaceAllText?: {
    containsText: {
      text: string;
      matchCase: boolean;
    };
    replaceText: string;
  };
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
}

export interface SearchParamsGoogle {
  code: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  grant_type: string;
}
