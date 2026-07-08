export type BodyPart =
  | "abs"
  | "chest"
  | "arms"
  | "shoulders"
  | "legs"
  | "back"
  | "cardio"
  | "full_body";

export type Equipment = "none" | "dumbbell" | "barbell" | "machine" | "bodyweight";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Exercise {
  id: string;
  nameUz: string;
  bodyPart: BodyPart;
  equipment: Equipment;
  difficulty: Difficulty;
  defaultSets: number;
  defaultReps: number;
  restSec: number;
  kcalPerSet: number;
  home: boolean;
  gym: boolean;
  instructionsUz: string;
  mediaSlot?: string;
}

export const EXERCISES: Exercise[] = [
  {
    id: "pushup",
    nameUz: "Push-up (yotgan holda ko'tarish)",
    bodyPart: "chest",
    equipment: "bodyweight",
    difficulty: "beginner",
    defaultSets: 3,
    defaultReps: 12,
    restSec: 60,
    kcalPerSet: 8,
    home: true,
    gym: true,
    instructionsUz: "Qo'llarni yelka kengligida qo'ying, tanani to'g'ri tuting.",
  },
  {
    id: "plank",
    nameUz: "Plank",
    bodyPart: "abs",
    equipment: "bodyweight",
    difficulty: "beginner",
    defaultSets: 3,
    defaultReps: 45,
    restSec: 45,
    kcalPerSet: 5,
    home: true,
    gym: true,
    instructionsUz: "Bel to'g'ri, gavda bir tekis chiziqda 30-60 soniya.",
  },
  {
    id: "squat",
    nameUz: "Squat (o'tirib turish)",
    bodyPart: "legs",
    equipment: "bodyweight",
    difficulty: "beginner",
    defaultSets: 3,
    defaultReps: 15,
    restSec: 60,
    kcalPerSet: 10,
    home: true,
    gym: true,
    instructionsUz: "Oyoqlarni yelka kengligida, tizza barmoq chizig'idan chiqmasin.",
  },
  {
    id: "lunge",
    nameUz: "Lunge (oyoq oldinga qadam)",
    bodyPart: "legs",
    equipment: "bodyweight",
    difficulty: "beginner",
    defaultSets: 3,
    defaultReps: 12,
    restSec: 60,
    kcalPerSet: 9,
    home: true,
    gym: true,
    instructionsUz: "Bir oyoqni oldinga qo'ying, tizzalar 90 gradusga bukilsin.",
  },
  {
    id: "burpee",
    nameUz: "Burpee",
    bodyPart: "full_body",
    equipment: "bodyweight",
    difficulty: "intermediate",
    defaultSets: 3,
    defaultReps: 10,
    restSec: 60,
    kcalPerSet: 15,
    home: true,
    gym: true,
    instructionsUz: "Squat → plank → push-up → sakrash. Bir tsikl.",
  },
  {
    id: "mountain_climber",
    nameUz: "Mountain climber",
    bodyPart: "abs",
    equipment: "bodyweight",
    difficulty: "beginner",
    defaultSets: 3,
    defaultReps: 30,
    restSec: 45,
    kcalPerSet: 10,
    home: true,
    gym: true,
    instructionsUz: "Plank holatida, tizzalarni ko'krak tomon navbat bilan olib keling.",
  },
  {
    id: "jumping_jacks",
    nameUz: "Jumping jacks",
    bodyPart: "cardio",
    equipment: "bodyweight",
    difficulty: "beginner",
    defaultSets: 3,
    defaultReps: 40,
    restSec: 30,
    kcalPerSet: 12,
    home: true,
    gym: true,
    instructionsUz: "Sakrab, qo'l va oyoqlarni ochib-yopib turing.",
  },
  {
    id: "situp",
    nameUz: "Sit-up",
    bodyPart: "abs",
    equipment: "bodyweight",
    difficulty: "beginner",
    defaultSets: 3,
    defaultReps: 20,
    restSec: 45,
    kcalPerSet: 6,
    home: true,
    gym: true,
    instructionsUz: "Yotgan holdan gavdani to'liq ko'taring.",
  },
  {
    id: "crunch",
    nameUz: "Crunch",
    bodyPart: "abs",
    equipment: "bodyweight",
    difficulty: "beginner",
    defaultSets: 3,
    defaultReps: 20,
    restSec: 30,
    kcalPerSet: 4,
    home: true,
    gym: true,
    instructionsUz: "Faqat yelka va yuqori gavdani ko'taring, bel yerda qolsin.",
  },
  {
    id: "bicep_curl_db",
    nameUz: "Dumbbell bicep curl",
    bodyPart: "arms",
    equipment: "dumbbell",
    difficulty: "beginner",
    defaultSets: 3,
    defaultReps: 12,
    restSec: 60,
    kcalPerSet: 5,
    home: true,
    gym: true,
    instructionsUz: "Tirsakni yon tomonda qattiq tuting, gantelni yelkaga oling.",
  },
  {
    id: "tricep_dip",
    nameUz: "Tricep dip",
    bodyPart: "arms",
    equipment: "bodyweight",
    difficulty: "intermediate",
    defaultSets: 3,
    defaultReps: 12,
    restSec: 60,
    kcalPerSet: 7,
    home: true,
    gym: true,
    instructionsUz: "Stul chetidan foydalanib, tirsakni 90 gradus bukib pastga tushing.",
  },
  {
    id: "shoulder_press_db",
    nameUz: "Dumbbell shoulder press",
    bodyPart: "shoulders",
    equipment: "dumbbell",
    difficulty: "intermediate",
    defaultSets: 3,
    defaultReps: 10,
    restSec: 60,
    kcalPerSet: 7,
    home: true,
    gym: true,
    instructionsUz: "Gantellarni yelka balandligidan tepaga ko'taring.",
  },
  {
    id: "row_db",
    nameUz: "Dumbbell row",
    bodyPart: "back",
    equipment: "dumbbell",
    difficulty: "intermediate",
    defaultSets: 3,
    defaultReps: 12,
    restSec: 60,
    kcalPerSet: 7,
    home: true,
    gym: true,
    instructionsUz: "Gavdani oldinga engashtirib, gantelni bel tomon torting.",
  },
  {
    id: "deadlift_bb",
    nameUz: "Barbell deadlift",
    bodyPart: "back",
    equipment: "barbell",
    difficulty: "advanced",
    defaultSets: 4,
    defaultReps: 6,
    restSec: 120,
    kcalPerSet: 15,
    home: false,
    gym: true,
    instructionsUz: "Bel to'g'ri, oyoqni yerga bosing, shtangani tanaga yaqin tuting.",
  },
  {
    id: "bench_press_bb",
    nameUz: "Barbell bench press",
    bodyPart: "chest",
    equipment: "barbell",
    difficulty: "advanced",
    defaultSets: 4,
    defaultReps: 8,
    restSec: 90,
    kcalPerSet: 12,
    home: false,
    gym: true,
    instructionsUz: "Shtangani ko'krakka nazorat bilan tushiring, so'ng yuqoriga chiqaring.",
  },
  {
    id: "leg_press",
    nameUz: "Leg press",
    bodyPart: "legs",
    equipment: "machine",
    difficulty: "intermediate",
    defaultSets: 4,
    defaultReps: 10,
    restSec: 90,
    kcalPerSet: 10,
    home: false,
    gym: true,
    instructionsUz: "Oyoqni to'liq yozmasdan, tizza 90 gradusgacha bukilsin.",
  },
];

export interface WorkoutPlan {
  id: string;
  nameUz: string;
  descriptionUz: string;
  exerciseIds: string[];
  durationMin: number;
  difficulty: Difficulty;
  home: boolean;
}

export const WORKOUT_PLANS: WorkoutPlan[] = [
  {
    id: "hiit_20",
    nameUz: "HIIT 20 daqiqa",
    descriptionUz: "Yuqori intensivlikda kaloriya yoqish uchun.",
    exerciseIds: ["jumping_jacks", "burpee", "mountain_climber", "squat"],
    durationMin: 20,
    difficulty: "intermediate",
    home: true,
  },
  {
    id: "abs_focus",
    nameUz: "Press va qorin",
    descriptionUz: "Qorin mushaklariga yo'naltirilgan mashqlar.",
    exerciseIds: ["crunch", "plank", "situp", "mountain_climber"],
    durationMin: 15,
    difficulty: "beginner",
    home: true,
  },
  {
    id: "full_body_strength",
    nameUz: "To'liq tana kuchi",
    descriptionUz: "Barcha asosiy mushak guruhlariga.",
    exerciseIds: ["squat", "pushup", "row_db", "shoulder_press_db", "lunge"],
    durationMin: 40,
    difficulty: "intermediate",
    home: true,
  },
  {
    id: "athletic",
    nameUz: "Atletik dastur",
    descriptionUz: "Kuch va chidamlilikni birlashtirgan.",
    exerciseIds: ["deadlift_bb", "bench_press_bb", "leg_press", "row_db"],
    durationMin: 60,
    difficulty: "advanced",
    home: false,
  },
];

export function exercisesByBodyPart(part: BodyPart): Exercise[] {
  return EXERCISES.filter((e) => e.bodyPart === part);
}

export function exercisesForLocation(location: "home" | "gym"): Exercise[] {
  return EXERCISES.filter((e) => (location === "home" ? e.home : e.gym));
}
