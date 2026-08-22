import neo4j, { Integer } from 'neo4j-driver';

export function neo4jParseToInt(inpit: string | number): Integer {
    return neo4j.int(inpit);
}
