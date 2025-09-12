import slugify from "slugify";
import { nanoid } from "nanoid";

export const NANOID_POSTFIX_LENGTH = 8;

export function slugifyWithNanoid(string: string, postfixLength: number = NANOID_POSTFIX_LENGTH) {
    return `${slugify(string)}-${nanoid(postfixLength)}`;
}