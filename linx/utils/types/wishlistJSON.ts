export interface AddToWishlistResponse {
    RequireLogin:    boolean;
    ServiceResponse: ServiceResponse;
}

export interface ServiceResponse {
    Data:               Data;
    ContentType:        null;
    SerializerSettings: null;
    StatusCode:         null;
    Value:              null;
}

export interface Data {
    IsValid:          boolean;
    InputErrors:      unknown[];
    Keys:             unknown[];
    Errors:           unknown[];
    Warnings:         unknown[];
    IsNew:            boolean;
    IsDelete:         boolean;
    IsEdit:           boolean;
    Success:          string;
    HasWarnings:      boolean;
    HasGenericErrors: boolean;
    HasInputErrors:   boolean;
    Redirect:         string;
    RedirectTimeout:  number;
    Custom:           Custom;
}

export interface Custom {
}
