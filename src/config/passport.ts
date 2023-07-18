import FacebookTokenStrategy, {
  Profile,
  ValueObject,
  VerifyFunction,
} from "passport-facebook-token";
import { Strategy as GoogleStrategy } from "passport-google-token";
import {
  ExtractJwt,
  Strategy as JwtStrategy,
  VerifiedCallback,
} from "passport-jwt";

import { User } from "@/models";
import { IPayload } from "@/types/token.interfaces";
import { User as IUser } from "@/types/user.interfaces";
import messages from "@/utils/messages";

import pConfig from "./config";
import tokenTypes from "./tokens";

const jwtOptions = {
  secretOrKey: pConfig.jwt.secret,
  jwtFromRequest: ExtractJwt.fromHeader("access_token"),
};

const googleOptions = {
  clientID: pConfig.google.id,
  clientSecret: pConfig.google.secret,
};

const facebookOptions = {
  clientID: pConfig.facebook.id,
  clientSecret: pConfig.facebook.secret,
  profileFields: ["id", "emails", "name"],
  fbGraphVersion: "v17.0",
};

interface GoogleProfileJson {
  given_name: string;
  family_name: string;
  email: string;
}
interface GoogleProfile extends Profile {
  provider: string;
  id: string;
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
    middleName: string;
  };
  gender: string;
  emails: ValueObject[];
  photos: ValueObject[];
  _raw: string;
  _json: GoogleProfileJson;
}

const googleCallBack = async (
  accessToken: string,
  refreshToken: string,
  profile: GoogleProfile,
  done: (error: Error | string | null, user?: unknown, info?: unknown) => void
): Promise<void> => {
  const { _json } = profile;
  const { given_name: firstName, family_name: lastName, email } = _json;
  const { id } = profile;
  if (email) {
    const userData = {
      firstName,
      lastName,
      email,
      googleId: id,
    };
    return done(null, userData);
  }
  return done(messages.auth.EMAIL_NOT_FOUND, false);
};

interface FacebookProfileJson {
  first_name: string;
  last_name: string;
  email: string;
}

type FacebookProfile = GoogleProfile & { _json: FacebookProfileJson };

const facebookCallBack: VerifyFunction = (
  accessToken: string,
  refreshToken: string,
  profile: FacebookProfile,
  // done: (error: Error | string | null, user?: unknown) => void
  done: (error: Error | string | null, user?: unknown, info?: unknown) => void
): void => {
  const { _json } = profile;
  const { first_name, last_name, email } = _json;
  const { id } = profile;

  if (email) {
    const userData = {
      firstName: first_name,
      lastName: last_name,
      email,
      facebookId: id,
    };

    return done(null, userData);
  }
  return done(messages.auth.EMAIL_NOT_FOUND, false);
};

const verifiedCallback = (
  done: VerifiedCallback,
  firstArg: null | Error,
  secondArg: boolean | IUser
): void => done(firstArg, secondArg);

const jwtVerify = (payload: IPayload, done: VerifiedCallback): void => {
  if (payload.type !== tokenTypes.ACCESS) {
    throw new Error("Invalid token type");
  }
  User.findOne({ _id: payload.sub, isDeleted: false })
    .then(user => {
      if (!user) {
        return verifiedCallback(done, null, false);
      }
      return verifiedCallback(done, null, user);
    })
    .catch((error: Error) => verifiedCallback(done, error, false));
};
const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const googleStrategy = new GoogleStrategy(googleOptions, googleCallBack);
const facebookTokenStrategy = new FacebookTokenStrategy(
  facebookOptions,
  facebookCallBack
);

export { facebookTokenStrategy, googleStrategy, jwtStrategy };
