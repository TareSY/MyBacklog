import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, lists, items } from './src/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const POPULAR_MOVIES = [
    { title: 'The Godfather', year: 1972, desc: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.' },
    { title: 'Inception', year: 2010, desc: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.' },
    { title: 'The Dark Knight', year: 2008, desc: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.' },
    { title: 'Pulp Fiction', year: 1994, desc: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.' },
    { title: 'Interstellar', year: 2014, desc: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.' },
    { title: 'Spirited Away', year: 2001, desc: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.' },
    { title: 'Parasite', year: 2019, desc: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.' },
];

const POPULAR_BOOKS = [
    { title: 'Dune', year: 1965, author: 'Frank Herbert', desc: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the "spice" melange.' },
    { title: '1984', year: 1949, author: 'George Orwell', desc: 'Among the seminal texts of the 20th century, Nineteen Eighty-Four is a rare work that grows more haunting as its futuristic purgatory becomes more real.' },
    { title: 'The Hobbit', year: 1937, author: 'J.R.R. Tolkien', desc: 'Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, rarely traveling further than the pantry of his hobbit-hole in Bag End.' },
    { title: 'Project Hail Mary', year: 2021, author: 'Andy Weir', desc: 'Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself will perish.' },
];

async function seed() {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);

    console.log('🌱 Seeding popular items...');

    // 1. Create System User
    const systemEmail = 'system@mybacklog.app';
    let [systemUser] = await db.select().from(users).where(eq(users.email, systemEmail));

    if (!systemUser) {
        const hashedPassword = await bcrypt.hash('system-password-do-not-use', 10);
        [systemUser] = await db.insert(users).values({
            email: systemEmail,
            name: 'Curator',
            username: 'curator',
            password: hashedPassword,
        }).returning();
        console.log('Created System User');
    }

    // 2. Create Global Lists
    const [movieList] = await db.insert(lists).values({
        userId: systemUser.id,
        name: 'Featured Movies',
        isPublic: true,
        description: 'A collection of must-watch films.',
    }).returning();

    const [bookList] = await db.insert(lists).values({
        userId: systemUser.id,
        name: 'Featured Books',
        isPublic: true,
        description: 'Essential reading.',
    }).returning();

    console.log('Created Featured Lists');

    // 3. Add Items
    for (const m of POPULAR_MOVIES) {
        await db.insert(items).values({
            listId: movieList.id,
            categoryId: 1, // Movies
            title: m.title,
            releaseYear: m.year,
            description: m.desc,
            externalSource: 'seed',
        });
    }

    for (const b of POPULAR_BOOKS) {
        await db.insert(items).values({
            listId: bookList.id,
            categoryId: 3, // Books
            title: b.title,
            subtitle: b.author,
            releaseYear: b.year,
            description: b.desc,
            externalSource: 'seed',
        });
    }

    console.log('✅ Popular items seeded!');
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
});
