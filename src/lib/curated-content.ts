// Curated top entertainment picks from 2000 to present
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
        // 2020s
        { title: "Oppenheimer", year: 2023, subtitle: "Christopher Nolan" },
        { title: "Everything Everywhere All at Once", year: 2022, subtitle: "Daniels" },
        { title: "Dune", year: 2021, subtitle: "Denis Villeneuve" },
        { title: "Barbie", year: 2023, subtitle: "Greta Gerwig" },
        { title: "Parasite", year: 2019, subtitle: "Bong Joon-ho" },
        // 2010s
        { title: "Spider-Man: Into the Spider-Verse", year: 2018, subtitle: "Bob Persichetti" },
        { title: "Get Out", year: 2017, subtitle: "Jordan Peele" },
        { title: "La La Land", year: 2016, subtitle: "Damien Chazelle" },
        { title: "Mad Max: Fury Road", year: 2015, subtitle: "George Miller" },
        { title: "Interstellar", year: 2014, subtitle: "Christopher Nolan" },
        { title: "The Social Network", year: 2010, subtitle: "David Fincher" },
        { title: "Inception", year: 2010, subtitle: "Christopher Nolan" },
        { title: "The Dark Knight", year: 2008, subtitle: "Christopher Nolan" },
        { title: "No Country for Old Men", year: 2007, subtitle: "Coen Brothers" },
        { title: "There Will Be Blood", year: 2007, subtitle: "Paul Thomas Anderson" },
        // 2000s
        { title: "The Lord of the Rings: Return of the King", year: 2003, subtitle: "Peter Jackson" },
        { title: "Spirited Away", year: 2001, subtitle: "Hayao Miyazaki" },
        { title: "Amélie", year: 2001, subtitle: "Jean-Pierre Jeunet" },
        { title: "Gladiator", year: 2000, subtitle: "Ridley Scott" },
        { title: "Memento", year: 2000, subtitle: "Christopher Nolan" },
    ],
    tv: [
        // 2020s
        { title: "The Bear", year: 2022, subtitle: "FX" },
        { title: "Severance", year: 2022, subtitle: "Apple TV+" },
        { title: "Squid Game", year: 2021, subtitle: "Netflix" },
        { title: "Ted Lasso", year: 2020, subtitle: "Apple TV+" },
        { title: "The Last of Us", year: 2023, subtitle: "HBO" },
        { title: "Shogun", year: 2024, subtitle: "FX" },
        // 2010s
        { title: "Succession", year: 2018, subtitle: "HBO" },
        { title: "Stranger Things", year: 2016, subtitle: "Netflix" },
        { title: "Chernobyl", year: 2019, subtitle: "HBO" },
        { title: "Fleabag", year: 2016, subtitle: "BBC" },
        { title: "Game of Thrones", year: 2011, subtitle: "HBO" },
        { title: "Black Mirror", year: 2011, subtitle: "Channel 4" },
        // 2000s
        { title: "Breaking Bad", year: 2008, subtitle: "AMC" },
        { title: "The Wire", year: 2002, subtitle: "HBO" },
        { title: "The Office (US)", year: 2005, subtitle: "NBC" },
        { title: "Lost", year: 2004, subtitle: "ABC" },
        { title: "The Sopranos", year: 1999, subtitle: "HBO" },
        { title: "Arrested Development", year: 2003, subtitle: "Fox" },
        { title: "Avatar: The Last Airbender", year: 2005, subtitle: "Nickelodeon" },
        { title: "Mad Men", year: 2007, subtitle: "AMC" },
    ],
    books: [
        // 2020s
        { title: "Fourth Wing", year: 2023, subtitle: "Rebecca Yarros" },
        { title: "Tomorrow, and Tomorrow, and Tomorrow", year: 2022, subtitle: "Gabrielle Zevin" },
        { title: "Project Hail Mary", year: 2021, subtitle: "Andy Weir" },
        { title: "The Midnight Library", year: 2020, subtitle: "Matt Haig" },
        // 2010s
        { title: "Where the Crawdads Sing", year: 2018, subtitle: "Delia Owens" },
        { title: "Circe", year: 2018, subtitle: "Madeline Miller" },
        { title: "The Seven Husbands of Evelyn Hugo", year: 2017, subtitle: "Taylor Jenkins Reid" },
        { title: "A Court of Thorns and Roses", year: 2015, subtitle: "Sarah J. Maas" },
        { title: "The Martian", year: 2014, subtitle: "Andy Weir" },
        { title: "Gone Girl", year: 2012, subtitle: "Gillian Flynn" },
        { title: "Ready Player One", year: 2011, subtitle: "Ernest Cline" },
        { title: "The Fault in Our Stars", year: 2012, subtitle: "John Green" },
        // 2000s
        { title: "The Hunger Games", year: 2008, subtitle: "Suzanne Collins" },
        { title: "Twilight", year: 2005, subtitle: "Stephenie Meyer" },
        { title: "The Kite Runner", year: 2003, subtitle: "Khaled Hosseini" },
        { title: "The Da Vinci Code", year: 2003, subtitle: "Dan Brown" },
        { title: "Life of Pi", year: 2001, subtitle: "Yann Martel" },
        { title: "A Song of Ice and Fire", year: 1996, subtitle: "George R.R. Martin" },
        { title: "Harry Potter and the Sorcerer's Stone", year: 1997, subtitle: "J.K. Rowling" },
        { title: "The Name of the Wind", year: 2007, subtitle: "Patrick Rothfuss" },
    ],
    music: [
        // 2020s
        { title: "1989 (Taylor's Version)", year: 2023, subtitle: "Taylor Swift" },
        { title: "Renaissance", year: 2022, subtitle: "Beyoncé" },
        { title: "30", year: 2021, subtitle: "Adele" },
        { title: "Future Nostalgia", year: 2020, subtitle: "Dua Lipa" },
        { title: "Midnights", year: 2022, subtitle: "Taylor Swift" },
        { title: "SOS", year: 2022, subtitle: "SZA" },
        // 2010s
        { title: "When We All Fall Asleep, Where Do We Go?", year: 2019, subtitle: "Billie Eilish" },
        { title: "Astroworld", year: 2018, subtitle: "Travis Scott" },
        { title: "DAMN.", year: 2017, subtitle: "Kendrick Lamar" },
        { title: "Lemonade", year: 2016, subtitle: "Beyoncé" },
        { title: "To Pimp a Butterfly", year: 2015, subtitle: "Kendrick Lamar" },
        { title: "Random Access Memories", year: 2013, subtitle: "Daft Punk" },
        { title: "Channel Orange", year: 2012, subtitle: "Frank Ocean" },
        { title: "21", year: 2011, subtitle: "Adele" },
        // 2000s
        { title: "good kid, m.A.A.d city", year: 2012, subtitle: "Kendrick Lamar" },
        { title: "My Beautiful Dark Twisted Fantasy", year: 2010, subtitle: "Kanye West" },
        { title: "Back to Black", year: 2006, subtitle: "Amy Winehouse" },
        { title: "The College Dropout", year: 2004, subtitle: "Kanye West" },
        { title: "Is This It", year: 2001, subtitle: "The Strokes" },
        { title: "Kid A", year: 2000, subtitle: "Radiohead" },
    ],
    games: [
        // 2020s
        { title: "Baldur's Gate 3", year: 2023, subtitle: "Larian Studios" },
        { title: "Elden Ring", year: 2022, subtitle: "FromSoftware" },
        { title: "The Legend of Zelda: Tears of the Kingdom", year: 2023, subtitle: "Nintendo" },
        { title: "God of War Ragnarök", year: 2022, subtitle: "Santa Monica Studio" },
        { title: "Hades", year: 2020, subtitle: "Supergiant Games" },
        // 2010s
        { title: "Red Dead Redemption 2", year: 2018, subtitle: "Rockstar Games" },
        { title: "The Legend of Zelda: Breath of the Wild", year: 2017, subtitle: "Nintendo" },
        { title: "The Witcher 3: Wild Hunt", year: 2015, subtitle: "CD Projekt Red" },
        { title: "Hollow Knight", year: 2017, subtitle: "Team Cherry" },
        { title: "Celeste", year: 2018, subtitle: "Extremely OK Games" },
        { title: "Dark Souls", year: 2011, subtitle: "FromSoftware" },
        { title: "Minecraft", year: 2011, subtitle: "Mojang" },
        { title: "The Last of Us", year: 2013, subtitle: "Naughty Dog" },
        { title: "Skyrim", year: 2011, subtitle: "Bethesda" },
        // 2000s
        { title: "Portal 2", year: 2011, subtitle: "Valve" },
        { title: "Mass Effect 2", year: 2010, subtitle: "BioWare" },
        { title: "Bioshock", year: 2007, subtitle: "Irrational Games" },
        { title: "Half-Life 2", year: 2004, subtitle: "Valve" },
        { title: "Shadow of the Colossus", year: 2005, subtitle: "Team Ico" },
        { title: "World of Warcraft", year: 2004, subtitle: "Blizzard" },
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
