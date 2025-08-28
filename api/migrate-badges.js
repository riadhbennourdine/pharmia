import dotenv from 'dotenv';
dotenv.config({ path: './api/.env' });

import { connectToServer, getDb, closeDb } from './db.js';

const badges = [
    {
      id: 'badge-1',
      name: 'Premier Pas',
      description: 'Vous avez lu votre première mémofiche !',
      icon: 'FiAward'
    },
    {
      id: 'badge-2',
      name: 'Curieux',
      description: 'Vous avez lu 5 mémofiches.',
      icon: 'FiSearch'
    },
    {
      id: 'badge-3',
      name: 'Apprenti Sorcier',
      description: 'Vous avez complété votre premier quiz.',
      icon: 'FiStar'
    }
  ];

async function migrateBadges() {
  try {
    await connectToServer();
    const db = getDb();
    const badgesCollection = db.collection('badges');

    // Optional: Clear existing badges to avoid duplicates
    await badgesCollection.deleteMany({});

    const result = await badgesCollection.insertMany(badges);
    console.log(`${result.insertedCount} badges have been added to the database.`);

  } catch (err) {
    console.error('Error during badge migration:', err);
  } finally {
    await closeDb();
  }
}

migrateBadges();
