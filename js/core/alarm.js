/* ==========================================
   ALARM / HATIRLATICI KONTROL SİSTEMİ
   ========================================== */
function playSineWaveAlarm() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const oscillator2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator2.type = 'triangle';
        
        oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.2); // E5
        oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.4); // G5
        
        oscillator2.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        oscillator2.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.2);
        oscillator2.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.4);

        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
        
        oscillator.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator2.start();
        oscillator.stop(audioCtx.currentTime + 1.5);
        oscillator2.stop(audioCtx.currentTime + 1.5);
    } catch(e) {
        console.warn("Ses çalınamadı:", e);
    }
}

function showAlarmModal(alarm, teacherId) {
    const modal = document.createElement('div');
    modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index: 10000; display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.3s ease;";
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 16px; padding: 30px; width: 90%; max-width: 400px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3); transform: scale(0.9); transition: 0.3s ease;">
            <div style="font-size: 3rem; margin-bottom: 10px;">⏰</div>
            <h2 style="margin: 0 0 10px 0; color: #333;">${alarm.time}</h2>
            <p style="font-size: 1.2rem; color: #555; margin-bottom: 25px;">${alarm.note}</p>
            
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <button class="btn btn-secondary" onclick="snoozeAlarm(this, '${teacherId}', ${alarm.id}, 5)" style="flex: 1; min-width: 120px;">5 Dk Ertele</button>
                <button class="btn btn-primary" onclick="dismissAlarm(this, '${teacherId}', ${alarm.id})" style="flex: 1; min-width: 120px;">Tamamla</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    requestAnimationFrame(() => {
        modal.style.opacity = "1";
        modal.children[0].style.transform = "scale(1)";
    });

    if(navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
}

window.snoozeAlarm = function(btn, teacherId, alarmId, mins) {
    const modal = btn.closest('div').parentNode.parentNode;
    modal.style.opacity = "0";
    setTimeout(() => modal.remove(), 300);
    
    const alarm = appState.teacherAlarms[teacherId].find(a => a.id === alarmId);
    if (alarm) {
        let [h, m] = alarm.time.split(':').map(Number);
        let date = new Date();
        date.setHours(h, m, 0, 0);
        date.setMinutes(date.getMinutes() + mins);
        alarm.time = date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
        alarm.isNotified = false;
        
        saveTeachers();
        if (document.getElementById('teacher-alarms-list')) renderTeacherAlarms();
    }
};

window.dismissAlarm = function(btn, teacherId, alarmId) {
    const modal = btn.closest('div').parentNode.parentNode;
    modal.style.opacity = "0";
    setTimeout(() => modal.remove(), 300);
    
    const alarm = appState.teacherAlarms[teacherId].find(a => a.id === alarmId);
    if (alarm) {
        alarm.isCompleted = true;
        saveTeachers();
        if (document.getElementById('teacher-alarms-list')) renderTeacherAlarms();
    }
};

// 30 saniyede bir saati kontrol et
setInterval(() => {
    // Sadece dashboard (sistem) veya öğretmen paneli içerisindeyken çalışsın
    if (appState.currentView !== 'dashboard-section' && appState.currentView !== 'teacher-section') return; 
    
    const activeTeacher = appState.teachers.find(t => t.email === appState.currentUser);
    if (!activeTeacher) return;
    
    const teacherId = activeTeacher.id;
    const alarms = appState.teacherAlarms[teacherId] || [];
    
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${h}:${m}`;

    let alarmTriggered = false;

    alarms.forEach(alarm => {
        if (!alarm.isCompleted && !alarm.isNotified && alarm.time === currentTime) {
            alarm.isNotified = true; // Sadece o dakika içinde bir kez çalması için flag
            alarmTriggered = true;
            playSineWaveAlarm();
            showAlarmModal(alarm, teacherId);
            
            // Masaüstü Bildirimi Gönder
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("⏰ Ders Hatırlatıcısı", {
                    body: alarm.note,
                    icon: "https://cdn-icons-png.flaticon.com/512/825/825590.png"
                });
            }
        }
    });

    if (alarmTriggered) {
        saveTeachers();
        if (document.getElementById('teacher-alarms-list')) {
            renderTeacherAlarms();
        }
    }
}, 30000);

window.showCustomAlert = function(message) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
    overlay.style.backdropFilter = 'blur(4px)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.animation = 'fadeIn 0.2s ease-out forwards';
    
    const modal = document.createElement('div');
    modal.className = 'glass-card';
    modal.style.background = 'white';
    modal.style.padding = '30px';
    modal.style.borderRadius = '12px';
    modal.style.maxWidth = '400px';
    modal.style.textAlign = 'center';
    modal.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
    modal.style.borderTop = '5px solid #F39C12';
    
    modal.innerHTML = `
        <div style="font-size: 3rem; color: #F39C12; margin-bottom: 15px;">
            <i class="fas fa-exclamation-circle"></i>
        </div>
        <h3 style="margin-bottom: 15px; color: #333;">Uyarı</h3>
        <p style="color: #666; margin-bottom: 25px; line-height: 1.5;">${message}</p>
        <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()" style="width: 100%; border-radius: 8px;">Tamam</button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
};

window.updateStudent = function(email, safeEmailId) {
    const nameEl = document.getElementById(`student-name-${safeEmailId}`);
    const phoneEl = document.getElementById(`student-phone-${safeEmailId}`);
    const profEl = document.getElementById(`student-prof-${safeEmailId}`);
    
    if (!nameEl || !phoneEl || !profEl) return;
    
    const newName = nameEl.innerText.trim();
    const newPhone = phoneEl.innerText.trim();
    const newProf = profEl.innerText.trim();
    
    if (typeof firebase !== 'undefined' && isFirebaseReady) {
        db.collection('users').doc(email).update({
            name: newName,
            phone: newPhone,
            profession: newProf
        }).then(() => {
            showCustomAlert("Öğrenci bilgileri başarıyla güncellendi.");
        }).catch(err => {
            console.error("Güncelleme hatası:", err);
            showCustomAlert("Güncelleme sırasında bir hata oluştu.");
        });
    } else {
        // Mock fallback
        let users = JSON.parse(localStorage.getItem('mockUsers') || '{}');
        if (users[email]) {
            users[email].name = newName;
            users[email].phone = newPhone;
            users[email].profession = newProf;
            localStorage.setItem('mockUsers', JSON.stringify(users));
            showCustomAlert("Mock DB: Öğrenci güncellendi.");
        }
    }
};

window.deleteStudent = async function(email) {
    if (!await showCustomConfirm(`Emin misiniz? '${email}' adresli öğrencinin tüm bilgileri ve hesabı silinecek!`)) return;
    
    if (typeof firebase !== 'undefined' && isFirebaseReady) {
        db.collection('users').doc(email).delete().then(() => {
            showCustomAlert("Öğrenci başarıyla silindi.");
            renderAdminStudentList(); // Listeyi yenile
        }).catch(err => {
            console.error("Silme hatası:", err);
            showCustomAlert("Öğrenci silinirken bir hata oluştu.");
        });
    } else {
        let users = JSON.parse(localStorage.getItem('mockUsers') || '{}');
        if (users[email]) {
            delete users[email];
            localStorage.setItem('mockUsers', JSON.stringify(users));
            showCustomAlert("Mock DB: Öğrenci silindi.");
            renderAdminStudentList();
        }
    }
};

function renderKazanimStepsHTML(pkgId, pkgName) {
    let pkgData = appState.kazanimData[pkgId] || { total: 5, steps: {} };
    let totalCount = pkgData.total;
    
    let html = `
        <details class="admin-details" style="margin-top: 10px; background: #fafafa; border: 1px solid #eee; border-radius: 6px;">
            <summary class="admin-summary" style="padding: 8px; font-size:0.8rem; color:#2c3e50; font-weight:bold;">
                Müfredat & Kazanım Yönetimi
            </summary>
            <div style="padding: 8px; border-top: 1px solid #eee;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 0.75rem; color:#666;">Müfredat Adımları</span>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <label style="margin: 0; font-size:0.7rem;">Adım:</label>
                        <input type="number" id="kazanim-total-${pkgId}" value="${totalCount}" style="width: 35px; padding: 2px; border: 1px solid #ccc; border-radius: 4px; font-size:0.7rem;">
                        <button class="btn btn-sm btn-primary" style="padding: 2px 5px; font-size:0.7rem;" onclick="updateTotalKazanimCount(${pkgId})">Uygula</button>
                        <button class="btn btn-sm" style="padding: 2px 5px; font-size:0.7rem; background:#8e44ad; color:white; border:none;" onclick="previewPackage(${pkgId}, '${(pkgName).replace(/'/g, "\\'")}')">👁️ Önizle</button>
                    </div>
                </div>
                <div style="background: white; border-radius: 6px; border: 1px solid #eee; padding: 5px; max-height: 150px; overflow-y: auto;">
    `;
    
    for (let i = 1; i <= totalCount; i++) {
        let stepData = pkgData.steps[i] || {};
        let isConfigured = Object.keys(stepData).length > 0 ? "<span style='color:green;'>✅</span>" : "<span style='color:orange;'>⚠️</span>";
        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; border: 1px solid #eee; padding: 3px 6px; border-radius: 4px; margin-bottom: 3px; background: #fafafa;">
                <span style="font-size:0.75rem;"><strong style="color: #2980b9;">Adım ${i}</strong> ${isConfigured}</span>
                <button class="btn btn-sm" style="background:#f39c12; color:white; border:none; padding: 2px 6px; font-size:0.7rem; border-radius:3px;" onclick="openKazanimStepModal(${pkgId}, ${i})">✏️ Düzenle</button>
            </div>
        `;
    }
    
    html += `</div></div></details>`;
    return html;
}

window.renderAdminPackageManagement = function() {
    renderAdminOfflinePackages();
    renderAdminOnlinePackages();
};

window.switchAdminPackageTab = function(tabName) {
    const offlineBtn = document.getElementById('tab-btn-offline');
    const onlineBtn = document.getElementById('tab-btn-online');
    const offlineContent = document.getElementById('tab-content-offline');
    const onlineContent = document.getElementById('tab-content-online');
    
    if (tabName === 'offline') {
        offlineBtn.style.background = '#20C997';
        offlineBtn.style.color = 'white';
        onlineBtn.style.background = '#f1f5f9';
        onlineBtn.style.color = '#555';
        
        offlineContent.style.display = 'block';
        onlineContent.style.display = 'none';
    } else {
        onlineBtn.style.background = '#4facfe';
        onlineBtn.style.color = 'white';
        offlineBtn.style.background = '#f1f5f9';
        offlineBtn.style.color = '#555';
        
        onlineContent.style.display = 'block';
        offlineContent.style.display = 'none';
    }
};

window.updateTotalKazanimCount = function(pkgId) {
    const val = parseInt(document.getElementById(`kazanim-total-${pkgId}`).value);
    if (!val || val < 1) return showCustomAlert("Geçersiz sayı.");
    
    if (!appState.kazanimData[pkgId]) appState.kazanimData[pkgId] = { total: val, steps: {} };
    else appState.kazanimData[pkgId].total = val;
    
    localStorage.setItem('mockKazanimData', JSON.stringify(appState.kazanimData));
    saveTeachers();
    showCustomAlert("Toplam kazanım sayısı güncellendi.");
    renderAdminPackageManagement();
};

window.openKazanimStepModal = function(pkgId, stepNum) {
    if (!appState.kazanimData[pkgId]) appState.kazanimData[pkgId] = { total: 5, steps: {} };
    if (!appState.kazanimData[pkgId].steps) appState.kazanimData[pkgId].steps = {};
    
    let stepData = appState.kazanimData[pkgId].steps[stepNum] || { contentBlocks: [], question: { type: 'none' } };
    
    // Convert old format to new format on the fly if needed
    if (stepData.text && (!stepData.contentBlocks || stepData.contentBlocks.length === 0)) {
        stepData.contentBlocks = [{type: 'text', content: stepData.text}];
        delete stepData.text;
    }
    if (typeof stepData.question === 'string') {
        stepData.question = { type: 'multiple_choice', text: stepData.question, options: ["", ""], correctOptionIndex: 0 };
    }
    
    let modal = document.getElementById('cms-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cms-modal';
        modal.className = 'modal-overlay';
        modal.style.zIndex = '10000';
        document.body.appendChild(modal);
    }
    
    appState.currentCMSPkgId = pkgId;
    appState.currentCMSStepNum = stepNum;
    appState.currentCMSStepData = JSON.parse(JSON.stringify(stepData)); 
    
    if (!appState.currentCMSStepData.contentBlocks) appState.currentCMSStepData.contentBlocks = [];
    if (!appState.currentCMSStepData.question) appState.currentCMSStepData.question = { type: 'none' };
    
    renderCMSModal();
};

window.renderCMSModal = function() {
    let modal = document.getElementById('cms-modal');
    let data = appState.currentCMSStepData;
    
    let blocksHtml = data.contentBlocks.map((block, idx) => {
        if (block.type === 'text') {
            return `
                <div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 4px; background: #fff;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <strong style="font-size:0.8rem; color:#555;">📝 Metin Bloğu</strong>
                        <button onclick="removeCMSBlock(${idx})" style="color:red; background:none; border:none; cursor:pointer; font-size:0.8rem;">Sil</button>
                    </div>
                    <textarea oninput="appState.currentCMSStepData.contentBlocks[${idx}].content = this.value; this.style.height='auto'; this.style.height=this.scrollHeight+'px';" style="width:100%; border:1px solid #ccc; font-size:0.8rem; padding:5px; resize:none; overflow-y:hidden;">${block.content || ''}</textarea>
                </div>
            `;
        } else if (block.type === 'image') {
            return `
                <div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 4px; background: #fff;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <strong style="font-size:0.8rem; color:#555;">🖼️ Görsel (URL)</strong>
                        <button onclick="removeCMSBlock(${idx})" style="color:red; background:none; border:none; cursor:pointer; font-size:0.8rem;">Sil</button>
                    </div>
                    <input type="text" placeholder="Görsel linkini yapıştırın (https://...)" oninput="appState.currentCMSStepData.contentBlocks[${idx}].url = this.value; document.getElementById('cms-img-prev-${idx}').src=this.value;" value="${block.url || ''}" style="width:100%; border:1px solid #ccc; font-size:0.8rem; padding:5px; margin-bottom:5px;">
                    <img id="cms-img-prev-${idx}" src="${block.url || ''}" style="max-width:100%; max-height:100px; display:${block.url ? 'block' : 'none'};">
                </div>
            `;
        }
    }).join('');
    
    let q = data.question;
    let qHtml = `
        <div style="margin-top: 20px; border-top: 2px solid #eee; padding-top: 15px;">
            <h4 style="margin-top:0; font-size:0.9rem;">❓ Soru / Test Bloğu</h4>
            <select onchange="appState.currentCMSStepData.question.type = this.value; renderCMSModal();" style="width:100%; padding:5px; margin-bottom:10px; font-size:0.8rem;">
                <option value="none" ${q.type === 'none' ? 'selected' : ''}>-- Soru Ekleme --</option>
                <option value="multiple_choice" ${q.type === 'multiple_choice' ? 'selected' : ''}>Çoktan Seçmeli (5 Şıkka Kadar)</option>
                <option value="true_false" ${q.type === 'true_false' ? 'selected' : ''}>Doğru / Yanlış</option>
                <option value="matching" ${q.type === 'matching' ? 'selected' : ''}>Eşleştirme</option>
            </select>
    `;
    
    if (q.type === 'multiple_choice') {
        if(!q.options) q.options = ["", ""];
        qHtml += `
            <textarea placeholder="Soru metnini yazın..." oninput="appState.currentCMSStepData.question.text = this.value;" style="width:100%; padding:5px; font-size:0.8rem; margin-bottom:10px;" rows="2">${q.text || ''}</textarea>
            <div><strong style="font-size:0.8rem;">Şıklar (En az 2, en fazla 5) & Doğru Cevabı Seçin:</strong></div>
        `;
        q.options.forEach((opt, oIdx) => {
            qHtml += `
            <div style="display:flex; align-items:center; margin-bottom:5px;">
                <input type="radio" name="cms-mc-correct" ${q.correctOptionIndex === oIdx ? 'checked' : ''} onchange="appState.currentCMSStepData.question.correctOptionIndex = ${oIdx};" style="margin-right:5px;">
                <input type="text" placeholder="${oIdx+1}. Şık" value="${opt}" oninput="appState.currentCMSStepData.question.options[${oIdx}] = this.value;" style="flex:1; padding:4px; font-size:0.8rem;">
                ${q.options.length > 2 ? `<button onclick="appState.currentCMSStepData.question.options.splice(${oIdx}, 1); renderCMSModal();" style="color:red; background:none; border:none; cursor:pointer; font-size:0.75rem; margin-left:5px;">Sil</button>` : ''}
            </div>`;
        });
        if (q.options.length < 5) {
            qHtml += `<button onclick="appState.currentCMSStepData.question.options.push(''); renderCMSModal();" style="font-size:0.75rem; padding:3px 8px; margin-top:5px; cursor:pointer;">+ Şık Ekle</button>`;
        }
    } else if (q.type === 'true_false') {
        qHtml += `
            <textarea placeholder="İfadeyi yazın (Örn: Arapçada 28 harf vardır)..." oninput="appState.currentCMSStepData.question.text = this.value;" style="width:100%; padding:5px; font-size:0.8rem; margin-bottom:10px;" rows="2">${q.text || ''}</textarea>
            <div><strong style="font-size:0.8rem;">Doğru Cevap Nedir?</strong></div>
            <select onchange="appState.currentCMSStepData.question.isTrue = (this.value === 'true');" style="padding:5px; font-size:0.8rem; margin-top:5px; width:100%;">
                <option value="true" ${q.isTrue !== false ? 'selected' : ''}>Doğru</option>
                <option value="false" ${q.isTrue === false ? 'selected' : ''}>Yanlış</option>
            </select>
        `;
    } else if (q.type === 'matching') {
        if(!q.pairs) q.pairs = [{left:'', right:''}, {left:'', right:''}];
        qHtml += `
            <div style="font-size:0.75rem; color:#666; margin-bottom:10px;">Sol taraftaki ifadelerle sağ taraftakileri eşleştirme sorusu. (Öğrenciye sağ taraf karışık verilecektir).</div>
            <textarea placeholder="Yönerge (Örn: Aşağıdakileri eşleştiriniz)..." oninput="appState.currentCMSStepData.question.text = this.value;" style="width:100%; padding:5px; font-size:0.8rem; margin-bottom:10px;" rows="2">${q.text || ''}</textarea>
        `;
        q.pairs.forEach((pair, pIdx) => {
            qHtml += `
            <div style="display:flex; gap:5px; margin-bottom:5px; align-items:center;">
                <input type="text" placeholder="Sol" value="${pair.left}" oninput="appState.currentCMSStepData.question.pairs[${pIdx}].left = this.value;" style="flex:1; padding:4px; font-size:0.8rem;">
                <span>=</span>
                <input type="text" placeholder="Sağ" value="${pair.right}" oninput="appState.currentCMSStepData.question.pairs[${pIdx}].right = this.value;" style="flex:1; padding:4px; font-size:0.8rem;">
                ${q.pairs.length > 2 ? `<button onclick="appState.currentCMSStepData.question.pairs.splice(${pIdx}, 1); renderCMSModal();" style="color:red; background:none; border:none; cursor:pointer; font-size:0.75rem;">Sil</button>` : ''}
            </div>`;
        });
        if (q.pairs.length < 5) {
            qHtml += `<button onclick="appState.currentCMSStepData.question.pairs.push({left:'', right:''}); renderCMSModal();" style="font-size:0.75rem; padding:3px 8px; margin-top:5px; cursor:pointer;">+ Eşleştirme Ekle</button>`;
        }
    }
    
    qHtml += `</div>`;
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; width:95%; max-height:90vh; overflow-y:auto; padding:20px; border-radius:12px; background:#f4f7f6;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h3 style="margin:0; font-size:1.1rem; color:#2c3e50;">Adım ${appState.currentCMSStepNum} Düzenle</h3>
                <span class="modal-close" style="font-size:1.5rem; cursor:pointer;" onclick="document.getElementById('cms-modal').style.display='none'">&times;</span>
            </div>
            
            <div id="cms-blocks-container">
                ${blocksHtml}
            </div>
            
            <div style="display:flex; gap:10px; margin-top:10px;">
                <button class="btn btn-sm" style="background:#3498db; color:white; border:none; padding:5px 10px; font-size:0.8rem; cursor:pointer;" onclick="appState.currentCMSStepData.contentBlocks.push({type:'text', content:''}); renderCMSModal();">+ Metin Ekle</button>
                <button class="btn btn-sm" style="background:#9b59b6; color:white; border:none; padding:5px 10px; font-size:0.8rem; cursor:pointer;" onclick="appState.currentCMSStepData.contentBlocks.push({type:'image', url:''}); renderCMSModal();">+ Görsel Ekle</button>
            </div>
            
            ${qHtml}
            
            <div style="margin-top: 25px; display:flex; justify-content:flex-end;">
                <button class="btn btn-success" style="padding: 8px 20px; font-size:0.9rem;" onclick="saveAdvancedKazanimDetail()">Kaydet ve Kapat</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
};

window.removeCMSBlock = function(idx) {
    appState.currentCMSStepData.contentBlocks.splice(idx, 1);
    renderCMSModal();
};

window.saveAdvancedKazanimDetail = function() {
    let pkgId = appState.currentCMSPkgId;
    let stepNum = appState.currentCMSStepNum;
    appState.kazanimData[pkgId].steps[stepNum] = appState.currentCMSStepData;
    localStorage.setItem('mockKazanimData', JSON.stringify(appState.kazanimData));
    saveTeachers(); // Push to Firebase
    document.getElementById('cms-modal').style.display = 'none';
    showCustomAlert(`Adım ${stepNum} başarıyla kaydedildi.`);
    renderAdminPackageManagement();
};

window.previewPackage = function(pkgId, pkgName) {
    const pkgData = appState.kazanimData[pkgId] || { total: 5, steps: {} };
    let previewStep = 1;
    
    let modal = document.getElementById('preview-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'preview-modal';
        modal.style.position = 'fixed';
        modal.style.top = '0'; modal.style.left = '0'; modal.style.width = '100%'; modal.style.height = '100%';
        modal.style.backgroundColor = '#fff';
        modal.style.zIndex = '11000';
        modal.style.overflowY = 'auto';
        document.body.appendChild(modal);
    }
    
    window.renderPreviewStep = function(step) {
        if(step < 1) step = 1;
        if(step > pkgData.total) step = pkgData.total;
        previewStep = step;
        
        let stepData = pkgData.steps[step] || { contentBlocks: [], question: {type:'none'} };
        if (stepData.text && (!stepData.contentBlocks || stepData.contentBlocks.length === 0)) {
            stepData.contentBlocks = [{type: 'text', content: stepData.text}];
        }
        if (typeof stepData.question === 'string') {
            stepData.question = { type: 'multiple_choice', text: stepData.question, options: ["", ""], correctOptionIndex: 0 };
        }
        
        let progressHtml = `
            <div style="display:flex; justify-content:center; gap:5px; margin: 20px 0; overflow-x:auto; padding-bottom:10px;">
        `;
        for(let i=1; i<=pkgData.total; i++) {
            progressHtml += `<div style="width:30px; min-width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:bold; ${i < step ? 'background:#20C997; color:white;' : (i === step ? 'background:#4facfe; color:white; box-shadow:0 0 0 3px rgba(79,172,254,0.3);' : 'background:#e9ecef; color:#aaa;')}">${i}</div>`;
        }
        progressHtml += `</div>`;
        
        let contentHtml = '';
        if (stepData.contentBlocks && stepData.contentBlocks.length > 0) {
            contentHtml = stepData.contentBlocks.map(b => {
                if (b.type === 'text') return `<div style="margin-bottom:15px; line-height:1.6; font-size:1.05rem; color:#333;">${(b.content||'').replace(/\n/g, '<br>')}</div>`;
                if (b.type === 'image' && b.url) return `<div style="text-align:center; margin-bottom:15px;"><img src="${b.url}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1);"></div>`;
                return '';
            }).join('');
        } else {
            contentHtml = `<div style="color:#999; font-style:italic;">Bu adım için konu anlatımı eklenmemiş.</div>`;
        }
        
        let qHtml = '';
        let q = stepData.question;
        if (q && q.type && q.type !== 'none') {
            qHtml += `<div style="background:#f8f9fa; border:2px solid #e2e8f0; border-radius:12px; padding:20px; margin-top:30px;">`;
            qHtml += `<h3 style="margin-top:0; color:#2c3e50; font-size:1.1rem;">Test Sorusu</h3>`;
            qHtml += `<p style="font-weight:bold; margin-bottom:15px; font-size:1rem;">${q.text || ''}</p>`;
            
            if (q.type === 'multiple_choice') {
                qHtml += `<div style="display:flex; flex-direction:column; gap:10px;">`;
                (q.options || []).forEach((opt, idx) => {
                    qHtml += `<button style="text-align:left; padding:12px 15px; border:1px solid #cbd5e1; border-radius:8px; background:white; cursor:pointer; font-size:0.95rem; transition:0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='white'"><span style="font-weight:bold; margin-right:10px; color:#4facfe;">${['A','B','C','D','E'][idx]}</span> ${opt}</button>`;
                });
                qHtml += `</div>`;
            } else if (q.type === 'true_false') {
                qHtml += `
                    <div style="display:flex; gap:15px;">
                        <button style="flex:1; padding:15px; background:white; border:2px solid #20C997; color:#20C997; border-radius:8px; font-weight:bold; font-size:1.1rem; cursor:pointer;" onmouseover="this.style.background='#20C997'; this.style.color='white'" onmouseout="this.style.background='white'; this.style.color='#20C997'">Doğru</button>
                        <button style="flex:1; padding:15px; background:white; border:2px solid #e74c3c; color:#e74c3c; border-radius:8px; font-weight:bold; font-size:1.1rem; cursor:pointer;" onmouseover="this.style.background='#e74c3c'; this.style.color='white'" onmouseout="this.style.background='white'; this.style.color='#e74c3c'">Yanlış</button>
                    </div>
                `;
            } else if (q.type === 'matching') {
                qHtml += `<div style="display:flex; justify-content:space-between; gap:20px;">`;
                let leftHtml = `<div style="flex:1; display:flex; flex-direction:column; gap:10px;">`;
                let rightHtml = `<div style="flex:1; display:flex; flex-direction:column; gap:10px;">`;
                
                let rights = (q.pairs || []).map(p => p.right).sort(() => Math.random() - 0.5);
                
                (q.pairs || []).forEach((p, idx) => {
                    leftHtml += `<div style="padding:10px; background:white; border:1px solid #ccc; border-radius:6px; text-align:center; font-size:0.9rem;">${p.left}</div>`;
                    rightHtml += `<div style="padding:10px; background:#eef2f5; border:1px dashed #999; border-radius:6px; text-align:center; cursor:pointer; font-size:0.9rem;">${rights[idx]}</div>`;
                });
                leftHtml += `</div>`;
                rightHtml += `</div>`;
                qHtml += leftHtml + rightHtml + `</div>`;
            }
            qHtml += `</div>`;
        }
        
        modal.innerHTML = `
            <div style="max-width:800px; margin: 0 auto; padding: 20px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h2 style="margin:0; color:#2c3e50; font-size:1.5rem;">👁️ Önizleme: ${pkgName}</h2>
                    <button class="btn btn-danger" onclick="document.getElementById('preview-modal').style.display='none'">Kapat</button>
                </div>
                ${progressHtml}
                
                <div style="background:white; border-radius:12px; padding:30px; box-shadow:0 10px 30px rgba(0,0,0,0.05); min-height:400px;">
                    ${contentHtml}
                    ${qHtml}
                </div>
                
                <div style="display:flex; justify-content:space-between; margin-top:20px;">
                    <button class="btn" style="background:#95a5a6; color:white;" onclick="renderPreviewStep(${step - 1})" ${step === 1 ? 'disabled' : ''}>Önceki Adım</button>
                    <button class="btn" style="background:#4facfe; color:white;" onclick="renderPreviewStep(${step + 1})" ${step === pkgData.total ? 'disabled' : ''}>Sonraki Adım</button>
                </div>
            </div>
        `;
    };
    
    modal.style.display = 'block';
    renderPreviewStep(1);
};


window.showCustomConfirm = function(message) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
        overlay.style.backdropFilter = 'blur(4px)';
        overlay.style.zIndex = '9999';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.animation = 'fadeIn 0.2s ease-out forwards';
        
        const modal = document.createElement('div');
        modal.className = 'glass-card';
        modal.style.background = 'white';
        modal.style.padding = '30px';
        modal.style.borderRadius = '12px';
        modal.style.maxWidth = '400px';
        modal.style.textAlign = 'center';
        modal.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
        
        const text = document.createElement('p');
        text.style.fontSize = '1.1rem';
        text.style.color = '#333';
        text.style.marginBottom = '25px';
        text.innerText = message;
        
        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '15px';
        btnContainer.style.justifyContent = 'center';

        const btnYes = document.createElement('button');
        btnYes.innerText = 'Evet';
        btnYes.style.padding = '10px 25px';
        btnYes.style.border = 'none';
        btnYes.style.borderRadius = '8px';
        btnYes.style.background = '#dc3545';
        btnYes.style.color = 'white';
        btnYes.style.fontWeight = 'bold';
        btnYes.style.cursor = 'pointer';
        
        const btnNo = document.createElement('button');
        btnNo.innerText = 'Hayır';
        btnNo.style.padding = '10px 25px';
        btnNo.style.border = 'none';
        btnNo.style.borderRadius = '8px';
        btnNo.style.background = '#e9ecef';
        btnNo.style.color = '#333';
        btnNo.style.fontWeight = 'bold';
        btnNo.style.cursor = 'pointer';

        btnYes.onclick = () => {
            document.body.removeChild(overlay);
            resolve(true);
        };
        btnNo.onclick = () => {
            document.body.removeChild(overlay);
            resolve(false);
        };

        btnContainer.appendChild(btnNo);
        btnContainer.appendChild(btnYes);
        modal.appendChild(text);
        modal.appendChild(btnContainer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    });
};
