import pino from 'pino';

type LogData = Record<string, unknown>;

const _pino = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
});

export const logger = {
    debug: (msg: string, data?: LogData) => _pino.debug(data ?? {}, msg),
    info: (msg: string, data?: LogData) => _pino.info(data ?? {}, msg),
    warn: (msg: string, data?: LogData) => _pino.warn(data ?? {}, msg),
    error: (msg: string, data?: LogData) => _pino.error(data ?? {}, msg),
    child: (bindings: LogData) => _pino.child(bindings),
};
