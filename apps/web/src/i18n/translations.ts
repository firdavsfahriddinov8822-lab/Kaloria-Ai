export type Locale = "uz" | "ru" | "en";

type Row = Record<Locale, string>;

const dict = {
  // App-wide
  app_name: { uz: "Kaloriya", ru: "Kaloriya", en: "Kaloriya" },
  app_tagline: {
    uz: "AI fitnes va ovqatlanish murabbiyi",
    ru: "AI-тренер по фитнесу и питанию",
    en: "AI fitness and nutrition coach",
  },
  disclaimer: {
    uz: "Kaloriya tibbiy maslahat emas. Sog'lig'ingiz uchun mutaxassis bilan maslahatlashing.",
    ru: "Kaloriya — не медицинский совет. Консультируйтесь со специалистом.",
    en: "Kaloriya is not medical advice. Consult a professional about your health.",
  },

  // Tabs
  tab_home: { uz: "Bosh", ru: "Главная", en: "Home" },
  tab_food: { uz: "Ovqat", ru: "Еда", en: "Food" },
  tab_workouts: { uz: "Mashq", ru: "Тренировка", en: "Workouts" },
  tab_progress: { uz: "Progress", ru: "Прогресс", en: "Progress" },
  tab_settings: { uz: "Sozlash", ru: "Настройки", en: "Settings" },

  // Common
  save: { uz: "Saqlash", ru: "Сохранить", en: "Save" },
  cancel: { uz: "Bekor", ru: "Отмена", en: "Cancel" },
  continue: { uz: "Davom etish", ru: "Продолжить", en: "Continue" },
  back: { uz: "Ortga", ru: "Назад", en: "Back" },
  next: { uz: "Keyingi", ru: "Далее", en: "Next" },
  previous: { uz: "Oldingi", ru: "Предыдущий", en: "Previous" },
  finish: { uz: "Yakunlash", ru: "Завершить", en: "Finish" },
  remove: { uz: "O'chirish", ru: "Удалить", en: "Remove" },
  yes: { uz: "Ha", ru: "Да", en: "Yes" },
  no: { uz: "Yo'q", ru: "Нет", en: "No" },
  loading: { uz: "Kuting...", ru: "Загрузка...", en: "Loading..." },
  error: { uz: "Xatolik", ru: "Ошибка", en: "Error" },
  ok: { uz: "OK", ru: "ОК", en: "OK" },
  add: { uz: "Qo'shish", ru: "Добавить", en: "Add" },
  edit: { uz: "Tahrirlash", ru: "Изменить", en: "Edit" },

  // Units
  unit_kcal: { uz: "kkal", ru: "ккал", en: "kcal" },
  unit_g: { uz: "g", ru: "г", en: "g" },
  unit_mg: { uz: "mg", ru: "мг", en: "mg" },
  unit_mcg: { uz: "mkg", ru: "мкг", en: "mcg" },
  unit_ml: { uz: "ml", ru: "мл", en: "ml" },
  unit_kg: { uz: "kg", ru: "кг", en: "kg" },
  unit_min: { uz: "daq", ru: "мин", en: "min" },
  unit_sec: { uz: "s", ru: "с", en: "s" },
  unit_cm: { uz: "sm", ru: "см", en: "cm" },
  unit_percent: { uz: "%", ru: "%", en: "%" },

  // Language picker
  lang_pick_title: { uz: "Tilni tanlang", ru: "Выберите язык", en: "Choose your language" },
  lang_pick_sub: {
    uz: "Ilovaning barcha matnlari shu tilda ko'rsatiladi.",
    ru: "Все тексты приложения будут на выбранном языке.",
    en: "All app text will appear in the selected language.",
  },

  // Login
  auth_login: { uz: "Kirish", ru: "Войти", en: "Log in" },
  auth_register: { uz: "Ro'yxatdan o'tish", ru: "Регистрация", en: "Sign up" },
  auth_email: { uz: "Email", ru: "Email", en: "Email" },
  auth_password: { uz: "Parol", ru: "Пароль", en: "Password" },
  auth_email_placeholder: { uz: "siz@misol.uz", ru: "you@example.com", en: "you@example.com" },
  auth_password_placeholder: {
    uz: "Kamida 8 belgi",
    ru: "Минимум 8 символов",
    en: "At least 8 characters",
  },
  auth_welcome: { uz: "Xush kelibsiz!", ru: "Добро пожаловать!", en: "Welcome!" },
  auth_missing_fields: {
    uz: "Email va parolni kiriting",
    ru: "Введите email и пароль",
    en: "Enter email and password",
  },
  auth_supabase_missing: {
    uz: "Supabase sozlanmagan",
    ru: "Supabase не настроен",
    en: "Supabase not configured",
  },
  auth_check_email: {
    uz: "Emailingizni tekshiring — tasdiqlash havolasi yuborildi. Havolani bosgach, qayta kiring.",
    ru: "Проверьте email — отправлена ссылка для подтверждения. После подтверждения войдите снова.",
    en: "Check your email — a confirmation link was sent. After confirming, sign in again.",
  },

  // Setup
  setup_title: { uz: "Profil sozlash", ru: "Настройка профиля", en: "Set up profile" },
  setup_sub: {
    uz: "Sog'lom va shaxsiy maqsad uchun bir necha savol.",
    ru: "Несколько вопросов для здоровой персональной цели.",
    en: "A few questions to set a healthy personal goal.",
  },
  field_name: { uz: "Ism", ru: "Имя", en: "Name" },
  field_name_placeholder: { uz: "Ismingiz", ru: "Ваше имя", en: "Your name" },
  field_sex: { uz: "Jins", ru: "Пол", en: "Sex" },
  sex_male: { uz: "Erkak", ru: "Мужской", en: "Male" },
  sex_female: { uz: "Ayol", ru: "Женский", en: "Female" },
  field_age: { uz: "Yosh", ru: "Возраст", en: "Age" },
  field_height: { uz: "Bo'y (sm)", ru: "Рост (см)", en: "Height (cm)" },
  field_weight: { uz: "Vazn (kg)", ru: "Вес (кг)", en: "Weight (kg)" },
  field_goal: { uz: "Maqsad", ru: "Цель", en: "Goal" },
  goal_lose: { uz: "Ozish", ru: "Похудеть", en: "Lose" },
  goal_maintain: { uz: "Saqlash", ru: "Поддерживать", en: "Maintain" },
  goal_gain: { uz: "Qo'shish", ru: "Набрать", en: "Gain" },
  field_pace: { uz: "Sur'at", ru: "Темп", en: "Pace" },
  pace_slow: { uz: "Sekin", ru: "Медленно", en: "Slow" },
  pace_normal: { uz: "Odatiy", ru: "Средне", en: "Normal" },
  pace_fast: { uz: "Tez", ru: "Быстро", en: "Fast" },
  field_activity: { uz: "Faollik", ru: "Активность", en: "Activity" },
  activity_sedentary: { uz: "Kam", ru: "Мало", en: "Low" },
  activity_light: { uz: "Yengil", ru: "Лёгкая", en: "Light" },
  activity_moderate: { uz: "O'rta", ru: "Средняя", en: "Moderate" },
  activity_active: { uz: "Faol", ru: "Активная", en: "Active" },
  activity_very: { uz: "Juda", ru: "Очень", en: "Very" },
  field_diet: { uz: "Ovqat turi", ru: "Тип питания", en: "Diet type" },
  diet_regular: { uz: "Oddiy", ru: "Обычный", en: "Regular" },
  diet_halal: { uz: "Halol", ru: "Халяль", en: "Halal" },
  diet_vegetarian: { uz: "Vegetarian", ru: "Вегетарианец", en: "Vegetarian" },
  diet_vegan: { uz: "Vegan", ru: "Веган", en: "Vegan" },
  field_allergies: {
    uz: "Allergiyalar (vergul bilan)",
    ru: "Аллергии (через запятую)",
    en: "Allergies (comma separated)",
  },
  field_allergies_placeholder: {
    uz: "masalan: sut, yong'oq",
    ru: "например: молоко, орехи",
    en: "e.g. milk, nuts",
  },
  preview_title: {
    uz: "Taxminiy natijalar",
    ru: "Ожидаемые результаты",
    en: "Estimated targets",
  },
  preview_kcal_day: { uz: "kkal / kun", ru: "ккал / день", en: "kcal / day" },
  setup_save: {
    uz: "Saqlash va davom etish",
    ru: "Сохранить и продолжить",
    en: "Save and continue",
  },
  setup_saved: { uz: "Profil saqlandi", ru: "Профиль сохранён", en: "Profile saved" },
  setup_need_name: { uz: "Ismingizni kiriting", ru: "Введите ваше имя", en: "Enter your name" },

  // Home
  home_hello: { uz: "Salom, {name}", ru: "Привет, {name}", en: "Hi, {name}" },
  home_today_goal: {
    uz: "Bugungi maqsad",
    ru: "Цель на сегодня",
    en: "Today's goal",
  },
  home_consumed: { uz: "Iste'mol", ru: "Съедено", en: "Consumed" },
  home_burned: { uz: "Yoqilgan", ru: "Сожжено", en: "Burned" },
  home_remaining: { uz: "Qolgan", ru: "Осталось", en: "Remaining" },
  home_macros: { uz: "Makrolar", ru: "Макросы", en: "Macros" },
  home_protein: { uz: "Protein", ru: "Белок", en: "Protein" },
  home_fat: { uz: "Yog'", ru: "Жиры", en: "Fat" },
  home_carbs: { uz: "Karbon", ru: "Углеводы", en: "Carbs" },
  home_sugar: { uz: "Shakar", ru: "Сахар", en: "Sugar" },
  home_salt: { uz: "Tuz", ru: "Соль", en: "Salt" },
  home_water: { uz: "Suv", ru: "Вода", en: "Water" },
  home_add_food: { uz: "+ Ovqat qo'shish", ru: "+ Добавить еду", en: "+ Add food" },
  home_start_workout: {
    uz: "Mashqni boshlash",
    ru: "Начать тренировку",
    en: "Start workout",
  },

  // Food
  food_title: { uz: "Ovqat", ru: "Еда", en: "Food" },
  meal_breakfast: { uz: "Nonushta", ru: "Завтрак", en: "Breakfast" },
  meal_lunch: { uz: "Tushlik", ru: "Обед", en: "Lunch" },
  meal_dinner: { uz: "Kechki ovqat", ru: "Ужин", en: "Dinner" },
  meal_snack: { uz: "Snak", ru: "Перекус", en: "Snack" },
  food_empty: { uz: "Hozircha bo'sh", ru: "Пока пусто", en: "Empty for now" },

  // Add food (AI camera)
  addfood_title: { uz: "Ovqat qo'shish", ru: "Добавить еду", en: "Add food" },
  addfood_sub: {
    uz: "Rasmga oling — AI kaloriya va makrolarni hisoblaydi.",
    ru: "Сфотографируйте — AI посчитает калории и макросы.",
    en: "Take a photo — AI will calculate calories and macros.",
  },
  addfood_meal_type: { uz: "Ovqat turi", ru: "Тип приёма пищи", en: "Meal type" },
  addfood_take_photo: { uz: "📸 Rasm olish", ru: "📸 Сделать фото", en: "📸 Take photo" },
  addfood_retake_photo: {
    uz: "Boshqa rasm olish",
    ru: "Сделать другое фото",
    en: "Retake photo",
  },
  addfood_analyzing: {
    uz: "Tahlil qilinmoqda...",
    ru: "Анализ...",
    en: "Analyzing...",
  },
  addfood_result: { uz: "Tahlil natijasi", ru: "Результат анализа", en: "Analysis" },
  addfood_items: { uz: "Ovqat tarkibi", ru: "Состав блюда", en: "Items" },
  addfood_totals: { uz: "Jami", ru: "Всего", en: "Total" },
  addfood_confidence: { uz: "Ishonch", ru: "Уверенность", en: "Confidence" },
  addfood_portion: { uz: "Porsiya", ru: "Порция", en: "Portion" },
  addfood_portion_hint: {
    uz: "Qancha yeyish kerakligini AI tavsiya qildi.",
    ru: "AI предложил, сколько лучше съесть.",
    en: "AI suggested how much of it to eat.",
  },
  addfood_will_eat: { uz: "🍽 Yeyman", ru: "🍽 Съем это", en: "🍽 I'll eat this" },
  addfood_added: {
    uz: "Ovqat qo'shildi",
    ru: "Еда добавлена",
    en: "Food added",
  },
  addfood_ai_error: { uz: "AI xatolik", ru: "Ошибка AI", en: "AI error" },
  addfood_ai_note: { uz: "AI izohi", ru: "Совет AI", en: "AI note" },
  addfood_not_food: {
    uz: "Bu ovqat emas. Iltimos, ovqat rasmini oling.",
    ru: "Это не еда. Пожалуйста, сфотографируйте блюдо.",
    en: "This is not food. Please take a photo of a meal.",
  },
  addfood_brand: { uz: "Brend", ru: "Бренд", en: "Brand" },
  addfood_vitamins: {
    uz: "Vitamin va minerallar",
    ru: "Витамины и минералы",
    en: "Vitamins & minerals",
  },
  nutr_fiber: { uz: "Tola", ru: "Клетчатка", en: "Fiber" },
  nutr_vit_a: { uz: "Vitamin A", ru: "Витамин A", en: "Vitamin A" },
  nutr_vit_c: { uz: "Vitamin C", ru: "Витамин C", en: "Vitamin C" },
  nutr_vit_d: { uz: "Vitamin D", ru: "Витамин D", en: "Vitamin D" },
  nutr_vit_b12: { uz: "Vitamin B12", ru: "Витамин B12", en: "Vitamin B12" },
  nutr_iron: { uz: "Temir", ru: "Железо", en: "Iron" },
  nutr_calcium: { uz: "Kaltsiy", ru: "Кальций", en: "Calcium" },
  nutr_potassium: { uz: "Kaliy", ru: "Калий", en: "Potassium" },
  nutr_sodium: { uz: "Natriy", ru: "Натрий", en: "Sodium" },

  // Workouts
  workouts_title: { uz: "Mashqlar", ru: "Тренировки", en: "Workouts" },
  workouts_sub: {
    uz: "Tayyor dasturlar — uy yoki zal uchun.",
    ru: "Готовые программы — дома или в зале.",
    en: "Ready programs — home or gym.",
  },
  workouts_home: { uz: "Uy", ru: "Дом", en: "Home" },
  workouts_gym: { uz: "Sport zali", ru: "Зал", en: "Gym" },
  workouts_exercises_count: {
    uz: "{n} mashq",
    ru: "{n} упражнений",
    en: "{n} exercises",
  },
  workouts_today: {
    uz: "Bugungi mashq (AI)",
    ru: "Тренировка на сегодня (AI)",
    en: "Today's workout (AI)",
  },
  workouts_today_sub: {
    uz: "Sizning maqsad va profilingizga moslashtirilgan",
    ru: "Персонально под вашу цель",
    en: "Personalized to your goal and profile",
  },
  workouts_generate: {
    uz: "🩺 Bugungi rejani yaratish",
    ru: "🩺 Составить план на сегодня",
    en: "🩺 Generate today's plan",
  },
  workouts_generating: {
    uz: "Yaratilmoqda...",
    ru: "Создание...",
    en: "Generating...",
  },
  workouts_regenerate: {
    uz: "Rejani qayta yaratish",
    ru: "Пересоздать план",
    en: "Regenerate plan",
  },
  workouts_need_profile: {
    uz: "Avval profilni to'ldiring",
    ru: "Сначала заполните профиль",
    en: "Fill out your profile first",
  },
  workouts_duration: { uz: "Davomiyligi", ru: "Длительность", en: "Duration" },
  workouts_kcal: { uz: "Kaloriya", ru: "Калории", en: "Calories" },
  workouts_warmup: {
    uz: "Isinish + sovutish",
    ru: "Разминка + заминка",
    en: "Warm+cool",
  },
  workouts_target: { uz: "Mushak", ru: "Мышца", en: "Muscle" },
  workouts_equipment: { uz: "Jihoz", ru: "Инвентарь", en: "Equipment" },
  workouts_doctor_note: {
    uz: "Doktor izohi",
    ru: "Совет врача",
    en: "Doctor's note",
  },
  workouts_ready_plans: {
    uz: "Tayyor dasturlar",
    ru: "Готовые программы",
    en: "Ready programs",
  },
  intensity_easy: { uz: "Yengil", ru: "Лёгкая", en: "Easy" },
  intensity_moderate: { uz: "O'rta", ru: "Средняя", en: "Moderate" },
  intensity_hard: { uz: "Og'ir", ru: "Тяжёлая", en: "Hard" },
  session_sets: { uz: "Set", ru: "Подход", en: "Sets" },
  session_reps: { uz: "Reps", ru: "Повторы", en: "Reps" },
  session_rest: { uz: "Dam", ru: "Отдых", en: "Rest" },
  session_finished: { uz: "Yakunlandi! Zo'r ish.", ru: "Готово! Отличная работа.", en: "Done! Great work." },
  session_not_found: { uz: "Dastur topilmadi.", ru: "Программа не найдена.", en: "Plan not found." },

  // Progress
  progress_title: { uz: "Progress", ru: "Прогресс", en: "Progress" },
  progress_sub: {
    uz: "Sog'lom sur'atda 0.5–1% haftada.",
    ru: "Здоровый темп 0.5–1% в неделю.",
    en: "Healthy pace of 0.5–1% per week.",
  },
  progress_current_weight: {
    uz: "Joriy vazn",
    ru: "Текущий вес",
    en: "Current weight",
  },
  progress_new_weight: {
    uz: "Yangi vazn kiriting",
    ru: "Введите новый вес",
    en: "Enter new weight",
  },
  progress_weight_saved: { uz: "Vazn saqlandi", ru: "Вес сохранён", en: "Weight saved" },
  progress_records: { uz: "Yozuvlar", ru: "Записи", en: "Records" },
  progress_no_records: {
    uz: "Hali yozuv yo'q.",
    ru: "Записей ещё нет.",
    en: "No records yet.",
  },

  // Settings
  settings_title: { uz: "Sozlash", ru: "Настройки", en: "Settings" },
  settings_user: { uz: "Foydalanuvchi", ru: "Пользователь", en: "User" },
  settings_guest: { uz: "Mehmon", ru: "Гость", en: "Guest" },
  settings_tier: { uz: "Tarif", ru: "Тариф", en: "Plan" },
  settings_edit_profile: {
    uz: "Profilni tahrirlash",
    ru: "Изменить профиль",
    en: "Edit profile",
  },
  settings_language: { uz: "Til", ru: "Язык", en: "Language" },
  settings_security: { uz: "Xavfsizlik", ru: "Безопасность", en: "Security" },
  settings_pin: { uz: "PIN kod bilan qulflash", ru: "Блокировка PIN-кодом", en: "PIN code lock" },
  settings_pin_setup: { uz: "PIN kodni sozlash", ru: "Настроить PIN-код", en: "Set up PIN" },
  settings_pin_change: { uz: "PIN kodni o'zgartirish", ru: "Изменить PIN-код", en: "Change PIN" },
  settings_pin_remove: { uz: "PIN kodni o'chirish", ru: "Удалить PIN-код", en: "Remove PIN" },
  settings_biometric: { uz: "Barmoq izi orqali kirish", ru: "Вход по отпечатку", en: "Fingerprint unlock" },
  settings_biometric_enable: {
    uz: "Barmoq izini yoqish",
    ru: "Включить отпечаток",
    en: "Enable fingerprint",
  },
  settings_biometric_disable: {
    uz: "Barmoq izini o'chirish",
    ru: "Отключить отпечаток",
    en: "Disable fingerprint",
  },
  settings_biometric_unavailable: {
    uz: "Bu qurilma barmoq izini qo'llab-quvvatlamaydi.",
    ru: "Устройство не поддерживает биометрию.",
    en: "This device doesn't support biometrics.",
  },
  settings_logout: { uz: "Chiqish", ru: "Выйти", en: "Log out" },

  // PIN
  pin_setup_title: { uz: "PIN kod qo'yasizmi?", ru: "Установить PIN-код?", en: "Set a PIN?" },
  pin_setup_sub: {
    uz: "Xavfsizlik uchun 4 xonali PIN kod qo'ying. Ilovani ochganda so'raladi.",
    ru: "Для безопасности задайте 4-значный PIN. Он будет спрашиваться при открытии.",
    en: "Set a 4-digit PIN for security. It will be asked on app open.",
  },
  pin_setup_skip: { uz: "Keyinroq", ru: "Позже", en: "Later" },
  pin_setup_confirm: {
    uz: "PIN kodni takrorlang",
    ru: "Повторите PIN-код",
    en: "Confirm PIN",
  },
  pin_mismatch: {
    uz: "PIN kodlar mos kelmadi",
    ru: "PIN-коды не совпадают",
    en: "PINs don't match",
  },
  pin_saved: { uz: "PIN kod saqlandi", ru: "PIN сохранён", en: "PIN saved" },
  pin_removed: { uz: "PIN o'chirildi", ru: "PIN удалён", en: "PIN removed" },
  pin_wrong: { uz: "Noto'g'ri PIN", ru: "Неверный PIN", en: "Wrong PIN" },
  lock_title: { uz: "Kaloriya qulflangan", ru: "Kaloriya заблокирована", en: "Kaloriya locked" },
  lock_enter_pin: { uz: "PIN kodni kiriting", ru: "Введите PIN-код", en: "Enter PIN" },
  lock_use_fingerprint: {
    uz: "Barmoq izidan foydalanish",
    ru: "Использовать отпечаток",
    en: "Use fingerprint",
  },
  lock_biometric_failed: {
    uz: "Barmoq izi tekshirilmadi",
    ru: "Отпечаток не подтверждён",
    en: "Fingerprint failed",
  },
} as const;

export const translations: Record<string, Row> = dict;
export type TranslationKey = keyof typeof dict;
