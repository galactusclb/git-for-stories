export const AUTH = {
    COOKIES: {
        ACCESS_TOKEN: 'access_token',
        REFRESH_TOKEN: 'refresh_token',
    },
    QUERY_PARAMS: {
        RETURN_TO: 'returnTo',
    },
} as const;

export const PROXY_HEADERS = {
    PATHNAME: 'x-pathname',
    SEARCH: 'x-search',
} as const;
