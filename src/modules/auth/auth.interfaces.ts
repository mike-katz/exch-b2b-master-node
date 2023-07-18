export interface IRegisterBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  captchaToken: string;
  authType: string;
}

export interface ILoginBody {
  email?: string;
  mobileNo?: string;
  countryCode?: string;
  password: string;
  captchaToken: string;
}
