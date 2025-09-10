import slugify from "slugify";
import { nanoid } from "nanoid";

export function slugifyWithNanoid(string: string, postfixLength: number) {
    return `${slugify(string)}-${nanoid(postfixLength)}`;
}