import { Request } from "express";

/**
 * Create an object composed of the picked object properties
 * @param {Request} object
 * @param {string[]} keys
 * @returns {Object}
 */
const pick = (object: Request, keys: string[]): object => {
  const pickedEntries = Object.entries(object).filter(([key]) =>
    keys.includes(key)
  );
  return Object.fromEntries(pickedEntries);
};

export default pick;
