// Curated top entertainment picks for the past 10 years (2015-2024)
// These are suggestions for users to add to their lists

export interface CuratedItem {
    title: string;
    year: number;
    subtitle?: string;
    imageUrl?: string;
}

export interface CuratedCategory {
    movies: CuratedItem[];
    tv: CuratedItem[];
    books: CuratedItem[];
    music: CuratedItem[];
    games: CuratedItem[];
}

export const curatedContent: CuratedCategory = {
    movies: [
        { title: "Oppenheimer", year: 2023, subtitle: "Christopher Nolan" },
        { title: "Everything Everywhere All at Once", year: 2022, subtitle: "Daniels" },
        { title: "Dune", year: 2021, subtitle: "Denis Villeneuve" },
        { title: "Parasite", year: 2019, subtitle: "Bong Joon-ho" },
        { title: "Spider-Man: Into the Spider-Verse", year: 2018, subtitle: "Bob Persichetti" },
        { title: "Get Out", year: 2017, subtitle: "Jordan Peele" },
        { title: "La La Land", year: 2016, subtitle: "Damien Chazelle" },
        { title: "Mad Max: Fury Road", year: 2015, subtitle: "George Miller" },
        { title: "Interstellar", year: 2014, subtitle: "Christopher Nolan" },
        { title: "Barbie", year: 2023, subtitle: "Greta Gerwig" },
    ],
    tv: [
        { title: "The Bear", year: 2022, subtitle: "FX" },
        { title: "Severance", year: 2022, subtitle: "Apple TV+" },
        { title: "Squid Game", year: 2021, subtitle: "Netflix" },
        { title: "Ted Lasso", year: 2020, subtitle: "Apple TV+" },
        { title: "Succession", year: 2018, subtitle: "HBO" },
        { title: "Stranger Things", year: 2016, subtitle: "Netflix" },
        { title: "Game of Thrones", year: 2011, subtitle: "HBO" },
        { title: "Breaking Bad", year: 2008, subtitle: "AMC" },
        { title: "The Last of Us", year: 2023, subtitle: "HBO" },
        { title: "Shogun", year: 2024, subtitle: "FX" },
    ],
    books: [
        { title: "Fourth Wing", year: 2023, subtitle: "Rebecca Yarros" },
        { title: "Tomorrow, and Tomorrow, and Tomorrow", year: 2022, subtitle: "Gabrielle Zevin" },
        { title: "Project Hail Mary", year: 2021, subtitle: "Andy Weir" },
        { title: "The Midnight Library", year: 2020, subtitle: "Matt Haig" },
        { title: "Where the Crawdads Sing", year: 2018, subtitle: "Delia Owens" },
        { title: "Circe", year: 2018, subtitle: "Madeline Miller" },
        { title: "The Seven Husbands of Evelyn Hugo", year: 2017, subtitle: "Taylor Jenkins Reid" },
        { title: "A Court of Thorns and Roses", year: 2015, subtitle: "Sarah J. Maas" },
        { title: "The Martian", year: 2014, subtitle: "Andy Weir" },
        { title: "Gone Girl", year: 2012, subtitle: "Gillian Flynn" },
    ],
    music: [
        { title: "1989 (Taylor's Version)", year: 2023, subtitle: "Taylor Swift" },
        { title: "Renaissance", year: 2022, subtitle: "Beyoncé" },
        { title: "30", year: 2021, subtitle: "Adele" },
        { title: "Future Nostalgia", year: 2020, subtitle: "Dua Lipa" },
        { title: "When We All Fall Asleep, Where Do We Go?", year: 2019, subtitle: "Billie Eilish" },
        { title: "Astroworld", year: 2018, subtitle: "Travis Scott" },
        { title: "DAMN.", year: 2017, subtitle: "Kendrick Lamar" },
        { title: "Lemonade", year: 2016, subtitle: "Beyoncé" },
        { title: "To Pimp a Butterfly", year: 2015, subtitle: "Kendrick Lamar" },
        { title: "Random Access Memories", year: 2013, subtitle: "Daft Punk" },
    ],
    games: [
        { title: "Baldur's Gate 3", year: 2023, subtitle: "Larian Studios" },
        { title: "Elden Ring", year: 2022, subtitle: "FromSoftware" },
        { title: "Hades", year: 2020, subtitle: "Supergiant Games" },
        { title: "The Legend of Zelda: Tears of the Kingdom", year: 2023, subtitle: "Nintendo" },
        { title: "God of War Ragnarök", year: 2022, subtitle: "Santa Monica Studio" },
        { title: "Red Dead Redemption 2", year: 2018, subtitle: "Rockstar Games" },
        { title: "The Legend of Zelda: Breath of the Wild", year: 2017, subtitle: "Nintendo" },
        { title: "The Witcher 3: Wild Hunt", year: 2015, subtitle: "CD Projekt Red" },
        { title: "Celeste", year: 2018, subtitle: "Extremely OK Games" },
        { title: "Hollow Knight", year: 2017, subtitle: "Team Cherry" },
    ],
};

// Helper to get items for a specific category
export function getCuratedItems(category: keyof CuratedCategory): CuratedItem[] {
    return curatedContent[category] || [];
}

// Get categoryId to category key mapping
export const categoryIdToKey: Record<number, keyof CuratedCategory> = {
    1: 'movies',
    2: 'tv',
    3: 'books',
    4: 'music',
    5: 'games',
};
