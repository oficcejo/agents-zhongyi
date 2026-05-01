// AI望诊问诊 - 交互逻辑

// ========== 全局状态 ==========
let currentStream = null;
let facingMode = 'user';
let currentResults = null;
let currentView = 'detail';
let eventSource = null;

// 采集数据
const collectedData = {
    faceImageBase64: null,
    tongueImageBase64: null,
    faceAnalysis: null,
    tongueAnalysis: null,
    rawTranscription: null,
    organizedInquiry: null,
    followupAnswers: []
};

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    checkSystemHealth();
});

async function checkSystemHealth() {
    const statusBadge = document.getElementById('systemStatus');
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        const issues = [];
        if (!data.api_configured) issues.push('DeepSeek');
        if (!data.vision_configured) issues.push('视觉模型');
        if (!data.asr_configured) issues.push('语音识别');
        if (!data.tts_configured) issues.push('语音合成');

        if (issues.length === 0) {
            statusBadge.textContent = '✓ 系统就绪';
            statusBadge.classList.add('healthy');
        } else {
            statusBadge.textContent = '⚠ ' + issues.join('/') + '未配置';
            statusBadge.classList.add('error');
        }
    } catch (error) {
        statusBadge.textContent = '✗ 连接失败';
        statusBadge.classList.add('error');
    }
}

// ========== 步骤导航 ==========
function goToStep(step) {
    // 停止摄像头
    stopCamera();

    // 隐藏所有步骤
    document.querySelectorAll('.diagnosis-step').forEach(el => {
        el.style.display = 'none';
    });

    // 显示目标步骤
    const targetStep = document.getElementById('step' + step);
    if (targetStep) {
        targetStep.style.display = 'block';
        targetStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // 更新步骤指示器
    document.querySelectorAll('.step-item').forEach(el => {
        const s = parseInt(el.dataset.step);
        el.classList.remove('active', 'completed');
        if (s < step) el.classList.add('completed');
        if (s === step) el.classList.add('active');
    });

    // 进入摄像头步骤时自动初始化
    if (step === 1) {
        setTimeout(() => initCamera('face'), 300);
    } else if (step === 2) {
        setTimeout(() => initCamera('tongue'), 300);
    }
}

// ========== 摄像头模块 ==========
async function initCamera(target) {
    const videoEl = document.getElementById(target + 'Video');
    const previewEl = document.getElementById(target + 'Preview');
    const guideEl = videoEl.parentElement.querySelector('.camera-guide');

    // 重置UI
    previewEl.style.display = 'none';
    videoEl.style.display = 'block';
    if (guideEl) guideEl.style.display = 'flex';

    document.getElementById(target + 'CameraControls').style.display = 'flex';
    document.getElementById(target + 'PreviewControls').style.display = 'none';

    // 检查 getUserMedia 是否可用
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('您的浏览器不支持摄像头访问。\n\n手机用户请注意：\n• 请使用 Chrome 或 Safari 浏览器\n• 需要通过 HTTPS 访问本页面\n• 请确保已授予摄像头权限');
        return;
    }

    // 尝试多种约束方案（移动端兼容）
    const constraintOptions = [
        // 方案1: 指定 facingMode + 理想分辨率
        {
            video: {
                facingMode: facingMode,
                width: { ideal: 1280 },
                height: { ideal: 960 }
            }
        },
        // 方案2: 仅指定 facingMode（移动端更兼容）
        {
            video: { facingMode: facingMode }
        },
        // 方案3: 不指定 facingMode（兜底）
        { video: true }
    ];

    for (let i = 0; i < constraintOptions.length; i++) {
        try {
            currentStream = await navigator.mediaDevices.getUserMedia(constraintOptions[i]);
            videoEl.srcObject = currentStream;
            return; // 成功，退出
        } catch (err) {
            console.warn(`摄像头约束方案${i + 1}失败:`, err.name, err.message);
            if (i === constraintOptions.length - 1) {
                // 所有方案都失败
                let msg = '无法访问摄像头';
                if (err.name === 'NotAllowedError') {
                    msg = '摄像头权限被拒绝。\n\n请在浏览器地址栏左侧点击🔒图标，允许摄像头权限后刷新页面重试。';
                } else if (err.name === 'NotFoundError') {
                    msg = '未找到摄像头设备。';
                } else if (err.name === 'NotReadableError') {
                    msg = '摄像头被其他应用占用，请关闭其他使用摄像头的应用后重试。';
                } else if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
                    msg = '手机浏览器需要 HTTPS 才能访问摄像头。\n\n请通过 https:// 访问本页面，或在电脑上使用 localhost 访问。';
                } else {
                    msg = '摄像头访问失败: ' + err.message;
                }
                alert(msg);
            }
        }
    }
}

function stopCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
}

function switchCamera(target) {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    stopCamera();
    initCamera(target);
}

function capturePhoto(target) {
    const video = document.getElementById(target + 'Video');
    const canvas = document.getElementById(target + 'Canvas');
    const preview = document.getElementById(target + 'Preview');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    preview.src = dataUrl;
    preview.style.display = 'block';
    video.style.display = 'none';

    const guide = video.parentElement.querySelector('.camera-guide');
    if (guide) guide.style.display = 'none';

    // 保存 base64
    if (target === 'face') {
        collectedData.faceImageBase64 = dataUrl;
    } else {
        collectedData.tongueImageBase64 = dataUrl;
    }

    // 切换按钮
    document.getElementById(target + 'CameraControls').style.display = 'none';
    document.getElementById(target + 'PreviewControls').style.display = 'flex';

    stopCamera();
}

function retakePhoto(target) {
    const preview = document.getElementById(target + 'Preview');
    preview.style.display = 'none';

    document.getElementById(target + 'PreviewControls').style.display = 'none';
    document.getElementById(target + 'CameraControls').style.display = 'flex';

    if (target === 'face') {
        collectedData.faceImageBase64 = null;
    } else {
        collectedData.tongueImageBase64 = null;
    }

    initCamera(target);
}

async function analyzePhoto(target) {
    const imageBase64 = target === 'face' ? collectedData.faceImageBase64 : collectedData.tongueImageBase64;
    if (!imageBase64) {
        alert('请先拍照');
        return;
    }

    const loadingEl = document.getElementById(target + 'Loading');
    const resultEl = document.getElementById(target + 'Result');
    const resultContent = document.getElementById(target + 'ResultContent');
    const previewControls = document.getElementById(target + 'PreviewControls');

    previewControls.style.display = 'none';
    loadingEl.style.display = 'block';
    resultEl.style.display = 'none';

    try {
        const endpoint = target === 'face' ? '/api/analyze-face' : '/api/analyze-tongue';
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageBase64 })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || '分析失败');
        }

        const data = await response.json();
        resultContent.textContent = data.analysis;

        if (target === 'face') {
            collectedData.faceAnalysis = data.analysis;
        } else {
            collectedData.tongueAnalysis = data.analysis;
        }

        loadingEl.style.display = 'none';
        resultEl.style.display = 'block';
    } catch (err) {
        loadingEl.style.display = 'none';
        previewControls.style.display = 'flex';
        alert('分析失败: ' + err.message);
    }
}

// ========== 症状输入模块 ==========
async function submitSymptoms() {
    const text = document.getElementById('symptomInput').value.trim();
    if (!text) {
        alert('请先描述您的症状');
        return;
    }

    collectedData.rawTranscription = text;
    document.getElementById('asrLoading').style.display = 'block';

    try {
        const response = await fetch('/api/transcribe-audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio: '', format: 'webm', transcription: text })
        });

        if (!response.ok) throw new Error('backend unavailable');

        const data = await response.json();
        collectedData.organizedInquiry = data.organized;
        document.getElementById('organizedText').value = data.organized;
    } catch (err) {
        collectedData.organizedInquiry = text;
        document.getElementById('organizedText').value = text;
    }

    document.getElementById('asrLoading').style.display = 'none';
    document.getElementById('transcriptionResult').style.display = 'block';
}

function editSymptoms() {
    document.getElementById('transcriptionResult').style.display = 'none';
    document.getElementById('symptomInput').focus();
}

// ========== 追问模块 ==========
async function generateFollowup() {
    // 使用编辑后的文本
    collectedData.organizedInquiry = document.getElementById('organizedText').value;

    document.getElementById('transcriptionResult').style.display = 'none';
    document.getElementById('followupLoading').style.display = 'block';
    document.getElementById('inquiryPhaseB').style.display = 'block';

    try {
        const response = await fetch('/api/generate-followup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ organized_text: collectedData.organizedInquiry })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || '生成追问失败');
        }

        const data = await response.json();
        renderFollowupCards(data.questions);

        document.getElementById('followupLoading').style.display = 'none';
        document.getElementById('inquiryCompleteActions').style.display = 'flex';
    } catch (err) {
        document.getElementById('followupLoading').style.display = 'none';
        alert('生成追问失败: ' + err.message);
        // 允许跳过追问
        document.getElementById('inquiryCompleteActions').style.display = 'flex';
    }
}

function renderFollowupCards(questions) {
    const container = document.getElementById('followupList');
    container.innerHTML = '';

    questions.forEach((q, i) => {
        const card = document.createElement('div');
        card.className = 'followup-card';
        card.dataset.index = i;
        card.innerHTML = `
            <div class="followup-question">
                <span class="q-number">${i + 1}</span>
                <span class="q-text">${escapeHtml(q)}</span>
                <button class="tts-btn" onclick="playTTS(this, '${escapeHtml(q).replace(/'/g, "\\'")}')" title="语音播放">🔊</button>
            </div>
            <div class="followup-answer">
                <textarea placeholder="请在此输入回答..." rows="2"></textarea>
            </div>
        `;
        container.appendChild(card);
    });
}

async function playTTS(btn, text) {
    btn.disabled = true;
    btn.textContent = '⏳';

    try {
        const response = await fetch('/api/synthesize-speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });

        if (!response.ok) {
            throw new Error('语音合成失败');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => {
            btn.textContent = '🔊';
            btn.disabled = false;
            URL.revokeObjectURL(url);
        };
        audio.onerror = () => {
            btn.textContent = '🔊';
            btn.disabled = false;
        };
        audio.play();
    } catch (err) {
        btn.textContent = '🔊';
        btn.disabled = false;
        console.error('TTS 错误:', err);
    }
}

function skipFollowup() {
    collectedData.followupAnswers = [];
    completeInquiry();
}

function completeInquiry() {
    // 收集追问回答
    collectedData.followupAnswers = [];
    document.querySelectorAll('.followup-card').forEach(card => {
        const question = card.querySelector('.q-text').textContent;
        const answer = card.querySelector('textarea').value.trim();
        if (answer) {
            collectedData.followupAnswers.push({ question, answer });
        }
    });

    // 更新问诊文本（合并追问回答）
    let fullInquiry = collectedData.organizedInquiry || '';
    if (collectedData.followupAnswers.length > 0) {
        fullInquiry += '\n\n【补充问诊】\n';
        collectedData.followupAnswers.forEach((item, i) => {
            fullInquiry += `\n${i + 1}. ${item.question}\n   回答：${item.answer}\n`;
        });
    }
    collectedData.organizedInquiry = fullInquiry;

    goToStep(4);
    populateReview();
}

// ========== 综合确认 ==========
function populateReview() {
    document.getElementById('reviewFaceResult').textContent = collectedData.faceAnalysis || '未进行望脸色分析';
    document.getElementById('reviewTongueResult').textContent = collectedData.tongueAnalysis || '未进行舌诊分析';
    document.getElementById('reviewInquiryText').value = collectedData.organizedInquiry || '';
}

function toggleCollapse(header) {
    const card = header.parentElement;
    card.classList.toggle('collapsed');
}

// ========== 最终提交 ==========
async function handleFinalSubmit() {
    const diseaseName = document.getElementById('reviewDiseaseName').value.trim();
    const specialConditions = document.getElementById('reviewSpecialConditions').value.trim();
    const inquiryText = document.getElementById('reviewInquiryText').value.trim();

    // 构建 four_examinations
    let fourExaminations = '';
    if (collectedData.faceAnalysis) {
        fourExaminations += '【望诊·面色】\n' + collectedData.faceAnalysis + '\n\n';
    }
    if (collectedData.tongueAnalysis) {
        fourExaminations += '【望诊·舌象】\n' + collectedData.tongueAnalysis + '\n\n';
    }
    if (inquiryText) {
        fourExaminations += '【问诊】\n' + inquiryText;
    }

    if (!fourExaminations.trim()) {
        alert('请至少完成一项望诊或问诊');
        return;
    }

    const formData = {
        disease_name: diseaseName || '',
        chief_complaint: '',
        four_examinations: fourExaminations.trim(),
        special_conditions: specialConditions || '无'
    };

    // 隐藏步骤，显示进度
    document.querySelectorAll('.diagnosis-step').forEach(el => el.style.display = 'none');
    document.getElementById('stepIndicator').style.display = 'none';
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('resultSection').style.display = 'none';
    resetAllProgress();

    const submitBtn = document.getElementById('finalSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="btn-icon">⏳</span> 提交中...';

    try {
        const response = await fetch('/api/diagnose', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || '提交失败');
        }

        const result = await response.json();
        const sessionId = result.session_id;

        connectProgressStream(sessionId, (finalData) => {
            currentResults = finalData;
            setTimeout(() => {
                displayResults(finalData);
                document.getElementById('progressSection').style.display = 'none';
                document.getElementById('resultSection').style.display = 'block';
                document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
            }, 500);
        });
    } catch (err) {
        alert('提交失败: ' + err.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="btn-icon">🚀</span> 提交到AI诊疗系统';
        document.querySelectorAll('.diagnosis-step').forEach(el => {
            if (el.id === 'step4') el.style.display = 'block';
        });
        document.getElementById('stepIndicator').style.display = 'flex';
        document.getElementById('progressSection').style.display = 'none';
    }
}

// ========== SSE 进度流 ==========
function connectProgressStream(sessionId, onComplete) {
    if (eventSource) eventSource.close();

    eventSource = new EventSource('/api/diagnose/progress/' + sessionId);

    eventSource.onmessage = function (event) {
        try {
            const data = JSON.parse(event.data);
            if (data.status === 'done') {
                eventSource.close();
                completeAllProgress();
                if (onComplete) onComplete(data.data);
            } else if (data.status === 'error') {
                eventSource.close();
                console.error('诊疗出错:', data.message);
                showDiagnosisError('诊疗出错: ' + (data.message || '未知错误'));
            } else {
                updateProgress(data.step, data.status, data.message);
            }
        } catch (e) {
            console.error('SSE 数据解析错误:', e, event.data);
        }
    };

    eventSource.onerror = function (e) {
        console.error('SSE 连接错误:', e);
        eventSource.close();
        showDiagnosisError('与服务器的连接中断，请重试');
    };
}

function showDiagnosisError(message) {
    alert(message);
    // 恢复 UI
    document.getElementById('progressSection').style.display = 'none';
    document.getElementById('stepIndicator').style.display = 'flex';
    document.querySelectorAll('.diagnosis-step').forEach(el => {
        if (el.id === 'step4') el.style.display = 'block';
    });
    const submitBtn = document.getElementById('finalSubmitBtn');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span class="btn-icon">🚀</span> 提交到AI诊疗系统';
}

function updateProgress(step, status, message) {
    const el = document.getElementById('progress' + step);
    if (!el) return;
    const bar = el.querySelector('.progress-fill');
    const msg = el.querySelector('p');

    if (status === 'processing') {
        el.classList.remove('completed');
        el.classList.add('active');
        bar.style.width = '50%';
        if (message && msg) msg.textContent = message;
    } else if (status === 'completed') {
        el.classList.remove('active');
        el.classList.add('completed');
        bar.style.width = '100%';
    }
}

function resetAllProgress() {
    for (let i = 1; i <= 7; i++) {
        const el = document.getElementById('progress' + i);
        if (el) {
            el.classList.remove('active', 'completed');
            const bar = el.querySelector('.progress-fill');
            if (bar) bar.style.width = '0%';
        }
    }
}

function completeAllProgress() {
    for (let i = 1; i <= 7; i++) {
        const el = document.getElementById('progress' + i);
        if (el) {
            el.classList.remove('active');
            el.classList.add('completed');
            const bar = el.querySelector('.progress-fill');
            if (bar) bar.style.width = '100%';
        }
    }
}

// ========== 结果展示 ==========
function displayResults(data) {
    displayTab('diagnosis', data.diagnosis, '📋 辨证分析结果');
    displayTab('ancient', data.ancient_cases, '📚 古籍病案分析');
    displayTab('modern', data.modern_literature, '🔬 现代文献分析');
    displayTab('prescription', data.prescription, '💊 处方详情');
    displayTab('review', data.review, '⚕️ 审方结果');
    displayTab('rehab', data.rehabilitation, '🏃 康复理疗方案');
    displayFinalReport(data.final_report);
}

function displayTab(tabName, data, title) {
    const container = document.getElementById(tabName + '-tab');
    let html = '<div class="data-card"><h4>' + title + '</h4>';
    if (data && data.raw) {
        html += formatContent(data.raw);
    } else {
        html += '<p>暂无数据</p>';
    }
    html += '</div>';
    container.innerHTML = html;
}

function displayFinalReport(report) {
    const container = document.getElementById('finalReport');
    if (report) {
        let html = report
            .replace(/### (.*)/g, '<h3>$1</h3>')
            .replace(/## (.*)/g, '<h2>$1</h2>')
            .replace(/# (.*)/g, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        container.innerHTML = '<p>' + html + '</p>';
    } else {
        container.innerHTML = '<p>暂无报告数据</p>';
    }
}

function formatContent(content) {
    if (!content) return '<p>暂无内容</p>';
    try {
        let obj;
        try { obj = JSON.parse(content); } catch (e) {
            const m = content.match(/```json\s*([\s\S]*?)\s*```/);
            if (m) { obj = JSON.parse(m[1]); } else {
                const b = content.match(/\{[\s\S]*\}/);
                if (b) { obj = JSON.parse(b[0]); } else throw new Error('Not JSON');
            }
        }
        return formatJSON(obj);
    } catch (e) {
        return '<div style="white-space:pre-wrap;line-height:1.8;">' + escapeHtml(content) + '</div>';
    }
}

function formatJSON(obj, level) {
    level = level || 0;
    let html = '';
    if (Array.isArray(obj)) {
        html += '<div style="margin-left:' + (level * 20) + 'px;">';
        obj.forEach(function (item, i) {
            html += '<div style="margin:8px 0;"><strong style="color:#2c5f2d;">[' + i + ']</strong> ';
            html += formatJSON(item, level + 1);
            html += '</div>';
        });
        html += '</div>';
    } else if (typeof obj === 'object' && obj !== null) {
        html += '<div style="margin-left:' + (level * 20) + 'px;">';
        for (var key in obj) {
            html += '<div style="margin:8px 0;"><strong style="color:#2c5f2d;">' + escapeHtml(key) + ':</strong> ';
            html += formatJSON(obj[key], level + 1);
            html += '</div>';
        }
        html += '</div>';
    } else {
        html += '<span style="color:#2d2d2d;">' + escapeHtml(String(obj)) + '</span>';
    }
    return html;
}

function escapeHtml(text) {
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(function (btn) { btn.classList.remove('active'); });
    document.querySelectorAll('.tab-pane').forEach(function (pane) { pane.classList.remove('active'); });
    event.target.classList.add('active');
    document.getElementById(tabName + '-tab').classList.add('active');
}

function toggleView(view) {
    currentView = view;
    document.getElementById('detailView').style.display = view === 'detail' ? 'block' : 'none';
    document.getElementById('reportView').style.display = view === 'report' ? 'block' : 'none';
}

function exportReport() {
    if (!currentResults || !currentResults.final_report) {
        alert('暂无报告可导出');
        return;
    }
    var blob = new Blob([currentResults.final_report], { type: 'text/markdown' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '中医诊疗报告_' + new Date().toISOString().split('T')[0] + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('报告已导出', 'success');
}

function shareReport() {
    if (!currentResults || !currentResults.final_report) {
        alert('暂无报告可分享');
        return;
    }
    navigator.clipboard.writeText(currentResults.final_report).then(function () {
        showNotification('报告已复制到剪贴板', 'success');
    }).catch(function () {
        alert('复制失败，请手动复制');
    });
}

function showNotification(message, type) {
    var n = document.createElement('div');
    n.className = 'alert alert-' + (type || 'info');
    n.textContent = message;
    n.style.cssText = 'position:fixed;top:100px;right:20px;z-index:1000;min-width:250px;animation:fadeIn 0.3s ease;';
    document.body.appendChild(n);
    setTimeout(function () {
        n.style.opacity = '0';
        n.style.transition = 'opacity 0.3s';
        setTimeout(function () { document.body.removeChild(n); }, 300);
    }, 3000);
}
