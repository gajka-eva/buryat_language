// ========== ДАННЫЕ ==========
const levels = [
    {
        id: 1,
        name: "🌱 Основы",
        lessons: [
            { name: "Приветствия", words: ["Амар мэндэ", "Баяртай", "Буянтай", "Баярлаа"] },
            { name: "Цвета", words: ["Шара", "Улаан", "Хухэ", "Ногоон", "Хара"] },
            { name: "Семья", words: ["Аба", "Эхэ", "Хубуун", "Басаган"] }
        ]
    },
    {
        id: 2,
        name: "🌳 Окружающий мир",
        lessons: [
            { name: "Животные", words: ["Морин", "Хонин", "Тэмээн", "Ухэр", "Ямаан"] },
            { name: "Времена года", words: ["Хабар", "Зун", "Намар", "Убэл"] },
            { name: "Погода", words: ["Бороо", "hалхин", "Наран", "Уулен", "Саhан"]}
        ]
    },
    {
        id: 3,
        name: "🏠 Предметы",
        lessons: [
            { name: "Посуда", words: ["Аяга табаг", "Халбага", "Табаг", "Аяга", "Тогоон"] },
            { name: "Мебель", words: ["Шэрээ", "Сандал", "Орон"] }
        ]
    }
];

// Все слова с переводом
const allWords = {
    "Амар мэндэ": "Здравствуйте",
    "Баяртай": "До свидания",
    "Буянтай": "Пожалуйста",
    "Баярлаа": "Спасибо",
    "Сагаан": "Белый",
    "Шара": "Жёлтый",
    "Улаан": "Красный",
    "Хухэ": "Синий",
    "Ногоон": "Зелёный",
    "Хара": "Чёрный",
    "Аба": "Отец",
    "Эхэ": "Мать",
    "Хубуун": "Сын",
    "Басаган": "Дочь",
    "Морин": "Лошадь",
    "Хонин": "Овца",
    "Тэмээн": "Веблюд",
    "Ухэр": "Корова",
    "Ямаан": "Коза",
    "Хабар": "Весна",
    "Зун": "Лето",
    "Намар": "Осень",
    "Убэл": "Зима",
    "Бороо": "Дождь",
    "hалхин": "Ветер",
    "Наран": "Солнце",
    "Уулен": "Облако",
    "Саhан": "Снег",
    "Аяга табаг": "Посуда",
    "Халбага": "Ложка",
    "Табаг": "Тарелка",
    "Аяга": "Кружка",
    "Тогоон": "Кастрюля",
    "Шэрээ": "Стол",
    "Сандал": "Стул",
    "Орон": "Кровать"
};

// ========== СОСТОЯНИЕ ==========
let userProgress = {
    currentLevel: 1,
    completedLessons: {}, // { "1-1": true, "1-2": false }
    totalScore: 0
};

let currentLevel = null;
let currentLesson = null;
let currentExerciseWords = [];
let currentQuestionIndex = 0;
let currentScore = 0;
let waitingForNext = false;

// ========== ИНИЦИАЛИЗАЦИЯ ==========
function init() {
    loadProgress();
    renderMap();
}

function loadProgress() {
    const saved = localStorage.getItem('buryatLevelProgress');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            userProgress = data;
        } catch(e) {}
    }
    
    // Инициализация completedLessons
    levels.forEach(level => {
        level.lessons.forEach((lesson, idx) => {
            const key = `${level.id}-${idx}`;
            if (!userProgress.completedLessons[key]) {
                userProgress.completedLessons[key] = false;
            }
        });
    });
}

function saveProgress() {
    localStorage.setItem('buryatLevelProgress', JSON.stringify(userProgress));
}

// ========== ОТРИСОВКА КАРТЫ ==========
function renderMap() {
    const mapContainer = document.getElementById('map');
    mapContainer.innerHTML = '';
    
    levels.forEach((level, index) => {
        const isUnlocked = checkLevelUnlocked(level.id);
        const isCompleted = checkLevelCompleted(level.id);
        const isCurrent = (level.id === userProgress.currentLevel);
        
        const levelDiv = document.createElement('div');
        levelDiv.className = 'level-node';
        
        const circle = document.createElement('div');
        circle.className = `level-circle ${!isUnlocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`;
        circle.innerHTML = `
            <div class="level-number">${level.id}</div>
            <div class="level-stars">${getLevelStars(level.id)}</div>
        `;
        
        if (isUnlocked) {
            circle.onclick = () => openLevelModal(level);
        }
        
        levelDiv.appendChild(circle);
        mapContainer.appendChild(levelDiv);
    });
    
    updateTotalScore();
}

function checkLevelUnlocked(levelId) {
    if (levelId === 1) return true;
    // Предыдущий уровень должен быть полностью пройден
    const prevLevel = levels[levelId - 2];
    if (!prevLevel) return false;
    return checkLevelCompleted(prevLevel.id);
}

function checkLevelCompleted(levelId) {
    const level = levels[levelId - 1];
    if (!level) return false;
    
    for (let i = 0; i < level.lessons.length; i++) {
        const key = `${levelId}-${i}`;
        if (!userProgress.completedLessons[key]) {
            return false;
        }
    }
    return true;
}

function getLevelStars(levelId) {
    const level = levels[levelId - 1];
    let completed = 0;
    for (let i = 0; i < level.lessons.length; i++) {
        const key = `${levelId}-${i}`;
        if (userProgress.completedLessons[key]) completed++;
    }
    const stars = Math.floor((completed / level.lessons.length) * 3);
    return '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
}

// ========== МОДАЛЬНОЕ ОКНО УРОВНЯ ==========
function openLevelModal(level) {
    currentLevel = level;
    document.getElementById('modalTitle').textContent = `${level.name} (Уровень ${level.id})`;
    renderLessonList();
    document.getElementById('levelModal').style.display = 'flex';
}

function renderLessonList() {
    const container = document.getElementById('lessonList');
    container.innerHTML = '';
    
    let completedCount = 0;
    
    currentLevel.lessons.forEach((lesson, idx) => {
        const key = `${currentLevel.id}-${idx}`;
        const isCompleted = userProgress.completedLessons[key];
        const isUnlocked = checkLessonUnlocked(currentLevel.id, idx);
        
        if (isCompleted) completedCount++;
        
        const lessonDiv = document.createElement('div');
        lessonDiv.className = `lesson-item ${isCompleted ? 'completed' : ''} ${!isUnlocked ? 'locked' : ''}`;
        lessonDiv.innerHTML = `
            <div class="lesson-name">${lesson.name}</div>
            <div class="lesson-status">${isCompleted ? '✅' : (isUnlocked ? '🔓' : '🔒')}</div>
        `;
        
        if (isUnlocked && !isCompleted) {
            lessonDiv.onclick = () => startLesson(lesson, idx);
        }
        
        container.appendChild(lessonDiv);
    });
    
    // Обновляем прогресс-бар
    const percent = (completedCount / currentLevel.lessons.length) * 100;
    document.getElementById('levelProgressFill').style.width = `${percent}%`;
    document.getElementById('levelProgressText').textContent = `${completedCount}/${currentLevel.lessons.length}`;
}

function checkLessonUnlocked(levelId, lessonIndex) {
    if (lessonIndex === 0) return true;
    // Предыдущий урок этого уровня должен быть пройден
    const prevKey = `${levelId}-${lessonIndex - 1}`;
    return userProgress.completedLessons[prevKey] === true;
}

// ========== НАЧАЛО УРОКА ==========
function startLesson(lesson, lessonIndex) {
    currentLesson = lesson;
    currentExerciseWords = lesson.words;
    currentQuestionIndex = 0;
    currentScore = 0;
    waitingForNext = false;
    
    document.getElementById('levelModal').style.display = 'none';
    document.getElementById('exerciseModal').style.display = 'flex';
    document.getElementById('exerciseScore').textContent = currentScore;
    
    loadExerciseQuestion();
}

function loadExerciseQuestion() {
    if (currentQuestionIndex >= currentExerciseWords.length) {
        // Урок завершён!
        completeLesson();
        return;
    }
    
    waitingForNext = false;
    document.getElementById('exerciseFeedback').innerHTML = '';
    document.getElementById('exerciseFeedback').className = 'feedback';
    
    const buryatWord = currentExerciseWords[currentQuestionIndex];
    const correctAnswer = allWords[buryatWord];
    
    // Генерируем варианты
    const otherWords = Object.values(allWords).filter(w => w !== correctAnswer);
    const wrongOptions = [];
    for (let i = 0; i < 3 && i < otherWords.length; i++) {
        const randomIndex = Math.floor(Math.random() * otherWords.length);
        wrongOptions.push(otherWords[randomIndex]);
    }
    
    const options = [correctAnswer, ...wrongOptions];
    // Перемешиваем
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    
    document.getElementById('exerciseQuestion').textContent = buryatWord;
    
    const container = document.getElementById('exerciseOptions');
    container.innerHTML = '';
    
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => checkExerciseAnswer(option, correctAnswer);
        container.appendChild(btn);
    });
}

function checkExerciseAnswer(selected, correct) {
    if (waitingForNext) return;
    
    const isCorrect = (selected === correct);
    
    if (isCorrect) {
        currentScore += 10;
        document.getElementById('exerciseScore').textContent = currentScore;
        showExerciseFeedback(true, `✅ Правильно!`);
        
        // Подсветка правильной кнопки
        document.querySelectorAll('#exerciseOptions .option-btn').forEach(btn => {
            if (btn.textContent === correct) {
                btn.classList.add('correct-answer');
            }
            btn.disabled = true;
        });
        
        waitingForNext = true;
        
        // Автоматически переходим к следующему вопросу через 1 секунду
        setTimeout(() => {
            currentQuestionIndex++;
            loadExerciseQuestion();
        }, 1000);
        
    } else {
        showExerciseFeedback(false, `❌ Неправильно! Правильный ответ: ${correct}`);
        
        // Подсветка
        document.querySelectorAll('#exerciseOptions .option-btn').forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === correct) {
                btn.classList.add('correct-answer');
            }
            if (btn.textContent === selected) {
                btn.classList.add('wrong-answer');
            }
        });
        
        waitingForNext = true;
        
        setTimeout(() => {
            currentQuestionIndex++;
            loadExerciseQuestion();
        }, 1500);
    }
}

function showExerciseFeedback(isCorrect, message) {
    const feedbackDiv = document.getElementById('exerciseFeedback');
    feedbackDiv.textContent = message;
    feedbackDiv.className = `feedback ${isCorrect ? 'correct' : 'wrong'}`;
}

function completeLesson() {
    // Сохраняем прогресс урока
    const lessonIndex = currentLevel.lessons.findIndex(l => l === currentLesson);
    const key = `${currentLevel.id}-${lessonIndex}`;
    userProgress.completedLessons[key] = true;
    userProgress.totalScore += currentScore;
    
    // Если все уроки уровня пройдены - открываем следующий уровень
    if (checkLevelCompleted(currentLevel.id)) {
        if (currentLevel.id < levels.length) {
            userProgress.currentLevel = currentLevel.id + 1;
        }
    }
    
    saveProgress();
    renderMap();
    
    // Показываем поздравление
    alert(`🎉 Урок пройден! Вы заработали ${currentScore} очков!`);
    
    // Закрываем окно упражнения
    document.getElementById('exerciseModal').style.display = 'none';
    
    // Обновляем список уроков в модалке уровня
    if (document.getElementById('levelModal').style.display === 'flex') {
        renderLessonList();
    }
}

function updateTotalScore() {
    document.getElementById('totalScore').textContent = userProgress.totalScore;
}

// ========== ЗВУК ==========
function playSound(word) {
    if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'ru-RU';
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
    }
}

// ========== ОБРАБОТЧИКИ ==========
document.addEventListener('DOMContentLoaded', () => {
    init();
    
    document.getElementById('closeModalBtn').onclick = () => {
        document.getElementById('levelModal').style.display = 'none';
    };
    
    document.getElementById('backToLevelBtn').onclick = () => {
        document.getElementById('exerciseModal').style.display = 'none';
        openLevelModal(currentLevel);
    };
    
    document.getElementById('exerciseSoundBtn').onclick = () => {
        const word = document.getElementById('exerciseQuestion').textContent;
        playSound(word);
    };
    
    // Закрытие по клику вне модалки
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
});