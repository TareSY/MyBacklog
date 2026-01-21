export const TOP_GAMES = [
    // Action/Adventure
    { title: 'The Legend of Zelda: Breath of the Wild', year: 2017, platform: 'Nintendo Switch' },
    { title: 'The Legend of Zelda: Tears of the Kingdom', year: 2023, platform: 'Nintendo Switch' },
    { title: 'The Legend of Zelda: Ocarina of Time', year: 1998, platform: 'Nintendo 64' },
    { title: 'The Witcher 3: Wild Hunt', year: 2015, platform: 'Multi-platform' },
    { title: 'Red Dead Redemption 2', year: 2018, platform: 'Multi-platform' },
    { title: 'Red Dead Redemption', year: 2010, platform: 'Multi-platform' },
    { title: 'God of War', year: 2018, platform: 'PlayStation' },
    { title: 'God of War Ragnar\u00f6k', year: 2022, platform: 'PlayStation' },
    { title: 'Elden Ring', year: 2022, platform: 'Multi-platform' },
    { title: 'Dark Souls', year: 2011, platform: 'Multi-platform' },
    { title: 'Dark Souls III', year: 2016, platform: 'Multi-platform' },
    { title: 'Bloodborne', year: 2015, platform: 'PlayStation' },
    { title: 'Sekiro: Shadows Die Twice', year: 2019, platform: 'Multi-platform' },
    { title: 'Ghost of Tsushima', year: 2020, platform: 'PlayStation' },
    { title: 'Horizon Zero Dawn', year: 2017, platform: 'Multi-platform' },
    { title: 'Horizon Forbidden West', year: 2022, platform: 'PlayStation' },
    { title: 'Spider-Man', year: 2018, platform: 'PlayStation' },
    { title: 'Spider-Man: Miles Morales', year: 2020, platform: 'PlayStation' },
    { title: 'Spider-Man 2', year: 2023, platform: 'PlayStation' },
    { title: 'The Last of Us', year: 2013, platform: 'PlayStation' },
    { title: 'The Last of Us Part II', year: 2020, platform: 'PlayStation' },
    { title: 'Death Stranding', year: 2019, platform: 'Multi-platform' },
    { title: 'Hades', year: 2020, platform: 'Multi-platform' },
    { title: 'Hades II', year: 2024, platform: 'Multi-platform' },
    { title: 'Hollow Knight', year: 2017, platform: 'Multi-platform' },
    { title: 'Celeste', year: 2018, platform: 'Multi-platform' },

    // RPGs
    { title: 'Final Fantasy VII', year: 1997, platform: 'PlayStation' },
    { title: 'Final Fantasy VII Remake', year: 2020, platform: 'PlayStation' },
    { title: 'Persona 5 Royal', year: 2020, platform: 'Multi-platform' },
    { title: 'Mass Effect 2', year: 2010, platform: 'Multi-platform' },
    { title: 'Baldur\'s Gate 3', year: 2023, platform: 'Multi-platform' },
    { title: 'Cyberpunk 2077', year: 2020, platform: 'Multi-platform' },
    { title: 'Skyrim', year: 2011, platform: 'Multi-platform' },

    // Shooters & Multiplayer
    { title: 'Half-Life 2', year: 2004, platform: 'PC' },
    { title: 'Portal 2', year: 2011, platform: 'Multi-platform' },
    { title: 'Doom Eternal', year: 2020, platform: 'Multi-platform' },
    { title: 'Call of Duty: Modern Warfare 2', year: 2009, platform: 'Multi-platform' },
    { title: 'Overwatch 2', year: 2022, platform: 'Multi-platform' },
    { title: 'Valorant', year: 2020, platform: 'PC' },
    { title: 'Counter-Strike 2', year: 2023, platform: 'PC' },
    { title: 'League of Legends', year: 2009, platform: 'PC' },
    { title: 'Dota 2', year: 2013, platform: 'PC' },
    { title: 'Apex Legends', year: 2019, platform: 'Multi-platform' },
    { title: 'Fortnite', year: 2017, platform: 'Multi-platform' },
    { title: 'Minecraft', year: 2011, platform: 'Multi-platform' },
    { title: 'Terraria', year: 2011, platform: 'Multi-platform' },
    { title: 'Stardew Valley', year: 2016, platform: 'Multi-platform' },
    { title: 'Grand Theft Auto V', year: 2013, platform: 'Multi-platform' },
    { title: 'Grand Theft Auto: San Andreas', year: 2004, platform: 'Multi-platform' },
];

export function getFullGameList() {
    // Basic generator logic recovered
    const moreGames: typeof TOP_GAMES = [];
    const seriesWithSequels = [
        { base: 'Call of Duty', count: 20, startYear: 2003, platform: 'Multi-platform' },
        { base: 'Battlefield', count: 10, startYear: 2002, platform: 'Multi-platform' },
        { base: 'FIFA', count: 25, startYear: 2000, platform: 'Multi-platform' },
        { base: 'Madden NFL', count: 25, startYear: 2000, platform: 'Multi-platform' },
        { base: 'NBA 2K', count: 25, startYear: 2000, platform: 'Multi-platform' },
        { base: 'Final Fantasy', count: 16, startYear: 1987, platform: 'Multi-platform' },
        { base: 'Assassin\'s Creed', count: 15, startYear: 2007, platform: 'Multi-platform' },
        { base: 'Resident Evil', count: 10, startYear: 1996, platform: 'Multi-platform' },
        { base: 'The Sims', count: 4, startYear: 2000, platform: 'PC' },
        { base: 'Civilization', count: 6, startYear: 1991, platform: 'PC' },
        { base: 'Street Fighter', count: 6, startYear: 1987, platform: 'Multi-platform' },
        { base: 'Tekken', count: 8, startYear: 1994, platform: 'Multi-platform' },
        { base: 'Mortal Kombat', count: 11, startYear: 1992, platform: 'Multi-platform' },
        { base: 'Mario Party', count: 12, startYear: 1998, platform: 'Nintendo' },
    ];

    for (const series of seriesWithSequels) {
        for (let i = 1; i <= series.count; i++) {
            moreGames.push({
                title: `${series.base} ${i > 1 ? i : ''}`.trim(),
                year: series.startYear + i - 1,
                platform: series.platform,
            });
        }
    }

    return [...TOP_GAMES, ...moreGames];
}
