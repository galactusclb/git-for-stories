import sanitizeHtml from 'sanitize-html';
import z from 'zod';

const trimmedString = z.string().trim();

const optionalText = trimmedString.transform((val) => (val === '' ? null : val));

const normalizedEmail = trimmedString.email().toLowerCase();

const intFromAny = z.coerce.number().int();

const DEFAULT_SANITIZE_OPTS: sanitizeHtml.IOptions = {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br'],
    allowedAttributes: {
        a: ['href', 'name', 'target'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
};

const sanitize = (values: string, opt = DEFAULT_SANITIZE_OPTS) => sanitizeHtml(values ?? '', opt);

const sanitizeText = trimmedString.min(1).transform((val) => sanitize(val));

export { trimmedString, optionalText, normalizedEmail, intFromAny, sanitize, sanitizeText };
