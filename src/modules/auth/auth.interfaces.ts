export interface IRegisterBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  captchaToken: string;
  authType: string;
}

export interface ILoginBody {
  username: string; 
  password: string;
 
}
