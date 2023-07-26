enum userEmailVarification {
  LINK = "LINK",
  OTP = "OTP",
}

enum userPlatform {
  APP = "app",
  ANDROID = "android",
  IOS = "ios",
  WEB = "web",
}

// const socialLoginTypes = ["google", "facebook", "apple"];
const socialLoginTypes = {
  google: "google",
  facebook: "facebook",
  apple: "apple",
};

const userStatus= {
  active: "active",
  suspend: "suspend",
  locked: "locked",
};


export { socialLoginTypes, userEmailVarification, userPlatform,userStatus };
