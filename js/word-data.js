// 단어 모드 - 영어 단어 목록
const WORD_POOL = [
    // Common words
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
    'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
    'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
    'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
    'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
    'is', 'was', 'are', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
    'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can',
    'very', 'much', 'more', 'most', 'less', 'least', 'so', 'too', 'really', 'quite',
    'just', 'only', 'even', 'still', 'already', 'yet', 'never', 'always', 'sometimes',
    'hello', 'world', 'python', 'java', 'javascript', 'code', 'computer', 'program',
    'software', 'hardware', 'internet', 'website', 'online', 'digital', 'technology',
    'keyboard', 'typing', 'speed', 'fast', 'slow', 'quick', 'efficient', 'skill',
    'practice', 'improve', 'game', 'challenge', 'score', 'result', 'success', 'win',
    'test', 'simple', 'complex', 'easy', 'hard', 'difficult', 'possible', 'impossible',
    'start', 'stop', 'begin', 'end', 'continue', 'finish', 'complete', 'done'
];

// 문장 모드 - 유명 인용구
const SENTENCE_POOL = [
    "The only way to do great work is to love what you do.",
    "Innovation distinguishes between a leader and a follower.",
    "Life is what happens when you are busy making other plans.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "It is during our darkest moments that we must focus to see the light.",
    "The only impossible journey is the one you never begin.",
    "Success is not final, failure is not fatal.",
    "You miss one hundred percent of the shots you do not take.",
    "Whether you think you can, or you think you cannot, you are right.",
    "Believe you can and you are halfway there.",
    "The best time to plant a tree was twenty years ago.",
    "Do what you can with what you have, where you are.",
    "Quality is not an act, it is a habit.",
    "The way to get started is to quit talking and begin doing.",
    "Don't let yesterday take up too much of today.",
    "You learn more from failure than from success.",
    "It's not whether you get knocked down, it's whether you get up.",
    "If you are working on something that you really care about, you don't have to be pushed.",
    "People who are crazy enough to think they can change the world, are the ones who do.",
    "Failure is simply the opportunity to begin again, this time more intelligently."
];

// 한국어 문장들
const SENTENCE_POOL_KO = [
    "꿈이 없는 사람은 꿈꾸는 사람을 따라올 수 없다.",
    "성공이란 준비와 기회의 만남이다.",
    "어려움 없이 피는 꽃은 없다.",
    "포기하지 않으면 실패가 아니다.",
    "오늘 한 시간은 내일의 24시간보다 낫다.",
    "작은 시작이 큰 성공을 만든다.",
    "시간이 해결해 주는 것은 없다. 시간이 주는 것은 관점이다.",
    "실패는 성공의 어머니다.",
    "꾸준함이 천재를 이긴다.",
    "한 번의 실패가 모든 것을 끝내지는 않는다."
];

class WordData {
    constructor() {
        this.wordPool = WORD_POOL;
        this.sentencePool = SENTENCE_POOL;
        this.sentencePoolKo = SENTENCE_POOL_KO;
    }

    getRandomWords(count = 30) {
        const words = [];
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * this.wordPool.length);
            words.push(this.wordPool[randomIndex]);
        }
        return words.join(' ');
    }

    getRandomSentences(count = 3, isKorean = false) {
        const pool = isKorean ? this.sentencePoolKo : this.sentencePool;
        const sentences = [];
        const selected = new Set();

        while (sentences.length < count && selected.size < pool.length) {
            const randomIndex = Math.floor(Math.random() * pool.length);
            if (!selected.has(randomIndex)) {
                selected.add(randomIndex);
                sentences.push(pool[randomIndex]);
            }
        }

        return sentences.join(' ');
    }

    splitIntoWords(text) {
        return text.split(/\s+/).filter(w => w.length > 0);
    }
}

const wordData = new WordData();
