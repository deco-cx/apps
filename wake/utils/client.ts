type UserAuthenticate = {
  Cpf: string;
  CustomerAccessToken: string;
  Email: string;
  HasFirstPurchase: boolean;
  Id: string;
  Name: string;
  PhoneNumber: string;
  Type: number;
};

export interface CheckoutApi {
  "GET /api/Login/Get": {
    response: UserAuthenticate;
  };
}
