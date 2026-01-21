
import 'dotenv/config';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { SearchContext } from '@/lib/strategies/search-strategy';
import { RecommendationEngine } from '@/lib/strategies/recommendation-strategy';
import { ItemStrategyContext } from '@/lib/strategies/item-strategy';

async function main() {
    console.log('🧪 Starting Pattern Verification...\n');

    // 1. Verify Item Strategy (Validation)
    console.log('1. Testing Item Strategy...');
    const gameStrategy = ItemStrategyContext.getStrategy(5); // Games
    try {
        gameStrategy.validate({ title: 'Test Game', categoryId: 5, listId: 'xyz' });
        console.log('   ✅ Validation passed for valid input');
    } catch (e: any) {
        console.error('   ❌ Validation failed unexpectedly:', e.message);
    }

    try {
        gameStrategy.validate({ title: '', categoryId: 5 });
        console.error('   ❌ Validation SHOULD have failed for empty title');
    } catch (e: any) {
        console.log('   ✅ Validation correctly caught error:', e.message);
    }

    // 2. Verify Search Strategy
    console.log('\n2. Testing Search Strategy...');
    const searchStrategy = SearchContext.getStrategy('local');
    const searchResults = await searchStrategy.search('Zelda', 'all', 5);
    console.log(`   Found ${searchResults.length} results for "Zelda"`);
    if (searchResults.length > 0) {
        console.log(`   - First result: ${searchResults[0].title} (${searchResults[0].category})`);
    } else {
        console.log('   ⚠️ No results found. (Did you seed the DB?)');
    }

    // 3. Verify Recommendation Strategy
    console.log('\n3. Testing Recommendation Engine...');
    const [user] = await db.select().from(users).limit(1);
    if (user) {
        console.log(`   Testing for user: ${user.username}`);
        const engine = new RecommendationEngine();
        const recs = await engine.getRecommendations(user.id, 5);
        console.log(`   Generated ${recs.length} recommendations`);
        if (recs.length > 0) {
            console.log(`   - Top rec: ${recs[0].title} (Reason: ${recs[0].reason})`);
        }
    } else {
        console.log('   ⚠️ No users found to test recommendations');
    }

    console.log('\n✨ Verification Complete.');
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
