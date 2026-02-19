class TypingSpeedTest {
    constructor() {
        this.gameState = 'start'; // start, word-mode, sentence-mode, result
        this.mode = null; // 'word' or 'sentence'
        this.testText = '';
        this.typedText = '';
        this.startTime = null;
        this.endTime = null;
        this.wordCount = 0;
        this.correctWords = 0;
        this.incorrectWords = 0;
        this.wpm = 0;
        this.accuracy = 0;
        this.timeLimit = 60; // Word mode 60초
        this.timeRemaining = 60;
        this.timerInterval = null;
        this.testStarted = false;

        this.initElements();
        this.attachEventListeners();
    }

    initElements() {
        // 화면 요소
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.resultScreen = document.getElementById('result-screen');

        // 게임 관련 요소
        this.modeButtons = document.querySelectorAll('.mode-card');
        this.timerDisplay = document.getElementById('timer-display');
        this.typingDisplay = document.getElementById('typing-display');
        this.typingInput = document.getElementById('typing-input');
        this.progressBar = document.getElementById('progress-fill');

        // 결과 관련 요소
        this.resultEmoji = document.getElementById('result-emoji');
        this.resultTitle = document.getElementById('result-title');
        this.resultGrade = document.getElementById('result-grade');
        this.resultPercentile = document.getElementById('result-percentile');
        this.resultWpm = document.getElementById('result-wpm');
        this.resultAccuracy = document.getElementById('result-accuracy');
        this.shareButton = document.getElementById('share-button');

        // 버튼
        this.restartButton = document.getElementById('restart-button');
        this.shareButton = document.getElementById('share-button');
        this.backButton = document.getElementById('back-button');
    }

    attachEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const savedTheme = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', savedTheme);
            themeToggle.textContent = savedTheme === 'light' ? '🌙' : '☀️';
            themeToggle.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme');
                const next = current === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem('theme', next);
                themeToggle.textContent = next === 'light' ? '🌙' : '☀️';
            });
        }

        // 모드 선택
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-mode');
                this.startGame(mode);
            });
        });

        // 타이핑 입력
        this.typingInput.addEventListener('input', () => this.handleTyping());

        // 버튼들
        this.restartButton?.addEventListener('click', () => this.restartGame());
        this.shareButton?.addEventListener('click', () => this.shareResult());
        this.backButton?.addEventListener('click', () => this.backToStart());

        // 언어 선택기
        document.querySelectorAll('.lang-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                i18n.setLanguage(lang);
            });
        });

        // 언어 토글
        document.getElementById('lang-toggle')?.addEventListener('click', (e) => {
            const menu = document.getElementById('lang-menu');
            menu.classList.toggle('hidden');
            e.stopPropagation();
        });

        // 메뉴 닫기
        document.addEventListener('click', () => {
            document.getElementById('lang-menu')?.classList.add('hidden');
        });
    }

    startGame(mode) {
        this.mode = mode;
        this.gameState = mode === 'word' ? 'word-mode' : 'sentence-mode';
        this.testStarted = false;
        this.typedText = '';
        this.timeRemaining = mode === 'word' ? 60 : 0;

        // 테스트 텍스트 생성
        if (mode === 'word') {
            this.testText = wordData.getRandomWords(30);
        } else {
            this.testText = wordData.getRandomSentences(3, i18n.currentLang === 'ko');
        }

        // 화면 전환
        this.startScreen.classList.remove('active');
        this.gameScreen.classList.add('active');
        this.resultScreen.classList.remove('active');

        this.updateDisplay();
        this.typingInput.focus();
    }

    handleTyping() {
        const input = this.typingInput.value;

        // 첫 글자 입력 시 타이머 시작
        if (!this.testStarted && input.length > 0) {
            this.testStarted = true;
            this.startTime = Date.now();
            if (this.mode === 'word') {
                this.startTimer();
            }
        }

        this.typedText = input;
        this.updateDisplay();

        // 게임 종료 체크
        const words = wordData.splitIntoWords(this.testText);
        if (this.mode === 'sentence' && this.typedText.trim() === this.testText.trim()) {
            this.endGame();
        }
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);

        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimer();

            if (this.timeRemaining <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    updateTimer() {
        this.timerDisplay.textContent = `${this.timeRemaining}s`;

        // 시간 경고 상태
        if (this.timeRemaining <= 10) {
            this.timerDisplay.classList.add('danger');
            this.timerDisplay.classList.remove('warning');
        } else if (this.timeRemaining <= 20) {
            this.timerDisplay.classList.add('warning');
            this.timerDisplay.classList.remove('danger');
        } else {
            this.timerDisplay.classList.remove('warning', 'danger');
        }
    }

    updateDisplay() {
        const words = wordData.splitIntoWords(this.testText);
        const typedWords = wordData.splitIntoWords(this.typedText);

        let displayHTML = '';

        words.forEach((word, index) => {
            const typedWord = typedWords[index] || '';
            const isCorrect = typedWord === word;
            const isCurrent = index === typedWords.length;
            const isPending = index > typedWords.length;

            let className = 'typing-word';
            if (isCurrent) {
                className += ' current';
            } else if (isPending) {
                className += ' pending';
            } else if (isCorrect) {
                className += ' correct';
            } else {
                className += ' incorrect';
            }

            displayHTML += `<span class="${className}">${word}</span>`;
        });

        this.typingDisplay.innerHTML = displayHTML;

        // 진행도 업데이트
        const progress = (typedWords.length / words.length) * 100;
        this.progressBar.style.width = Math.min(progress, 100) + '%';
    }

    endGame() {
        this.testStarted = false;
        if (this.timerInterval) clearInterval(this.timerInterval);

        this.endTime = Date.now();

        // 결과 계산
        this.calculateResults();

        // 화면 전환
        this.gameScreen.classList.remove('active');
        this.resultScreen.classList.add('active');

        this.displayResults();
    }

    calculateResults() {
        const words = wordData.splitIntoWords(this.testText);
        const typedWords = wordData.splitIntoWords(this.typedText);

        this.wordCount = Math.max(words.length, typedWords.length);
        this.correctWords = 0;
        this.incorrectWords = 0;

        words.forEach((word, index) => {
            if (typedWords[index] === word) {
                this.correctWords++;
            } else if (index < typedWords.length) {
                this.incorrectWords++;
            }
        });

        // 정확도
        this.accuracy = this.wordCount > 0 ? (this.correctWords / this.wordCount) * 100 : 0;

        // 시간 계산 (분 단위)
        const timeMs = this.mode === 'word' ? (60 - this.timeRemaining) * 1000 : this.endTime - this.startTime;
        const timeMin = timeMs / 1000 / 60;

        // WPM 계산 (단어: 5글자)
        const charCount = this.typedText.length;
        const wpmRaw = (charCount / 5) / Math.max(timeMin, 0.1);
        this.wpm = Math.round(wpmRaw);

        // 정확도 적용한 조정 WPM
        const adjustedWpm = Math.round(this.wpm * (this.accuracy / 100));
        this.wpm = Math.max(0, adjustedWpm);
    }

    displayResults() {
        // 등급 결정
        let grade = 'F';
        let emoji = '😅';

        if (this.wpm >= 100) {
            grade = 'S';
            emoji = '🚀';
        } else if (this.wpm >= 80) {
            grade = 'A';
            emoji = '⭐';
        } else if (this.wpm >= 60) {
            grade = 'B';
            emoji = '😊';
        } else if (this.wpm >= 40) {
            grade = 'C';
            emoji = '👍';
        } else if (this.wpm >= 20) {
            grade = 'D';
            emoji = '💪';
        } else {
            grade = 'F';
            emoji = '😅';
        }

        // 상위 N% 계산 (실제로는 더 정교한 통계 필요)
        const percentile = Math.max(5, 100 - Math.floor(this.wpm * 0.5));

        // UI 업데이트
        this.resultEmoji.textContent = emoji;
        this.resultTitle.setAttribute('data-i18n', 'result.title');
        this.resultTitle.textContent = i18n.t('result.title');
        this.resultGrade.textContent = grade;
        this.resultPercentile.innerHTML = `${i18n.t('result.percentile')}: <strong>${(i18n.t('result.top') || 'Top')} ${percentile}%</strong>`;

        this.resultWpm.parentElement.innerHTML = `
            <div class="result-stat-value">${this.wpm}</div>
            <div class="result-stat-label" data-i18n="result.wpm">${i18n.t('result.wpm')}</div>
        `;

        this.resultAccuracy.parentElement.innerHTML = `
            <div class="result-stat-value">${this.accuracy.toFixed(1)}%</div>
            <div class="result-stat-label" data-i18n="result.accuracy">${i18n.t('result.accuracy')}</div>
        `;
    }

    shareResult() {
        const shareTemplate = window.i18n?.t('share.text') || 'Typing Speed: {wpm} WPM / Accuracy: {accuracy}% (Grade: {grade}) - Try it!';
        const text = shareTemplate.replace('{wpm}', this.wpm).replace('{accuracy}', this.accuracy.toFixed(1)).replace('{grade}', this.getGrade());
        const url = window.location.href;

        // 웹 공유 API 사용 (지원하는 경우)
        if (navigator.share) {
            navigator.share({
                title: window.i18n?.t('share.title') || 'Typing Speed Test',
                text: text,
                url: url
            }).catch(() => { /* 사용자가 취소한 경우 */ });
        } else {
            // 폴백: 클립보드 복사
            const shareText = `${text}\n${url}`;
            navigator.clipboard.writeText(shareText).then(() => {
                alert(i18n.t('result.copied'));
            });
        }
    }

    getGrade() {
        if (this.wpm >= 100) return 'S';
        if (this.wpm >= 80) return 'A';
        if (this.wpm >= 60) return 'B';
        if (this.wpm >= 40) return 'C';
        if (this.wpm >= 20) return 'D';
        return 'F';
    }

    restartGame() {
        this.gameState = 'start';
        this.testText = '';
        this.typedText = '';
        this.startTime = null;
        this.endTime = null;
        this.testStarted = false;
        if (this.timerInterval) clearInterval(this.timerInterval);

        this.resultScreen.classList.remove('active');
        this.startScreen.classList.add('active');
    }

    backToStart() {
        this.restartGame();
    }
}

// Google Analytics 4
function initGA() {
    if (window.gtag) {
        gtag('event', 'page_view', {
            page_path: '/typing-speed/',
            page_title: '타이핑 속도 테스트'
        });
    }
}

// 앱 초기화
async function initApp() {
    // Loader 표시
    const loader = document.getElementById('app-loader');
    loader.classList.remove('hidden');

    try {
        // i18n 초기화
        await i18n.init();

        // Service Worker 등록
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(() => {
                // SW 등록 실패는 무시
            });
        }

        // GA 초기화
        initGA();

        // 앱 인스턴스 생성
        window.app = new TypingSpeedTest();

        // Loader 숨김
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 300);

    } catch (error) {
        console.error('Failed to initialize app:', error);
        loader.classList.add('hidden');
    }
}

// DOM 로드 완료 후 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
