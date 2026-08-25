import { db } from './src/db/index.ts';

async function testSearch() {
  console.log('PostgreSQL DB active:', db !== null);
}

testSearch();
