// 全局变量
let currentResults = null;
let currentView = 'detail';
let eventSource = null;

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    checkSystemHealth();
    initializeEventListeners();
});

// 检查系统健康状态
async function checkSystemHealth() {
    const statusBadge = document.getElementById('systemStatus');
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        if (data.api_configured) {
            statusBadge.textContent = '✓ ' + data.message;
            statusBadge.classList.add('healthy');
        } else {
            statusBadge.textContent = '⚠ ' + data.message;
            statusBadge.classList.add('error');
        }
    } catch (error) {
        statusBadge.textContent = '✗ 系统连接失败';
        statusBadge.classList.add('error');
    }
}

// 初始化事件监听器
function initializeEventListeners() {
    const form = document.getElementById('patientForm');
    form.addEventListener('submit', handleFormSubmit);
}

// 处理表单提交
async function handleFormSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;

    // 获取表单数据
    const formData = {
        disease_name: document.getElementById('diseaseName').value.trim(),
        chief_complaint: document.getElementById('chiefComplaint').value.trim(),
        four_examinations: document.getElementById('fourExaminations').value.trim(),
        special_conditions: document.getElementById('specialConditions').value.trim()
    };

    // 显示进度区域
    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('progressSection').style.display = 'block';
    document.getElementById('resultSection').style.display = 'none';

    // 重置所有进度条
    resetAllProgress();

    try {
        // 发送请求获取session_id
        const response = await fetch('/api/diagnose', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || '诊疗请求失败');
        }

        const result = await response.json();
        const sessionId = result.session_id;

        console.log('Session ID:', sessionId);

        // 立即连接SSE接收实时进度
        connectProgressStream(sessionId, (finalData) => {
            // 诊疗完成，显示结果
            currentResults = finalData;

            setTimeout(() => {
                displayResults(finalData);
                document.getElementById('progressSection').style.display = 'none';
                document.getElementById('resultSection').style.display = 'block';

                // 滚动到结果区域
                document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
            }, 500);
        });

    } catch (error) {
        alert('诊疗过程出错：' + error.message);
        console.error('Error:', error);

        // 恢复表单
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        document.getElementById('inputSection').style.display = 'block';
        document.getElementById('progressSection').style.display = 'none';
    }
}

// 连接SSE进度流
function connectProgressStream(sessionId, onComplete) {
    console.log('连接SSE进度流, Session ID:', sessionId);

    // 关闭之前的连接
    if (eventSource) {
        eventSource.close();
    }

    // 创建新的SSE连接
    eventSource = new EventSource(`/api/diagnose/progress/${sessionId}`);

    eventSource.onopen = function() {
        console.log('SSE连接已建立');
    };

    eventSource.onmessage = function(event) {
        console.log('收到SSE消息:', event.data);
        const data = JSON.parse(event.data);

        if (data.status === 'done') {
            // 诊疗完成
            console.log('诊疗完成');
            eventSource.close();
            completeAllProgress();
            if (onComplete) {
                onComplete(data.data);
            }
        } else if (data.status === 'error') {
            // 发生错误
            console.log('诊疗错误:', data.message);
            eventSource.close();
            alert('诊疗过程出错：' + data.message);
            document.getElementById('inputSection').style.display = 'block';
            document.getElementById('progressSection').style.display = 'none';
        } else {
            // 更新进度
            console.log('更新进度:', data);
            updateProgress(data.step, data.status, data.message);
        }
    };

    eventSource.onerror = function(error) {
        console.error('SSE连接错误:', error);
        eventSource.close();
    };
}

// 更新单个进度项
function updateProgress(step, status, message) {
    const element = document.getElementById(`progress${step}`);
    if (!element) return;

    const progressBar = element.querySelector('.progress-fill');
    const messageElement = element.querySelector('p');

    if (status === 'processing') {
        // 正在处理
        element.classList.remove('completed');
        element.classList.add('active');
        progressBar.style.width = '50%';
        if (message && messageElement) {
            messageElement.textContent = message;
        }
    } else if (status === 'completed') {
        // 已完成
        element.classList.remove('active');
        element.classList.add('completed');
        progressBar.style.width = '100%';
        if (messageElement) {
            const originalText = messageElement.getAttribute('data-original') || messageElement.textContent;
            if (!messageElement.getAttribute('data-original')) {
                messageElement.setAttribute('data-original', messageElement.textContent);
            }
            messageElement.textContent = message || originalText;
        }
    }
}

// 重置所有进度
function resetAllProgress() {
    for (let i = 1; i <= 7; i++) {
        const element = document.getElementById(`progress${i}`);
        if (element) {
            element.classList.remove('active', 'completed');
            const progressBar = element.querySelector('.progress-fill');
            if (progressBar) {
                progressBar.style.width = '0%';
            }
            // 恢复原始描述文本
            const messageElement = element.querySelector('p');
            if (messageElement && messageElement.getAttribute('data-original')) {
                messageElement.textContent = messageElement.getAttribute('data-original');
            }
        }
    }
}

// 完成所有进度
function completeAllProgress() {
    for (let i = 1; i <= 7; i++) {
        const element = document.getElementById(`progress${i}`);
        if (element) {
            element.classList.remove('active');
            element.classList.add('completed');
            const progressBar = element.querySelector('.progress-fill');
            if (progressBar) {
                progressBar.style.width = '100%';
            }
        }
    }
}

// 显示结果
function displayResults(data) {
    // 显示各个标签页的内容
    displayDiagnosis(data.diagnosis);
    displayAncientCases(data.ancient_cases);
    displayModernLiterature(data.modern_literature);
    displayPrescription(data.prescription);
    displayReview(data.review);
    displayRehabilitation(data.rehabilitation);
    
    // 显示完整报告
    displayFinalReport(data.final_report);
}

// 显示中医辨证
function displayDiagnosis(diagnosis) {
    const container = document.getElementById('diagnosis-tab');
    
    let html = '<div class="data-card">';
    html += '<h4>📋 辨证分析结果</h4>';
    
    if (diagnosis && diagnosis.raw) {
        html += formatContent(diagnosis.raw);
    } else {
        html += '<p>暂无辨证数据</p>';
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// 显示古籍病案
function displayAncientCases(ancient) {
    const container = document.getElementById('ancient-tab');
    
    let html = '<div class="data-card">';
    html += '<h4>📚 古籍病案分析</h4>';
    
    if (ancient && ancient.raw) {
        html += formatContent(ancient.raw);
    } else {
        html += '<p>暂无古籍病案数据</p>';
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// 显示现代文献
function displayModernLiterature(modern) {
    const container = document.getElementById('modern-tab');
    
    let html = '<div class="data-card">';
    html += '<h4>🔬 现代文献分析</h4>';
    
    if (modern && modern.raw) {
        html += formatContent(modern.raw);
    } else {
        html += '<p>暂无现代文献数据</p>';
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// 显示处方
function displayPrescription(prescription) {
    const container = document.getElementById('prescription-tab');
    
    let html = '<div class="data-card">';
    html += '<h4>💊 处方详情</h4>';
    
    if (prescription && prescription.raw) {
        html += formatContent(prescription.raw);
    } else {
        html += '<p>暂无处方数据</p>';
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// 显示审方结果
function displayReview(review) {
    const container = document.getElementById('review-tab');
    
    let html = '<div class="data-card">';
    html += '<h4>⚕️ 审方结果</h4>';
    
    if (review && review.raw) {
        // 检查是否有安全问题
        const content = review.raw.toLowerCase();
        if (content.includes('风险') || content.includes('禁忌') || content.includes('需调整')) {
            html += '<div class="alert alert-warning">⚠️ 发现用药安全提示，请仔细查看审方意见</div>';
        } else {
            html += '<div class="alert alert-success">✓ 处方安全性审核通过</div>';
        }
        
        html += formatContent(review.raw);
    } else {
        html += '<p>暂无审方数据</p>';
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// 显示康复理疗
function displayRehabilitation(rehab) {
    const container = document.getElementById('rehab-tab');
    
    let html = '<div class="data-card">';
    html += '<h4>🏃 康复理疗方案</h4>';
    
    if (rehab && rehab.raw) {
        html += formatContent(rehab.raw);
    } else {
        html += '<p>暂无康复理疗数据</p>';
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// 显示完整报告
function displayFinalReport(report) {
    const container = document.getElementById('finalReport');
    
    if (report) {
        // 将 Markdown 转换为 HTML（简单版本）
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

// 格式化内容（智能识别 JSON 或文本）
function formatContent(content) {
    if (!content) return '<p>暂无内容</p>';
    
    // 尝试解析为 JSON
    try {
        let jsonObj;
        
        // 尝试直接解析
        try {
            jsonObj = JSON.parse(content);
        } catch (e) {
            // 尝试提取 JSON 代码块
            const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                jsonObj = JSON.parse(jsonMatch[1]);
            } else {
                // 尝试提取花括号内容
                const braceMatch = content.match(/\{[\s\S]*\}/);
                if (braceMatch) {
                    jsonObj = JSON.parse(braceMatch[0]);
                } else {
                    throw new Error('Not JSON');
                }
            }
        }
        
        // 如果成功解析，格式化显示
        return formatJSON(jsonObj);
    } catch (e) {
        // 如果不是 JSON，直接显示文本
        return '<div style="white-space: pre-wrap; line-height: 1.8;">' + 
               escapeHtml(content) + 
               '</div>';
    }
}

// 格式化 JSON 显示
function formatJSON(obj, level = 0) {
    let html = '';
    const indent = '  '.repeat(level);
    
    if (Array.isArray(obj)) {
        html += '<div style="margin-left: ' + (level * 20) + 'px;">';
        obj.forEach((item, index) => {
            html += '<div style="margin: 8px 0;">';
            html += '<strong style="color: #2c5f2d;">[' + index + ']</strong> ';
            html += formatJSON(item, level + 1);
            html += '</div>';
        });
        html += '</div>';
    } else if (typeof obj === 'object' && obj !== null) {
        html += '<div style="margin-left: ' + (level * 20) + 'px;">';
        for (let key in obj) {
            html += '<div style="margin: 8px 0;">';
            html += '<strong style="color: #2c5f2d;">' + escapeHtml(key) + ':</strong> ';
            html += formatJSON(obj[key], level + 1);
            html += '</div>';
        }
        html += '</div>';
    } else {
        html += '<span style="color: #2d2d2d;">' + escapeHtml(String(obj)) + '</span>';
    }
    
    return html;
}

// HTML 转义
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// 切换标签页
function switchTab(tabName) {
    // 移除所有活动状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // 激活当前标签页
    event.target.classList.add('active');
    document.getElementById(tabName + '-tab').classList.add('active');
}

// 切换视图（详细数据 vs 完整报告）
function toggleView(view) {
    currentView = view;
    
    const detailView = document.getElementById('detailView');
    const reportView = document.getElementById('reportView');
    
    if (view === 'detail') {
        detailView.style.display = 'block';
        reportView.style.display = 'none';
    } else {
        detailView.style.display = 'none';
        reportView.style.display = 'block';
    }
}

// 导出报告
function exportReport() {
    if (!currentResults || !currentResults.final_report) {
        alert('暂无报告可导出');
        return;
    }
    
    const report = currentResults.final_report;
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '中医诊疗报告_' + new Date().toISOString().split('T')[0] + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    // 显示成功提示
    showNotification('报告已导出', 'success');
}

// 分享报告
function shareReport() {
    if (!currentResults || !currentResults.final_report) {
        alert('暂无报告可分享');
        return;
    }
    
    // 复制到剪贴板
    const report = currentResults.final_report;
    navigator.clipboard.writeText(report).then(() => {
        showNotification('报告已复制到剪贴板，可粘贴分享', 'success');
    }).catch(err => {
        alert('复制失败，请手动复制');
    });
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '100px';
    notification.style.right = '20px';
    notification.style.zIndex = '1000';
    notification.style.minWidth = '250px';
    notification.style.animation = 'fadeIn 0.3s ease';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 添加淡出动画
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(20px);
        }
    }
`;
document.head.appendChild(style);

