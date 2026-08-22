import neo4j, { Driver } from 'neo4j-driver';

import { constants } from '@/utils/constant';

import { logger } from '../logger';

let driver: Driver | null = null;

export function getNeo4jDriver(): Driver {
    if (!driver) {
        const { uri, username, password } = constants.neo4j;
        driver = neo4j.driver(uri!, neo4j.auth.basic(username!, password!));
    }

    return driver;
}

export async function closeNeo4jDriver(): Promise<void> {
    await driver?.close();
    driver = null;
}

const CONSTRAINTS = [
    `CREATE CONSTRAINT story_id_unique IF NOT EXISTS
     FOR (s:Story) REQUIRE s.id IS UNIQUE`,

    `CREATE CONSTRAINT scene_id_unique IF NOT EXISTS
     FOR (s:Scene) REQUIRE (s.storyId, ,s.id) IS UNIQUE`,

    `CREATE CONSTRAINT event_id_unique IF NOT EXISTS
     FOR (e:Event) REQUIRE (e.storyId, e.id) IS UNIQUE`,

    `CREATE CONSTRAINT character_story_name_unique IF NOT EXISTS
     FOR (c:Character) REQUIRE (c.storyId, c.name) IS UNIQUE`,
];

export async function applyNeo4jSchema(): Promise<void> {
    const session = getNeo4jDriver().session();

    try {
        for (const statement of CONSTRAINTS) {
            await session.run(statement);
            logger.info('neo4j schema applied', { count: CONSTRAINTS.length });
        }
    } finally {
        await session.close();
    }
}
