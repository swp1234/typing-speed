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
        this.difficulty = 'normal'; // easy, normal, hard
        this.timeLimit = 60;
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

        // 모드 선택 — show difficulty picker for word mode, start directly for sentence
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-mode');
                this.pendingMode = mode;
                if (mode === 'word') {
                    const diffSelect = document.getElementById('difficulty-select');
                    if (diffSelect) {
                        diffSelect.classList.remove('hidden');
                        diffSelect.scrollIntoView({ behavior: 'smooth' });
                    }
                } else {
                    this.startGame(mode);
                }
            });
        });

        // Difficulty selection
        document.querySelectorAll('.difficulty-card').forEach(btn => {
            btn.addEventListener('click', () => {
                this.difficulty = btn.getAttribute('data-difficulty');
                this.startGame(this.pendingMode || 'word');
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

        // Difficulty-based settings for word mode
        const diffConfig = { easy: { time: 90, words: 20 }, normal: { time: 60, words: 30 }, hard: { time: 30, words: 40 } };
        const config = diffConfig[this.difficulty] || diffConfig.normal;
        this.timeLimit = mode === 'word' ? config.time : 0;
        this.timeRemaining = this.timeLimit;

        // 테스트 텍스트 생성
        if (mode === 'word') {
            this.testText = wordData.getRandomWords(config.words);
        } else {
            this.testText = wordData.getRandomSentences(3, i18n.currentLang === 'ko');
        }

        // Hide difficulty select
        const diffSelect = document.getElementById('difficulty-select');
        if (diffSelect) diffSelect.classList.add('hidden');

        // 화면 전환
        this.startScreen.classList.remove('active');
        this.gameScreen.classList.add('active');
        this.resultScreen.classList.remove('active');

        this.updateDisplay();
        this.typingInput.focus();
    }

    handleTyping() {
        const input = this.typingInput.value;

        if (window.sfx) window.sfx.play('key');

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

        if (window.sfx && this.timeRemaining <= 10) window.sfx.play('tick');

        // 시간 경고 상태 + shake at 10s
        if (this.timeRemaining === 10) {
            this.shakeElement(this.timerDisplay);
            if (window.sfx) window.sfx.play('warning');
            if (typeof Haptic !== 'undefined') Haptic.medium();
        }
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

        const showResult = () => {
            // 화면 전환
            this.gameScreen.classList.remove('active');
            this.resultScreen.classList.add('active');

            this.displayResults();
        };

        if (typeof GameAds !== 'undefined') {
            GameAds.showInterstitial({ onComplete: showResult });
        } else {
            showResult();
        }
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
        const timeMs = this.mode === 'word' ? (this.timeLimit - this.timeRemaining) * 1000 : this.endTime - this.startTime;
        const timeMin = timeMs / 1000 / 60;

        // WPM 계산 (단어: 5글자)
        const charCount = this.typedText.length;
        const wpmRaw = (charCount / 5) / Math.max(timeMin, 0.1);
        this.wpm = Math.round(wpmRaw);

        // 정확도 적용한 조정 WPM
        const adjustedWpm = Math.round(this.wpm * (this.accuracy / 100));
        this.wpm = Math.max(0, adjustedWpm);

        // Save best WPM to localStorage
        const prevBest = parseInt(localStorage.getItem('typing_bestWPM') || '0', 10);
        if (this.wpm > prevBest) {
            localStorage.setItem('typing_bestWPM', this.wpm.toString());
            this.showNewBest();
            if (window.sfx) window.sfx.play('newbest');
        }

        // Track games played
        const tsGames = parseInt(localStorage.getItem('typing_gamesPlayed')) || 0;
        localStorage.setItem('typing_gamesPlayed', tsGames + 1);

        // Report to daily streak system
        if (typeof DailyStreak !== 'undefined') DailyStreak.report(this.wpm);

        // Report achievements
        if (typeof GameAchievements !== 'undefined') GameAchievements.report({
            bestWPM: parseInt(localStorage.getItem('typing_bestWPM')) || 0,
            gamesPlayed: parseInt(localStorage.getItem('typing_gamesPlayed')) || 0
        });
    }

    displayResults() {
        // Haptic feedback on test complete
        if (typeof Haptic !== 'undefined') {
            if (this.wpm >= 60) Haptic.success();
            else Haptic.light();
        }

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

        // SFX based on grade
        if (window.sfx) {
            if (grade === 'S') window.sfx.play('grade_s');
            else window.sfx.play('complete');
        }

        // Confetti + floating WPM for good scores
        if (this.wpm >= 60) this.spawnConfetti();
        if (this.wpm >= 40) this.showFloatingWpm(this.wpm, grade);

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

        // Inject rewarded ad button for 2x WPM score
        if (typeof GameAds !== 'undefined') {
            const originalWpm = this.wpm;
            GameAds.injectRewardButton({
                container: '#result-screen',
                label: '📺 Watch Ad for 2x WPM Score',
                onReward: () => {
                    this.wpm = originalWpm * 2;
                    const wpmEl = document.querySelector('#result-screen .result-stat-value');
                    if (wpmEl) wpmEl.textContent = this.wpm;
                    // Update best WPM if doubled score is higher
                    const prevBest = parseInt(localStorage.getItem('typing_bestWPM') || '0', 10);
                    if (this.wpm > prevBest) localStorage.setItem('typing_bestWPM', this.wpm.toString());
                }
            });
        }
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

        if (typeof GameAds !== 'undefined') GameAds.removeRewardButton('#result-screen');
        this.resultScreen.classList.remove('active');
        this.startScreen.classList.add('active');
    }

    backToStart() {
        this.restartGame();
    }

    shakeElement(el) {
        el.style.animation = 'ts-shake 0.4s ease';
        setTimeout(() => { el.style.animation = ''; }, 450);
    }

    showNewBest() {
        let el = document.getElementById('new-best-flash');
        if (!el) {
            el = document.createElement('div');
            el.id = 'new-best-flash';
            el.style.cssText = 'position:fixed;top:20%;left:50%;transform:translate(-50%,-50%) scale(0);font-size:32px;font-weight:800;color:#fbbf24;text-shadow:0 0 30px rgba(251,191,36,0.6);pointer-events:none;z-index:200;transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1),opacity 0.4s;opacity:0;white-space:nowrap;';
            document.body.appendChild(el);
        }
        el.textContent = '⚡ NEW BEST!';
        el.style.transform = 'translate(-50%,-50%) scale(1.2)';
        el.style.opacity = '1';
        setTimeout(() => {
            el.style.transform = 'translate(-50%,-50%) scale(0.8)';
            el.style.opacity = '0';
        }, 1200);
    }

    showFloatingWpm(wpm, grade) {
        const el = document.createElement('div');
        el.textContent = `${wpm} WPM — ${grade}`;
        el.style.cssText = 'position:fixed;top:25%;left:50%;transform:translateX(-50%);font-size:28px;font-weight:bold;color:#f39c12;z-index:9999;pointer-events:none;text-shadow:0 0 10px rgba(243,156,18,0.5);opacity:1;transition:all 1.2s ease-out;';
        document.body.appendChild(el);
        requestAnimationFrame(() => {
            el.style.top = '15%';
            el.style.opacity = '0';
        });
        setTimeout(() => el.remove(), 1400);
    }

    spawnConfetti() {
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.style.cssText = `position:fixed;width:8px;height:8px;border-radius:${Math.random()>.5?'50%':'0'};pointer-events:none;z-index:9999;background:${colors[i%colors.length]};left:${50+(Math.random()-.5)*60}%;top:40%;opacity:1;transition:all 1s ease-out;`;
            document.body.appendChild(p);
            const tx = (Math.random() - 0.5) * 200;
            const ty = -80 - Math.random() * 150;
            requestAnimationFrame(() => {
                p.style.transform = `translate(${tx}px, ${ty}px) rotate(${Math.random()*360}deg)`;
                p.style.opacity = '0';
            });
            setTimeout(() => p.remove(), 1200);
        }
    }
}

// Shake animation CSS
(function(){const s=document.createElement('style');s.textContent='@keyframes ts-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}';document.head.appendChild(s);})();

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

        // Initialize game ads
        if (typeof GameAds !== 'undefined') GameAds.init();

        // Initialize daily streak system
        if (typeof DailyStreak !== 'undefined') {
            DailyStreak.init({ gameId: 'typing-speed', bestScoreKey: 'typing_bestWPM', minTarget: 20, unit: 'WPM' });
        }

        if (typeof GameAchievements !== 'undefined') GameAchievements.init({
            gameId: 'typing-speed',
            defs: [
                { id: 'wpm_20', stat: 'bestWPM', target: 20, icon: '\u2328\uFE0F', name: 'Beginner Typist' },
                { id: 'wpm_40', stat: 'bestWPM', target: 40, icon: '\u2328\uFE0F', name: 'Typist' },
                { id: 'wpm_60', stat: 'bestWPM', target: 60, icon: '\u2328\uFE0F', name: 'Speed Demon' },
                { id: 'wpm_80', stat: 'bestWPM', target: 80, icon: '\u2328\uFE0F', name: 'Keyboard Master' },
                { id: 'wpm_100', stat: 'bestWPM', target: 100, icon: '\u2328\uFE0F', name: 'Legend' },
                { id: 'games_10', stat: 'gamesPlayed', target: 10, icon: '\uD83C\uDFAE', name: 'Regular' },
                { id: 'games_50', stat: 'gamesPlayed', target: 50, icon: '\uD83C\uDFAE', name: 'Dedicated' },
            ]
        });

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
