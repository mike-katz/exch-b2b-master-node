/**
 * A mongoose schema plugin which applies the following in the toJSON transform call:
 *  - removes __v, createdAt, updatedAt, and any path that has private: true
 *  - replaces _id with id
 */

import mongoose, { Document } from "mongoose";

type AnyObject = { [key: string]: unknown };

const deleteAtPath = (obj: AnyObject, path: string[], index: number): void => {
  if (index === path.length - 1) {
    delete obj[path[index]];
    return;
  }
  const deleteObj = obj[path[index]] as AnyObject;
  deleteAtPath(deleteObj, path, index + 1);
};
type transformFunc = (
  doc: Document,
  ret: Record<string, unknown>,
  options: Record<string, unknown>
) => unknown;

interface ToJSONOptions {
  transform?: transformFunc;
}

interface ToJSON {
  toJSON?: ToJSONOptions;
}

interface PathOptions {
  options?: {
    private?: boolean;
  };
}

interface Path {
  [path: string]: PathOptions;
}

interface Items {
  options?: ToJSON;
  paths: Path;
}

const toJSON = (items: Items): void => {
  let transform: transformFunc;
  if (items?.options?.toJSON && items.options.toJSON.transform) {
    transform = items.options.toJSON.transform;
  }
  if (items.options) {
    items.options.toJSON =
      items?.options?.toJSON &&
      Object.assign(items?.options?.toJSON || {}, {
        transform(
          doc: Document,
          ret: Record<string, unknown>,
          options: Record<string, unknown>
        ) {
          Object.keys(items.paths).forEach((path: string) => {
            if (items?.paths[path]?.options?.private) {
              deleteAtPath(ret, path.split("."), 0);
            }
          });
          const id = ret._id as mongoose.Types.ObjectId;
          ret.id = id.toString();
          delete ret._id;
          delete ret.__v;
          /* delete ret.createdAt;
      delete ret.updatedAt; */
          if (transform) {
            return transform(doc, ret, options);
          }
        },
      });
  }
};

export default toJSON;

/*
eslint
  no-param-reassign: "off",
  no-underscore-dangle: "off",
  consistent-return: "off",
*/
