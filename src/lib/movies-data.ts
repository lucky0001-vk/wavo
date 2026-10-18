import { Movie } from '@/types';

export const CURATED_MOVIES: Movie[] = [
  {
    id: 'spirited-away',
    title: 'Spirited Away',
    overview: 'A young girl, Chihiro, becomes trapped in a strange world of spirits. After her parents are transformed into giant pigs, she must work at a magical bathhouse to find a way to free them and return home.',
    posterPath: 'https://image.tmdb.org/t/p/w780/393mhqrL0Y7ETv3v6z4f1l2LzL7.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/mSDmvq81VqT3q0T5Jj5YjW2vG2.jpg',
    releaseYear: '2001',
    runtime: 125,
    rating: 8.5,
    voteCount: 16200,
    genres: ['Animation', 'Fantasy', 'Adventure', 'Family'],
    language: 'Japanese',
    director: 'Hayao Miyazaki',
    cast: ['Rumi Hiiragi', 'Miyu Irino', 'Mari Natsuki', 'Takashi Naito'],
    trailerYoutubeId: 'ByXuk9QqQkk',
    moodMatchReason: 'A wondrous masterwork that restores childlike awe, gently melting away stress while offering an uplifting, unforgettable journey.',
    matchedMoods: ['happy', 'stressed', 'adventurous', 'nostalgic', 'surprise'],
    streamingProviders: [
      { name: 'Max', url: 'https://play.max.com' },
      { name: 'Apple TV', url: 'https://tv.apple.com' }
    ]
  },
  {
    id: 'la-la-land',
    title: 'La La Land',
    overview: 'Mia, an aspiring actress, and Sebastian, a dedicated jazz musician, struggle to make ends meet in a city known for crushing hopes and breaking hearts. As success mounts, they face decisions that fray their love affair.',
    posterPath: 'https://image.tmdb.org/t/p/w780/uDO8zWDda7RwyL65qfgnb0ms2io.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    releaseYear: '2016',
    runtime: 128,
    rating: 7.9,
    voteCount: 16800,
    genres: ['Comedy', 'Drama', 'Romance', 'Music'],
    language: 'English',
    director: 'Damien Chazelle',
    cast: ['Ryan Gosling', 'Emma Stone', 'John Legend', 'Rosemarie DeWitt'],
    trailerYoutubeId: '0pdqf4P9MB8',
    moodMatchReason: 'A bittersweet romantic spectacle filled with golden hour dreams, melodic brilliance, and honest emotional catharsis.',
    matchedMoods: ['romantic', 'sad', 'inspired', 'nostalgic'],
    streamingProviders: [
      { name: 'Netflix', url: 'https://www.netflix.com' },
      { name: 'Prime Video', url: 'https://www.amazon.com/Prime-Video' }
    ]
  },
  {
    id: 'interstellar',
    title: 'Interstellar',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    posterPath: 'https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/rAiYTsqJJR0KP8UN8vJjZ9T80E0.jpg',
    releaseYear: '2014',
    runtime: 169,
    rating: 8.4,
    voteCount: 34500,
    genres: ['Adventure', 'Drama', 'Sci-Fi'],
    language: 'English',
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    trailerYoutubeId: 'zSWdZVtXT7E',
    moodMatchReason: 'A colossal cosmic voyage that turns philosophical curiosity and existential loneliness into an awe-inspiring testament to love and survival.',
    matchedMoods: ['curious', 'adventurous', 'lonely', 'inspired'],
    streamingProviders: [
      { name: 'Paramount+', url: 'https://www.paramountplus.com' },
      { name: 'Prime Video', url: 'https://www.amazon.com/Prime-Video' }
    ]
  },
  {
    id: 'little-miss-sunshine',
    title: 'Little Miss Sunshine',
    overview: 'A family determined to get their young daughter into the finals of a beauty pageant take a cross-country trip in their quirky yellow VW bus, encountering hilarious misadventures and genuine family healing along the way.',
    posterPath: 'https://image.tmdb.org/t/p/w780/tFnTds886P94TEvppl1IBBLho4s.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/8Z8G8o1Y2rWk29r6kE47wK2r4Wk.jpg',
    releaseYear: '2006',
    runtime: 101,
    rating: 7.8,
    voteCount: 6500,
    genres: ['Comedy', 'Drama'],
    language: 'English',
    director: 'Jonathan Dayton, Valerie Faris',
    cast: ['Abigail Breslin', 'Greg Kinnear', 'Toni Collette', 'Steve Carell', 'Paul Dano'],
    trailerYoutubeId: 'wvwVkllXT80',
    moodMatchReason: 'The ultimate feel-good tonic for when you feel like an outsider or need genuine, heart-soothing laughter with endearing, dysfunctional humans.',
    matchedMoods: ['happy', 'lonely', 'stressed', 'bored'],
    streamingProviders: [
      { name: 'Hulu', url: 'https://www.hulu.com' },
      { name: 'Disney+', url: 'https://www.disneyplus.com' }
    ]
  },
  {
    id: 'her',
    title: 'Her',
    overview: 'In a near future Los Angeles, Theodore Twombly, a lonely writer recovering from a painful divorce, develops an unlikely relationship with an advanced artificial intelligence operating system designed to meet his every emotional need.',
    posterPath: 'https://image.tmdb.org/t/p/w780/yk4ss0072b2gP93G8bF91G42tZ5.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/lG7y345uQ3p1Qe97p8Yp1wFmH.jpg',
    releaseYear: '2013',
    runtime: 126,
    rating: 8.0,
    voteCount: 14200,
    genres: ['Drama', 'Romance', 'Sci-Fi'],
    language: 'English',
    director: 'Spike Jonze',
    cast: ['Joaquin Phoenix', 'Scarlett Johansson', 'Amy Adams', 'Rooney Mara'],
    trailerYoutubeId: '6QRvTv_pqVk',
    moodMatchReason: 'A tender, melancholic contemplation on intimacy, modern solitude, and the boundless vulnerability of opening your heart.',
    matchedMoods: ['lonely', 'romantic', 'sad', 'curious'],
    streamingProviders: [
      { name: 'Max', url: 'https://play.max.com' },
      { name: 'Prime Video', url: 'https://www.amazon.com/Prime-Video' }
    ]
  },
  {
    id: 'knives-out',
    title: 'Knives Out',
    overview: 'When renowned crime novelist Harlan Thrombey is found dead at his estate just after his 85th birthday, the inquisitive and debonair Detective Benoit Blanc is mysteriously enlisted to investigate.',
    posterPath: 'https://image.tmdb.org/t/p/w780/pThyQovXQrw2m0s9x82twj48Jq4.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/Ab8mkHmkYADjU7wQiOkia99GQI.jpg',
    releaseYear: '2019',
    runtime: 130,
    rating: 7.9,
    voteCount: 12500,
    genres: ['Comedy', 'Crime', 'Mystery'],
    language: 'English',
    director: 'Rian Johnson',
    cast: ['Daniel Craig', 'Ana de Armas', 'Chris Evans', 'Jamie Lee Curtis'],
    trailerYoutubeId: 'qGqiHJTsRkQ',
    moodMatchReason: 'A delicious whodunit bursting with clever reversals, colorful eccentricities, and razor-sharp entertainment that cures boredom instantly.',
    matchedMoods: ['curious', 'bored', 'happy', 'surprise'],
    streamingProviders: [
      { name: 'Netflix', url: 'https://www.netflix.com' },
      { name: 'Apple TV', url: 'https://tv.apple.com' }
    ]
  },
  {
    id: 'mad-max-fury-road',
    title: 'Mad Max: Fury Road',
    overview: 'An apocalyptic story set in the furthest reaches of our planet, in a stark desert landscape where humanity is broken, and almost everyone is crazed fighting for the necessities of life.',
    posterPath: 'https://image.tmdb.org/t/p/w780/hA2ple9q4qnwxp3hKVNhroipsir.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/nlCHUW2Y9jv5iw12XYS7ngaz7Zu.jpg',
    releaseYear: '2015',
    runtime: 120,
    rating: 7.6,
    voteCount: 22000,
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    language: 'English',
    director: 'George Miller',
    cast: ['Tom Hardy', 'Charlize Theron', 'Nicholas Hoult', 'Hugh Keays-Byrne'],
    trailerYoutubeId: 'hEJnMQG930g',
    moodMatchReason: 'Pure kinetic adrenaline. Relentless momentum, jaw-dropping practical stunts, and visceral cinematic energy that commands 100% of your attention.',
    matchedMoods: ['bored', 'adventurous', 'inspired'],
    streamingProviders: [
      { name: 'Max', url: 'https://play.max.com' },
      { name: 'Prime Video', url: 'https://www.amazon.com/Prime-Video' }
    ]
  },
  {
    id: 'the-grand-budapest-hotel',
    title: 'The Grand Budapest Hotel',
    overview: 'The adventures of Gustave H, a legendary concierge at a famous European hotel between the wars, and Zero Moustafa, the lobby boy who becomes his most trusted friend.',
    posterPath: 'https://image.tmdb.org/t/p/w780/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/9y6aW7p4g1X8747H2j9j9m3Q5Q1.jpg',
    releaseYear: '2014',
    runtime: 99,
    rating: 8.1,
    voteCount: 14500,
    genres: ['Comedy', 'Adventure', 'Crime'],
    language: 'English',
    director: 'Wes Anderson',
    cast: ['Ralph Fiennes', 'F. Murray Abraham', 'Mathieu Amalric', 'Adrien Brody'],
    trailerYoutubeId: '1Fg5iWmQjwk',
    moodMatchReason: 'Pastel visual perfection, whimsical dialogue, and vintage charm that feels like curling up with a gorgeously illustrated storybook.',
    matchedMoods: ['stressed', 'happy', 'nostalgic', 'surprise'],
    streamingProviders: [
      { name: 'Disney+', url: 'https://www.disneyplus.com' },
      { name: 'Hulu', url: 'https://www.hulu.com' }
    ]
  },
  {
    id: 'a-quiet-place',
    title: 'A Quiet Place',
    overview: 'A family must navigate their lives in silence to avoid mysterious creatures that hunt by sound. Knowing that even the slightest whisper or footstep can bring death, they battle to survive.',
    posterPath: 'https://image.tmdb.org/t/p/w780/nAU74GmpUk7t5iklEp3bufwDq4n.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/roYyPiQDytnk0yuHI6b92vrNmKV.jpg',
    releaseYear: '2018',
    runtime: 90,
    rating: 7.4,
    voteCount: 13800,
    genres: ['Horror', 'Drama', 'Sci-Fi'],
    language: 'English',
    director: 'John Krasinski',
    cast: ['Emily Blunt', 'John Krasinski', 'Millicent Simmonds', 'Noah Jupe'],
    trailerYoutubeId: 'WR7cc5t7tv8',
    moodMatchReason: 'Masterclass in tension and auditory suspense that will have you holding your breath in terrifying, communal anticipation.',
    matchedMoods: ['scared', 'bored', 'curious'],
    streamingProviders: [
      { name: 'Paramount+', url: 'https://www.paramountplus.com' },
      { name: 'Hulu', url: 'https://www.hulu.com' }
    ]
  },
  {
    id: 'before-sunrise',
    title: 'Before Sunrise',
    overview: 'A young man and an American tourist meet on a train in Europe, and wind up spending one evening together in Vienna. Unfortunately, both know that this will probably be their only night together.',
    posterPath: 'https://image.tmdb.org/t/p/w780/kf1Jb1nd5z68bK95hXn6V27z6Y.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/5yH78nN2bF9eQ7wYv9W9.jpg',
    releaseYear: '1995',
    runtime: 105,
    rating: 8.1,
    voteCount: 5200,
    genres: ['Drama', 'Romance'],
    language: 'English',
    director: 'Richard Linklater',
    cast: ['Ethan Hawke', 'Julie Delpy', 'Andrea Eckert', 'Hanno Pöschl'],
    trailerYoutubeId: '25v7N34d5HE',
    moodMatchReason: 'Unfiltered conversational romance at its purest. The intoxicating chemistry of two wanderers discovering each other under European starlight.',
    matchedMoods: ['romantic', 'nostalgic', 'lonely', 'happy'],
    streamingProviders: [
      { name: 'Apple TV', url: 'https://tv.apple.com' },
      { name: 'Prime Video', url: 'https://www.amazon.com/Prime-Video' }
    ]
  },
  {
    id: 'the-shawshank-redemption',
    title: 'The Shawshank Redemption',
    overview: 'Imprisoned in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden.',
    posterPath: 'https://image.tmdb.org/t/p/w780/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
    releaseYear: '1994',
    runtime: 142,
    rating: 8.7,
    voteCount: 26000,
    genres: ['Drama', 'Crime'],
    language: 'English',
    director: 'Frank Darabont',
    cast: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton', 'William Sadler'],
    trailerYoutubeId: 'PLl99DlL6b4',
    moodMatchReason: 'A profound triumph of patience, friendship, and resilience that reminds us that hope is a good thing, maybe the best of things.',
    matchedMoods: ['inspired', 'lonely', 'sad', 'nostalgic'],
    streamingProviders: [
      { name: 'Max', url: 'https://play.max.com' },
      { name: 'Prime Video', url: 'https://www.amazon.com/Prime-Video' }
    ]
  },
  {
    id: 'parasite',
    title: 'Parasite',
    overview: 'All unemployed, Ki-taek\'s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.',
    posterPath: 'https://image.tmdb.org/t/p/w780/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg',
    releaseYear: '2019',
    runtime: 132,
    rating: 8.5,
    voteCount: 18000,
    genres: ['Comedy', 'Thriller', 'Drama'],
    language: 'Korean',
    director: 'Bong Joon-ho',
    cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong', 'Choi Woo-shik'],
    trailerYoutubeId: '5xH0hhJbgeY',
    moodMatchReason: 'A staggering genre-bending masterpiece that subverts expectations at every turn with biting social satire and breathless tension.',
    matchedMoods: ['curious', 'bored', 'surprise', 'scared'],
    streamingProviders: [
      { name: 'Max', url: 'https://play.max.com' },
      { name: 'Hulu', url: 'https://www.hulu.com' }
    ]
  },
  {
    id: 'everything-everywhere-all-at-once',
    title: 'Everything Everywhere All at Once',
    overview: 'An aging Chinese immigrant is swept up in an insane adventure, where she alone can save what is important to her by connecting with the lives she could have led in other universes.',
    posterPath: 'https://image.tmdb.org/t/p/w780/w3LxiVYPqrlexPsq29ov1gBmYvl.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/fOy2Jurz9AnwGDaHGOWq29Sm4Yq.jpg',
    releaseYear: '2022',
    runtime: 139,
    rating: 8.0,
    voteCount: 6500,
    genres: ['Action', 'Adventure', 'Sci-Fi', 'Comedy'],
    language: 'English',
    director: 'Daniel Kwan, Daniel Scheinert',
    cast: ['Michelle Yeoh', 'Stephanie Hsu', 'Ke Huy Quan', 'Jamie Lee Curtis'],
    trailerYoutubeId: 'wxN1T1uxQ2g',
    moodMatchReason: 'An existential rollercoaster of wild imagination that transforms cosmic nihilism into an emotional embrace of love, kindness, and laundry.',
    matchedMoods: ['surprise', 'inspired', 'bored', 'adventurous', 'happy'],
    streamingProviders: [
      { name: 'Paramount+', url: 'https://www.paramountplus.com' },
      { name: 'Netflix', url: 'https://www.netflix.com' }
    ]
  },
  {
    id: 'amlie',
    title: 'Amélie',
    overview: 'Amélie is an innocent and naive girl in Paris with her own sense of justice. She decides to help those around her and, along the way, discovers love.',
    posterPath: 'https://image.tmdb.org/t/p/w780/pt7uI2e7x8k1iN2h09oF3z3V8.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/6xKzbZuvlqNGRrFw0Kq7b7fM.jpg',
    releaseYear: '2001',
    runtime: 122,
    rating: 8.3,
    voteCount: 11000,
    genres: ['Comedy', 'Romance'],
    language: 'French',
    director: 'Jean-Pierre Jeunet',
    cast: ['Audrey Tautou', 'Mathieu Kassovitz', 'Rufus', 'Lorella Cravotta'],
    trailerYoutubeId: 'HUECWi5pX7o',
    moodMatchReason: 'Luminescent Parisian charm, whimsical visual poetry, and an enchanting ode to kindness and the small secret joys of living.',
    matchedMoods: ['happy', 'romantic', 'stressed', 'lonely', 'surprise'],
    streamingProviders: [
      { name: 'Apple TV', url: 'https://tv.apple.com' },
      { name: 'Prime Video', url: 'https://www.amazon.com/Prime-Video' }
    ]
  },
  {
    id: 'whiplash',
    title: 'Whiplash',
    overview: 'Under the direction of a ruthless instructor, a talented young drummer begins to pursue perfection at any cost, pushing his physical and mental limits to the breaking point.',
    posterPath: 'https://image.tmdb.org/t/p/w780/7fn624j5lj3xTme2SgiLCeuedmO.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/vNXGRb0p0nZf9202L7X8p0F4.jpg',
    releaseYear: '2014',
    runtime: 107,
    rating: 8.5,
    voteCount: 14800,
    genres: ['Drama', 'Music'],
    language: 'English',
    director: 'Damien Chazelle',
    cast: ['Miles Teller', 'J.K. Simmons', 'Paul Reiser', 'Melissa Benoist'],
    trailerYoutubeId: '7d_jQycdQGo',
    moodMatchReason: 'Ferocious, heart-pounding intensity that grips you by the collar and never lets go. A masterclass in sheer dramatic drive.',
    matchedMoods: ['inspired', 'bored', 'curious'],
    streamingProviders: [
      { name: 'Netflix', url: 'https://www.netflix.com' },
      { name: 'Apple TV', url: 'https://tv.apple.com' }
    ]
  },
  {
    id: 'hereditary',
    title: 'Hereditary',
    overview: 'When the matriarch of the Graham family passes away, her daughter and grandchildren begin to unravel cryptic and increasingly terrifying secrets about their ancestry.',
    posterPath: 'https://image.tmdb.org/t/p/w780/p9fmuz2Oj3oZJdGg1P3P3j2mF.jpg',
    backdropPath: 'https://image.tmdb.org/t/p/w1280/yGk9p0dJ4k6b7z8k7aM4.jpg',
    releaseYear: '2018',
    runtime: 127,
    rating: 7.3,
    voteCount: 7800,
    genres: ['Horror', 'Mystery', 'Drama'],
    language: 'English',
    director: 'Ari Aster',
    cast: ['Toni Collette', 'Alex Wolff', 'Milly Shapiro', 'Gabriel Byrne'],
    trailerYoutubeId: 'V6wWKNij_1M',
    moodMatchReason: 'Unflinching psychological dread and visceral generational grief crafted with shocking precision. For true horror aficionados.',
    matchedMoods: ['scared', 'curious'],
    streamingProviders: [
      { name: 'Max', url: 'https://play.max.com' },
      { name: 'Prime Video', url: 'https://www.amazon.com/Prime-Video' }
    ]
  }
];

export function getCuratedMovieById(id: string): Movie | undefined {
  return CURATED_MOVIES.find((m) => m.id === id);
}

export function filterCuratedMovies(options: {
  mood?: string;
  timeLimit?: string;
  genre?: string;
  taste?: string;
  language?: string;
}): Movie[] {
  return CURATED_MOVIES.filter((movie) => {
    // Mood filter
    if (options.mood && options.mood !== 'surprise') {
      if (!movie.matchedMoods?.includes(options.mood as any)) {
        return false;
      }
    }

    // Time filter
    if (options.timeLimit === 'under_90' && movie.runtime >= 90) return false;
    if (options.timeLimit === '90_120' && (movie.runtime < 90 || movie.runtime > 120)) return false;
    if (options.timeLimit === 'over_120' && movie.runtime <= 120) return false;

    // Genre filter
    if (options.genre && options.genre !== 'Any') {
      if (!movie.genres.map(g => g.toLowerCase()).includes(options.genre.toLowerCase())) {
        return false;
      }
    }

    // Language filter
    if (options.language && options.language !== 'Any') {
      if (!movie.language.toLowerCase().includes(options.language.toLowerCase())) {
        return false;
      }
    }

    // Taste filter
    if (options.taste === 'popular' && movie.rating < 8.0) return false;
    if (options.taste === 'underrated' && (movie.rating < 7.5 || movie.voteCount > 15000)) return false;

    return true;
  });
}
