// ==================== 问题配置 ====================
// 可以在这里修改问答内容和选项文字
const questions = [
    { text: '我是不是超爱你！', leftText: '不是', rightText: '是' },
    { text: '我们不能总是对对方生气！', leftText: '不好', rightText: '好' },
    { text: '不准不理对方！！', leftText: '不好', rightText: '好' },
    { text: '知道我叫你亲密昵称有多少次吗！', leftText: '不知道', rightText: '知道' },
    { text: '有委屈了要告诉我知不知道！！', leftText: '不知道', rightText: '知道' },
    { text: '喜不喜欢和我亲亲🥺', leftText: '喜欢', rightText: '不喜欢' }
];

const state = {
    targetMood: 0,
    currentMood: 0,
    isOnFace: false,
    savedMood: 0,
    currentQuestion: 0,
    rightAnswers: 0,
    gameFinished: false
};

const elements = {
    body: document.body,
    face: document.getElementById('face'),
    faceGradient: document.getElementById('faceGradient'),
    mouth: document.getElementById('mouth'),
    pupilLeft: document.getElementById('pupilLeft'),
    pupilRight: document.getElementById('pupilRight'),
    eyeLeft: document.getElementById('eyeLeft'),
    eyeRight: document.getElementById('eyeRight'),
    characterContainer: document.getElementById('characterContainer'),
    particlesContainer: document.getElementById('particlesContainer'),
    emojisContainer: document.getElementById('emojisContainer'), // 表情容器
    blushLeft: document.querySelector('.blush-left'),
    blushRight: document.querySelector('.blush-right'),
    optionLeft: document.getElementById('optionLeft'),
    optionRight: document.getElementById('optionRight'),
    questionText: document.getElementById('questionText'),
    textContainer: document.getElementById('textContainer')
};

// ==================== 表情配置 ====================
// 可以在这里修改或添加表情
const emojis = [
    '😍', '🥰', '😘', '😝', '👻', '🥺',
    '(๑•ᴗ•๑)♡', '(◍＞◡＜◍)', 'ฅ₍ᐢ⸝⸝› ̫ ‹⸝⸝ᐢ₎ฅ˒˒', '•͈⚇•͈♡̷'
];

// ==================== 全局变量 ====================
let animationFrameId = null;  // 动画帧ID，用于取消动画
let mouseX = window.innerWidth / 2;   // 鼠标X坐标
let mouseY = window.innerHeight / 2;  // 鼠标Y坐标
let lastMouseX = window.innerWidth / 2; // 上一次鼠标X坐标
let lastMouseY = window.innerHeight / 2; // 上一次鼠标Y坐标
let mouseSpeed = 0;           // 鼠标移动速度（目前未使用）
let currentPupilX = 0;        // 当前瞳孔X偏移
let currentPupilY = 0;        // 当前瞳孔Y偏移
let targetPupilX = 0;         // 目标瞳孔X偏移
let targetPupilY = 0;         // 目标瞳孔Y偏移

// ==================== 初始化函数 ====================
function init() {
    createParticles();      // 创建粒子效果
    createEmojis();        // 创建表情浮动效果
    bindEvents();           // 绑定事件监听
    startAnimationLoop();   // 启动动画循环
    updateDisplay();        // 更新显示内容
}

// ==================== 表情浮动系统 ====================
// 创建表情元素并设置随机位置和动画
function createEmojis() {
    elements.emojisContainer.innerHTML = '';
    const emojiCount = 20;  // 表情数量，可以调整

    for (let i = 0; i < emojiCount; i++) {
        const emoji = document.createElement('div');
        emoji.className = 'emoji';

        // 随机选择表情
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];

        // 随机大小（1.2rem - 2.5rem）
        const size = Math.random() * 1.3 + 1.2;
        emoji.style.fontSize = `${size}rem`;

        // 保存历史位置（用于避免重复）
        emoji.lastPositions = [];

        // 设置初始位置
        setRandomPosition(emoji);

        // 随机延迟开始动画
        const startDelay = Math.random() * 5;
        setTimeout(() => {
            startEmojiAnimation(emoji);
        }, startDelay * 1000);

        elements.emojisContainer.appendChild(emoji);
    }
}

// 设置随机位置（避免重复）
function setRandomPosition(emoji) {
    let newLeft, newTop;
    let attempts = 0;

    // 尝试找到一个不在历史记录中的位置
    do {
        newLeft = Math.random() * 85 + 5;
        newTop = Math.random() * 80 + 10;
        attempts++;

        // 检查是否与最近5次的位置重复
        const isDuplicate = emoji.lastPositions.some(pos => {
            return Math.abs(pos.left - newLeft) < 8 && Math.abs(pos.top - newTop) < 8;
        });

        if (!isDuplicate || attempts > 30) break;
    } while (true);

    // 更新位置
    emoji.style.left = `${newLeft}%`;
    emoji.style.top = `${newTop}%`;

    // 记录历史位置（只保留最近5次）
    emoji.lastPositions.push({ left: newLeft, top: newTop });
    if (emoji.lastPositions.length > 5) {
        emoji.lastPositions.shift();
    }

    // 随机换一个新表情
    emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
}

// 开始表情淡入淡出动画
function startEmojiAnimation(emoji) {
    // 淡入
    emoji.style.transition = 'opacity 1.5s ease-in-out';
    emoji.style.opacity = '0.7';

    // 保持显示1.5秒
    setTimeout(() => {
        // 淡出
        emoji.style.opacity = '0';

        // 淡出后更换位置并重新开始
        setTimeout(() => {
            setRandomPosition(emoji);
            startEmojiAnimation(emoji);
        }, 1500);
    }, 1500);
}

// ==================== 粒子系统 ====================
// 可以修改粒子数量：const count = 20;
function createParticles() {
    elements.particlesContainer.innerHTML = '';
    const count = 20;  // 粒子数量，可以调整

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // 随机粒子大小（5-15px）
        const size = Math.random() * 10 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 10}s`;
        particle.style.animationDuration = `${Math.random() * 5 + 8}s`;

        updateParticleColor(particle, 0);

        elements.particlesContainer.appendChild(particle);
    }
}

// 根据情绪更新粒子颜色
function updateParticleColor(particle, mood) {
    let r, g, b, opacity;

    if (mood > 0) {
        // 惊恐时：偏蓝粉色
        r = 255;
        g = Math.round(190 + mood * 40);
        b = Math.round(210 - mood * 30);
    } else if (mood < 0) {
        // 开心时：偏暖色
        r = Math.round(255 + mood * 50);
        g = Math.round(190 + Math.abs(mood) * 30);
        b = Math.round(210 + Math.abs(mood) * 20);
    } else {
        // 中立时
        r = 255;
        g = 190;
        b = 210;
    }

    opacity = 0.3 + Math.abs(mood) * 0.15;
    particle.style.background = `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// ==================== 动画循环 ====================
function startAnimationLoop() {
    function animate() {
        updateMood();       // 更新情绪值
        updatePupils();     // 更新瞳孔位置
        updateFace();       // 更新脸部外观
        animationFrameId = requestAnimationFrame(animate);
    }
    animate();
}

// ==================== 情绪系统 ====================
// 即时响应模式：currentMood直接等于targetMood
// 如果想要平滑过渡，可以改为：state.currentMood += (state.targetMood - state.currentMood) * 0.5;
function updateMood() {
    state.currentMood = state.targetMood;
}

// ==================== 瞳孔跟随系统 ====================
// 可以调整瞳孔跟随速度：speed值越大跟随越快（0.05-0.5之间推荐）
function updatePupils() {
    const speed = 0.15;  // 瞳孔跟随速度，值越大跟随越快
    currentPupilX += (targetPupilX - currentPupilX) * speed;
    currentPupilY += (targetPupilY - currentPupilY) * speed;

    elements.pupilLeft.style.transform = `translate(calc(-50% + ${currentPupilX}px), calc(-50% + ${currentPupilY}px))`;
    elements.pupilRight.style.transform = `translate(calc(-50% + ${currentPupilX}px), calc(-50% + ${currentPupilY}px))`;
}

// ==================== 脸部表情更新 ====================
// 这是核心的表情渲染逻辑
function updateFace() {
    const mood = state.currentMood;

    // 更新脸部颜色
    const faceR = 255 + mood * 30;
    const faceG = 214 - mood * 20;
    const faceB = 204 + mood * 20;
    elements.face.style.background = `rgb(${faceR}, ${faceG}, ${faceB})`;

    // 更新脸上部蓝色渐变（惊恐时有）
    if (mood < 0) {
        elements.faceGradient.style.background = 'transparent';
    } else if (mood > 0) {
        const intensity = mood;
        elements.faceGradient.style.background = `linear-gradient(to bottom, rgba(100, 150, 255, ${intensity * 0.6}), transparent 70%)`;
    } else {
        elements.faceGradient.style.background = 'transparent';
    }

    // 更新背景颜色
    let bgR, bgG, bgB;
    if (mood > 0) {
        bgR = 240 - mood * 30;
        bgG = 244 - Math.abs(mood) * 10;
        bgB = 248 - Math.abs(mood) * 10;
    } else if (mood < 0) {
        bgR = 255;
        bgG = 240 + mood * 20;
        bgB = 245 + mood * 30;
    } else {
        bgR = 255;
        bgG = 245;
        bgB = 248;
    }

    elements.body.style.background = `linear-gradient(135deg, rgb(${bgR}, ${bgG}, ${bgB}) 0%, rgb(${bgR - 10}, ${bgG - 7}, ${bgB - 6}) 50%, rgb(${bgR - 20}, ${bgG - 14}, ${bgB - 12}) 100%)`;

    // 更新所有粒子颜色
    const particles = elements.particlesContainer.querySelectorAll('.particle');
    particles.forEach(particle => updateParticleColor(particle, -mood));

    // 更新眼睛大小
    const baseEyeSize = 40;
    const eyeSizeChange = mood > 0 ? mood * 15 : Math.abs(mood) * 10;
    const eyeSize = baseEyeSize + eyeSizeChange;
    elements.eyeLeft.style.width = `${eyeSize}px`;
    elements.eyeLeft.style.height = `${eyeSize}px`;
    elements.eyeRight.style.width = `${eyeSize}px`;
    elements.eyeRight.style.height = `${eyeSize}px`;

    // ==================== 嘴巴渲染 ====================
    // 嘴巴基础尺寸
    const mouthWidth = 50;
    const mouthHeight = 50;
    elements.mouth.style.width = `${mouthWidth}px`;
    elements.mouth.style.height = `${mouthHeight}px`;
    elements.mouth.style.background = 'white';  // 嘴巴颜色固定为白色

    if (state.isOnFace) {
        // 悬停在脸上时：圆形嘴巴
        elements.mouth.style.borderRadius = '50%';
        elements.mouth.style.bottom = '35px';
    } else {
        if (mood > 0) {
            // 靠近右边按钮（惊恐）：嘴巴上部圆角变大，呈惊恐状
            const scaredIntensity = mood;
            // borderRadius: 左上 右上 右下 左下 - 上部圆角大
            elements.mouth.style.borderRadius = `${50 + scaredIntensity * 50}% ${50 + scaredIntensity * 50}% 50% 50%`;
            elements.mouth.style.bottom = `${35 - scaredIntensity * 5}px`;
            elements.mouth.style.width = `${50 + scaredIntensity * 15}px`;
            elements.mouth.style.height = `${40 + scaredIntensity * 10}px`;
        } else if (mood < 0) {
            // 靠近左边按钮（开心）：嘴巴下部圆角变大，呈微笑状
            const smileIntensity = Math.abs(mood);
            // borderRadius: 左上 右上 右下 左下 - 下部圆角大
            elements.mouth.style.borderRadius = `50% 50% ${50 + smileIntensity * 50}% ${50 + smileIntensity * 50}%`;
            elements.mouth.style.bottom = `${35 + smileIntensity * 8}px`;
            elements.mouth.style.width = `${50 + smileIntensity * 15}px`;
            elements.mouth.style.height = `${40 + smileIntensity * 10}px`;
        } else {
            // 默认：圆形嘴巴
            elements.mouth.style.borderRadius = '50%';
            elements.mouth.style.bottom = '35px';
        }
    }

    // 更新脸红晕透明度
    const blushOpacity = mood < 0 ? 0.4 + Math.abs(mood) * 0.4 : 0.4;
    elements.blushLeft.style.opacity = blushOpacity;
    elements.blushRight.style.opacity = blushOpacity;
}

// ==================== 情绪计算 ====================
// 根据鼠标位置计算机器人的情绪
// 可以调整影响范围：maxDist（最大影响距离）, minDist（完全影响距离）
function calculateMood(x, y) {
    if (state.isOnFace || state.gameFinished) {
        return state.savedMood;
    }

    const leftBtn = document.getElementById('optionLeft');
    const rightBtn = document.getElementById('optionRight');

    const leftRect = leftBtn.getBoundingClientRect();
    const rightRect = rightBtn.getBoundingClientRect();

    // 计算两个按钮的中心点
    const leftCenterX = leftRect.left + leftRect.width / 2;
    const leftCenterY = leftRect.top + leftRect.height / 2;
    const rightCenterX = rightRect.left + rightRect.width / 2;
    const rightCenterY = rightRect.top + rightRect.height / 2;

    // 计算鼠标到两个按钮的距离
    const distToLeft = Math.sqrt(Math.pow(x - leftCenterX, 2) + Math.pow(y - leftCenterY, 2));
    const distToRight = Math.sqrt(Math.pow(x - rightCenterX, 2) + Math.pow(y - rightCenterY, 2));

    // ==================== 距离参数调整 ====================
    // maxDist: 超过这个距离则不影响情绪
    // minDist: 小于这个距离则完全影响情绪
    const maxDist = 500;  // 最大影响距离（像素）
    const minDist = 50;   // 完全影响距离（像素）

    // 计算影响力（距离越近影响越大）
    let leftInfluence = Math.max(0, 1 - (distToLeft - minDist) / (maxDist - minDist));
    let rightInfluence = Math.max(0, 1 - (distToRight - minDist) / (maxDist - minDist));

    // 综合计算情绪值
    let mood = leftInfluence - rightInfluence;
    mood = Math.max(-1, Math.min(1, mood));  // 限制在-1到1之间

    return mood;
}

// ==================== 瞳孔位置计算 ====================
// 根据鼠标位置计算瞳孔应该移动到的位置
// 可以调整maxMove限制瞳孔最大移动距离
function calculatePupilPosition(x, y) {
    const eyeRect = elements.eyeLeft.getBoundingClientRect();
    const eyeCenterX = eyeRect.left + eyeRect.width / 2;
    const eyeCenterY = eyeRect.top + eyeRect.height / 2;

    const maxMove = 8;  // 瞳孔最大移动距离（像素）

    let dx = x - eyeCenterX;
    let dy = y - eyeCenterY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
        dx = dx / distance;
        dy = dy / distance;

        // 瞳孔移动距离根据鼠标距离缩放
        const moveAmount = Math.min(maxMove, distance / 30);
        targetPupilX = dx * moveAmount;
        targetPupilY = dy * moveAmount;
    } else {
        targetPupilX = 0;
        targetPupilY = 0;
    }
}

// ==================== 问答系统 ====================
// 更新显示当前问题和选项
function updateDisplay() {
    const question = questions[state.currentQuestion];
    elements.questionText.textContent = question.text;
    elements.optionLeft.querySelector('.option-text').textContent = question.leftText;
    elements.optionRight.querySelector('.option-text').textContent = question.rightText;
}

// 处理用户选择
function handleChoice(isRight) {
    if (state.gameFinished) return;

    if (isRight) {
        state.rightAnswers++;  // 右边答案计数+1
    }

    state.currentQuestion++;

    if (state.currentQuestion >= questions.length) {
        showResult();  // 所有问题回答完毕，显示结果
    } else {
        updateDisplay();  // 显示下一题
    }
}

// ==================== 结果处理 ====================
// 显示测试结果并跳转
function showResult() {
    state.gameFinished = true;

    // 根据右边答案次数决定结果类型
    const resultType = state.rightAnswers === 6 ? 'perfect' : 'normal';
    window.location.href = `result.html?result=${resultType}`;
}

// ==================== 事件绑定 ====================
function bindEvents() {
    // 鼠标移动事件
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // 计算鼠标速度（用于未来功能扩展）
        const dx = mouseX - lastMouseX;
        const dy = mouseY - lastMouseY;
        const currentSpeed = Math.sqrt(dx * dx + dy * dy);
        mouseSpeed = mouseSpeed * 0.7 + currentSpeed * 0.3;

        lastMouseX = mouseX;
        lastMouseY = mouseY;

        // 检测鼠标是否在脸上
        const faceRect = elements.face.getBoundingClientRect();
        const wasOnFace = state.isOnFace;
        state.isOnFace = isMouseInRect(mouseX, mouseY, faceRect);

        // 刚进入脸部区域时保存当前情绪
        if (state.isOnFace && !wasOnFace) {
            state.savedMood = state.currentMood;
        }

        // 不在脸上时更新目标情绪
        if (!state.isOnFace) {
            state.targetMood = calculateMood(mouseX, mouseY);
        }

        // 更新瞳孔跟随目标
        calculatePupilPosition(mouseX, mouseY);
    });

    // 鼠标离开窗口
    document.addEventListener('mouseleave', () => {
        state.targetMood = 0;
        state.isOnFace = false;
        targetPupilX = 0;
        targetPupilY = 0;
    });

    // 选项按钮点击事件
    elements.optionLeft.addEventListener('click', () => {
        handleChoice(false);
    });
    elements.optionRight.addEventListener('click', () => {
        handleChoice(true);
    });
}

// ==================== 工具函数 ====================
// 检测点是否在矩形内
function isMouseInRect(x, y, rect) {
    return x >= rect.left && x <= rect.right &&
        y >= rect.top && y <= rect.bottom;
}

// ==================== 启动 ====================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
