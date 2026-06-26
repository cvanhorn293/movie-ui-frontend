// Flavor copy for each genre, shown in the Movie DNA "Genre spotlight".
// Edit freely — keys are matched case-insensitively against the genre name,
// and any genre without an entry falls back to DEFAULT_GENRE_DESCRIPTION.

export const GENRE_DESCRIPTIONS: Record<string, string> = {
    Action: "All throttle, no brakes — fistfights, firefights, and heroes who solve problems at a sprint.",
    Adventure: "Maps with edges, treasure worth the risk, and the pull of one more horizon.",
    Animation: "Hand-built worlds where the only rule is that physics is optional.",
    Comedy: "Sharp timing and sharper wit — the kind of laughs that ambush you.",
    Crime: "Smoke-filled rooms, clever schemes, and the long arm that always reaches back.",
    Documentary: "Truth with the lights on — real people, real stakes, no script required.",
    Drama: "The quiet devastations and small triumphs that sit with you for days.",
    Family: "Built for every seat on the couch — warmth the whole room can share.",
    Fantasy: "Myth, magic, and maps to places that were never on any map.",
    History: "The past turned cinematic — empires, upheavals, and the people who tipped them.",
    Horror: "Creaking floorboards and held breath — dread you choose to invite in.",
    Music: "Stories that move to a beat, where the soundtrack is the plot.",
    Mystery: "A slow-tightening knot of clues you can't stop pulling at.",
    Romance: "Stolen glances, terrible timing, and love that refuses to be sensible.",
    "Science Fiction": "Big questions in bigger worlds — tomorrow as a thought experiment.",
    "TV Movie": "Cozy, self-contained stories made to be found on a quiet night in.",
    Thriller: "Wound tight and ticking — tension that won't let you look away.",
    War: "Brotherhood, sacrifice, and the brutal arithmetic of the front line.",
    Western: "Dust, distance, and lone riders chasing justice into the sunset.",
};

export const DEFAULT_GENRE_DESCRIPTION = "A defining thread running through your collection.";

export function getGenreDescription(genreName: string): string {
    if (GENRE_DESCRIPTIONS[genreName]) {
        return GENRE_DESCRIPTIONS[genreName];
    }

    const matchKey = Object.keys(GENRE_DESCRIPTIONS).find((key) => key.toLowerCase() === genreName.toLowerCase());
    return matchKey ? GENRE_DESCRIPTIONS[matchKey] : DEFAULT_GENRE_DESCRIPTION;
}
