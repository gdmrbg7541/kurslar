/* ==========================================
   9. YÖNETİCİ & ÖĞRETMEN PANELLERİ
   ========================================== */
function renderAdminPanel() {
    const adminSection = document.getElementById('admin-section');
    if (!adminSection) return;

    adminSection.innerHTML = `
        <div class="glass-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h2 style="margin: 0;">👨‍💼 Yönetici Paneli</h2>
                ${(appState.teacherApplications && appState.teacherApplications.length > 0) ? `
                    <div onclick="openTeacherAppsModal()" style="cursor:pointer; display:flex; align-items:center; background:#ffeaa7; padding:8px 15px; border-radius:20px; box-shadow:0 2px 5px rgba(0,0,0,0.1); animation: blink-animation 1s infinite alternate;">
                        <svg style="width:24px; height:24px; fill:#d35400; margin-right:8px;" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
                        <span style="color:#d35400; font-weight:bold;">${appState.teacherApplications.length} Yeni Başvuru!</span>
                    </div>
                ` : ''}
            </div>
            
            <div style="margin-bottom: 25px;">
                <button class="btn btn-primary" style="background-color: #ff3b30; border-color: #ff3b30; font-size: 1.1rem; padding: 12px 24px; box-shadow: 0 4px 10px rgba(255, 59, 48, 0.4);" onclick="openLiveClassRoom()">
                    <span class="live-dot" style="background-color: white;"></span> Canlı Ders Başlat
                </button>
            </div>
            


            <details class="admin-details" name="admin-accordion">
                <summary class="admin-summary">Kayıtlı Öğrenciler (Alfabetik)</summary>
                <div id="admin-student-list" style="margin-top: 15px; margin-bottom: 10px; max-height: 400px; overflow-y: auto;"></div>
            </details>

            <details class="admin-details" name="admin-accordion">
                <summary class="admin-summary">
                    <span style="display: inline-flex; align-items: center;">
                        Sistemdeki Tüm Randevu Talepleri
                        ${(appState.pendingLessons && appState.pendingLessons.length > 0) ? `
                            <svg style="width:24px; height:24px; fill:#e74c3c; margin-left: 10px;" viewBox="0 0 24 24">
                                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                            </svg>
                        ` : ''}
                    </span>
                </summary>
                <div id="admin-all-lessons" style="margin-top: 15px; margin-bottom: 10px; max-height: 400px; overflow-y: auto;"></div>
            </details>


        </div>
        
        <div id="teacher-apps-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1000; justify-content:center; align-items:center;">
            <div class="glass-card" style="width:90%; max-width:600px; max-height:80vh; overflow-y:auto; position:relative;">
                <span onclick="closeTeacherAppsModal()" style="position:absolute; top:15px; right:15px; font-size:1.5rem; cursor:pointer;">&times;</span>
                <h3 style="margin-top:0;">Öğretmen Başvuruları</h3>
                <div id="admin-teacher-applications-modal"></div>
            </div>
        </div>
    `;
    
    if (!document.getElementById('blink-style')) {
        const style = document.createElement('style');
        style.id = 'blink-style';
        style.innerHTML = `
            @keyframes blink-animation {
                from { opacity: 1; transform: scale(1); }
                to { opacity: 0.7; transform: scale(1.05); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Inject teacher options into the new admin select
    const adminSelect = document.getElementById('admin-teacher-edit-select');
    if (adminSelect) {
        adminSelect.innerHTML = appState.teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
        renderAdminTeacherScheduleEditor();
    }
    
    renderTeacherApplications();
    renderAdminTeacherList();
    renderAdminStudentList();
    renderAdminAllLessons();
    renderAdminOfflinePackages();
    renderAdminOnlinePackages();
}

function openTeacherAppsModal() {
    document.getElementById('teacher-apps-modal').style.display = 'flex';
}

function closeTeacherAppsModal() {
    document.getElementById('teacher-apps-modal').style.display = 'none';
}

function renderAdminAllLessons() {
    const listContainer = document.getElementById('admin-all-lessons');
    if (!listContainer) return;

    let html = '';
    const allPending = appState.pendingLessons || [];
    const allApproved = appState.approvedLessons || [];

    if (allPending.length === 0 && allApproved.length === 0) {
        listContainer.innerHTML = "<p>Sistemde herhangi bir randevu kaydı bulunmuyor.</p>";
        return;
    }

    if (allPending.length > 0) {
        html += `<h4 style="color:#F39C12; margin-bottom: 10px; display:flex; align-items:center;">
                    <svg style="width:24px; height:24px; margin-right:8px; fill:#e74c3c;" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    Bekleyen Talepler (${allPending.length})
                 </h4>`;
        allPending.forEach(l => {
            const t = appState.teachers.find(teacher => teacher.id === l.requestedTeacherId);
            const teacherName = t ? t.name : (l.requestedTeacherId === 'any' ? 'Havuz (Herhangi Biri)' : 'Bilinmeyen');
            html += `
                <div class="glass-card" style="margin-bottom: 10px; border-left: 4px solid #F39C12; padding: 10px;">
                    <strong>Öğrenci:</strong> ${l.studentEmail} (${l.studentPhone})<br>
                    <strong>Paket:</strong> ${l.package}<br>
                    <strong>Tarih/Saat:</strong> ${l.slots.join(', ')}<br>
                    <strong>İstenen Öğretmen:</strong> ${teacherName}
                </div>
            `;
        });
    }

    if (allApproved.length > 0) {
        html += `<h4 style="color:#20C997; margin-top: 20px; margin-bottom: 10px;">Onaylanan / Aktif Dersler</h4>`;
        allApproved.forEach(l => {
            const t = appState.teachers.find(teacher => teacher.id === l.teacherId);
            const teacherName = t ? t.name : 'Bilinmeyen';
            html += `
                <div class="glass-card" style="margin-bottom: 10px; border-left: 4px solid #20C997; padding: 10px;">
                    <strong>Öğrenci:</strong> ${l.studentEmail} (${l.studentPhone})<br>
                    <strong>Paket:</strong> ${l.package}<br>
                    <strong>Tarih/Saat:</strong> ${l.slots.join(', ')}<br>
                    <strong>Onaylayan Öğretmen:</strong> ${teacherName}
                </div>
            `;
        });
    }

    listContainer.innerHTML = html;
}

window.selectTeacherEditorWeek = function(index, isAdmin) {
    if (appState.calendarWeeks[index].isPast) return;
    appState.selectedWeekIndex = index;
    if (isAdmin) {
        renderAdminTeacherScheduleEditor();
    } else {
        renderTeacherScheduleEditor();
    }
};

function getTeacherCalendarEditorHtml(teacherId, isAdmin) {
    if (!appState.calendarWeeks || appState.calendarWeeks.length === 0) {
        generate3MonthWeeks();
    }

    const monthsMap = [];
    appState.calendarWeeks.forEach((week, index) => {
        let lastMonth = monthsMap[monthsMap.length - 1];
        if (!lastMonth || lastMonth.name !== week.monthName) {
            monthsMap.push({ name: week.monthName, weeks: [{...week, index: index}] });
        } else {
            lastMonth.weeks.push({...week, index: index});
        }
    });

    let navHtml = `<div style="display: flex; justify-content: space-between; gap: 15px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 15px; user-select: none;">`;
    monthsMap.forEach(m => {
        const isMonthActive = m.weeks.some(w => w.index === appState.selectedWeekIndex);
        const monthColor = isMonthActive ? '#F39C12' : '#1f5f99';
        const monthScale = isMonthActive ? 'scale(1.1)' : 'scale(1)';
        
        navHtml += `<div style="display: flex; flex: 1; flex-direction: column; align-items: center; min-width: 100px;">
            <div style="font-weight: bold; color: ${monthColor}; margin-bottom: 8px; font-size: 0.95rem; transform: ${monthScale}; transition: 0.2s;">${m.name}</div>
            <div style="display: flex; gap: 6px;">`;
            
        m.weeks.forEach(w => {
            const isSelected = appState.selectedWeekIndex === w.index;
            let bgColor = w.isPast ? '#e0e0e0' : (isSelected ? '#F39C12' : '#4facfe');
            let cursor = w.isPast ? 'not-allowed' : 'pointer';
            let opacity = w.isPast ? '0.5' : (isSelected ? '1' : '0.8');
            let clickAttr = w.isPast ? '' : `onclick="selectTeacherEditorWeek(${w.index}, ${isAdmin})"`;
            let transform = isSelected ? 'scale(1.15)' : 'scale(1)';
            
            navHtml += `<div style="width: 35px; height: 8px; border-radius: 4px; background: ${bgColor}; cursor: ${cursor}; opacity: ${opacity}; transform: ${transform}; transition: 0.2s; margin: 4px 0;" ${clickAttr} title="${w.isPast ? 'Geçmiş Hafta' : 'Haftayı Seç'}"></div>`;
        });
        
        navHtml += `</div></div>`;
    });
    navHtml += `</div>`;

    const groupsRaw = teacherSchedules[teacherId] || [];
    const currentWeek = appState.calendarWeeks[appState.selectedWeekIndex];
    
    const groups = currentWeek.days.map(dayObj => {
        const genericSchedule = groupsRaw.find(g => g.name === dayObj.dayName) || { startH: 9, endH: 17, data: {} };
        return {
            name: dayObj.dayName,
            dateString: dayObj.dateString,
            fullDateString: dayObj.fullDateString,
            dateObj: dayObj.dateObj,
            startH: genericSchedule.startH,
            endH: genericSchedule.endH,
            data: genericSchedule.data,
            slots: generateSlots(genericSchedule.startH, genericSchedule.endH)
        };
    });

    let html = '<p>Saatlerin üzerine tıklayarak <strong>Müsait</strong> veya <strong>Dolu</strong> olarak değiştirebilirsiniz. <br><small style="color:#777;">(Not: Yapacağınız değişiklikler öğretmenin genel haftalık şablonunu günceller.)</small></p>';
    html += navHtml;
    html += `
        <div style="display: flex; overflow-x: auto; gap: 15px; padding-bottom: 15px; margin-top: 15px;">
            ${groups.map(group => {
                const today = new Date();
                today.setHours(0,0,0,0);
                const isPastDay = group.dateObj < today;

                const slotsHtml = group.slots.map(s => {
                    const slotFullString = `${group.fullDateString} ${s.time}`;
                    let durumStr = group.data && group.data[s.time] ? group.data[s.time] : "musait";
                    
                    const bookedLesson = (appState.approvedLessons || []).find(l => l.teacherId === teacherId && l.slots.includes(slotFullString));
                    if (bookedLesson) {
                        durumStr = bookedLesson.studentName || "Öğrenci";
                    }

                    if (s.isBreak) return `<div class="slot break" style="margin-bottom: 8px;">☕ ${s.time}</div>`;
                    
                    const isDolu = durumStr !== "musait" || isPastDay || !!bookedLesson;
                    const cName = isPastDay ? "dolu" : (isDolu ? "dolu" : "musait");
                    const label = isPastDay ? "Geçmiş" : (isDolu ? (durumStr === "musait" ? "Dolu" : `Dolu (${durumStr})`) : "Müsait");
                    const icon = isPastDay ? "⏳" : (isDolu ? "❌" : "✅");
                    
                    const isStudentBooked = !!bookedLesson;
                    const clickAttr = isPastDay ? '' : `onclick="toggleSlotStatus('${teacherId}', '${group.name}', '${s.time}', this, ${isStudentBooked})"`;
                    const cursor = isPastDay ? 'not-allowed' : 'pointer';
                    const opacity = isPastDay ? '0.5' : '1';
                    
                    return `<div class="slot ${cName}" ${clickAttr} style="cursor: ${cursor}; margin-bottom: 8px; opacity: ${opacity};">${icon} ${s.time}<br><small style="font-size:0.7rem;">${label}</small></div>`;
                }).join('');

                return `
                <div style="min-width: 140px; flex: 1; display: flex; flex-direction: column;">
                    <div class="day-title" style="text-align: center; margin-bottom: 10px; padding: 10px; background: #e3f2fd; border-radius: 8px; font-weight: bold; color: #1f5f99; border: 1px solid rgba(31, 95, 153, 0.1);">
                        ${group.dateString} <br>
                        <span style="font-size: 0.85rem; font-weight: normal;">${group.name}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 5px;">
                        ${slotsHtml}
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    `;
    
    return html;
}

function renderAdminTeacherScheduleEditor() {
    const editor = document.getElementById('admin-teacher-schedule-editor');
    if (!editor) return;
    const teacherId = document.getElementById('admin-teacher-edit-select').value;
    if (!teacherId) return editor.innerHTML = "<p>Lütfen seçin.</p>";

    editor.innerHTML = getTeacherCalendarEditorHtml(teacherId, true);
}

function renderTeacherApplications() {
    const listContainer = document.getElementById('admin-teacher-applications-modal');
    if (!listContainer) return;

    appState.teacherApplications = appState.teacherApplications || [];
    
    if (appState.teacherApplications.length === 0) {
        listContainer.innerHTML = "<p>Bekleyen başvuru bulunmuyor.</p>";
        return;
    }

    let html = '';
    appState.teacherApplications.forEach(app => {
        html += `
            <div class="glass-card" style="margin-bottom: 15px; border-left: 4px solid #F39C12;">
                <p><strong>E-posta:</strong> ${app.email}</p>
                <p><strong>Telefon:</strong> <a href="tel:${app.phone}" style="color: #F39C12;">${app.phone}</a></p>
                <p><strong>Yüklenen Belge:</strong> <span style="background: #e9ecef; padding: 2px 5px; border-radius: 4px;">${app.documentName}</span></p>
                <div style="background: rgba(0,0,0,0.05); padding: 10px; border-radius: 8px; margin: 10px 0;">
                    <strong>Özgeçmiş / Motivasyon:</strong><br>
                    <span style="white-space: pre-wrap;">${app.cv}</span>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button class="btn btn-success" onclick="approveTeacherApplication('${app.id}')">Onayla ve Ekle</button>
                    <button class="btn btn-danger" onclick="rejectTeacherApplication('${app.id}')">Reddet</button>
                </div>
            </div>
        `;
    });
    listContainer.innerHTML = html;
}

function approveTeacherApplication(appId) {
    const appIndex = appState.teacherApplications.findIndex(a => a.id === appId);
    if (appIndex === -1) return;
    const app = appState.teacherApplications[appIndex];
    
    const newId = 'hoca_' + Math.floor(Math.random() * 10000);
    const namePrefix = app.email.split('@')[0];
    
    appState.teachers.push({
        id: newId,
        name: `Eğitmen ${namePrefix} (Yeni)`,
        phone: app.phone,
        email: app.email,
        password: app.password,
        cv: app.cv || 'Belirtilmedi',
        documentName: app.documentName || 'Yok'
    });
    
    teacherSchedules[newId] = getDefaultSchedule();
    
    appState.teacherApplications.splice(appIndex, 1);
    saveTeachers();
    
    renderTeacherApplications();
    renderAdminTeacherList();
    refreshTeacherSelect();
    showCustomAlert("Öğretmen başvurusu onaylandı ve sisteme eklendi! Bilgileri tablodan düzenleyebilirsiniz.");
}

async function rejectTeacherApplication(appId) {
    if (await showCustomConfirm("Bu başvuruyu reddetmek istediğinize emin misiniz?")) {
        appState.teacherApplications = appState.teacherApplications.filter(a => a.id !== appId);
        saveTeachers();
        renderTeacherApplications();
    }
}

function renderAdminStudentList() {
    const listContainer = document.getElementById('admin-student-list');
    if (!listContainer) return;

    if (typeof firebase !== 'undefined' && isFirebaseReady) {
        db.collection('users').get().then(snapshot => {
            let users = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.role === 'student' || !data.role) { // Eski kayıtların rolü boş olabilir
                    users[doc.id] = data;
                }
            });
            drawAdminStudentList(listContainer, users);
        }).catch(err => {
            console.error("Öğrenci listesi alınamadı:", err);
            listContainer.innerHTML = "<p>Öğrenci listesi yüklenirken hata oluştu.</p>";
        });
    } else {
        let users = JSON.parse(localStorage.getItem('mockUsers') || '{}');
        drawAdminStudentList(listContainer, users);
    }
}

function drawAdminStudentList(listContainer, users) {
    let emails = Object.keys(users);
    
    if (emails.length === 0) {
        listContainer.innerHTML = "<p>Henüz kayıtlı öğrenci bulunmuyor.</p>";
        return;
    }

    let groups = {};
    emails.forEach(email => {
        let studentData = users[email];
        let name = studentData.name && studentData.name !== "Belirtilmedi" ? studentData.name : email;
        let firstLetter = name.charAt(0).toUpperCase();
        
        if (!groups[firstLetter]) groups[firstLetter] = [];
        groups[firstLetter].push({ 
            email: email, 
            phone: studentData.phone || 'Belirtilmedi',
            name: studentData.name || 'Belirtilmedi',
            profession: studentData.profession || 'Belirtilmedi'
        });
    });

    let html = '';
    Object.keys(groups).sort().forEach(letter => {
        // İsimlere göre alfabetik sırala (grup içinde)
        groups[letter].sort((a, b) => a.name.localeCompare(b.name));
        
        html += `<div style="background: #F0F4F8; padding: 10px; margin-bottom: 15px; border-radius: 8px;">
                    <h4 style="margin: 0 0 10px 0; color: #16A085;">${letter}</h4>
                    <table class="admin-table" style="margin-bottom: 0;">
                        <tr>
                            <th>Ad Soyad</th>
                            <th>E-posta</th>
                            <th>Telefon</th>
                            <th>Meslek</th>
                            <th>İşlem</th>
                        </tr>`;
        groups[letter].forEach(student => {
            const safeEmailId = student.email.replace(/[^a-zA-Z0-9]/g, '_');
            html += `<tr>
                <td contenteditable="true" id="student-name-${safeEmailId}" style="background: #fff8e1; border-radius: 4px; padding: 5px; outline: none;"><strong>${student.name}</strong></td>
                <td>${student.email}</td>
                <td contenteditable="true" id="student-phone-${safeEmailId}" style="background: #fff8e1; border-radius: 4px; padding: 5px; outline: none;"><a href="tel:${student.phone}" style="color: #F39C12; text-decoration: none; font-weight: bold;">${student.phone}</a></td>
                <td contenteditable="true" id="student-prof-${safeEmailId}" style="background: #fff8e1; border-radius: 4px; padding: 5px; outline: none; color: #666; font-size: 0.9em;">${student.profession}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="updateStudent('${student.email}', '${safeEmailId}')" style="padding: 4px 8px; font-size: 0.8rem; margin-right: 5px;">Kaydet</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteStudent('${student.email}')" style="padding: 4px 8px; font-size: 0.8rem;">Sil</button>
                </td>
            </tr>`;
        });
        html += `</table></div>`;
    });

    listContainer.innerHTML = html;
}


function renderAdminTeacherList() {
    const container = document.getElementById('admin-teacher-list');
    if (!container) return;
    
    let html = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Ad Soyad</th>
                    <th>ID</th>
                    <th>E-posta</th>
                    <th>Telefon</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    appState.teachers.forEach((t, index) => {
        html += `
            <tr>
                <td>${t.name}</td>
                <td>${t.id}</td>
                <td>${t.email}</td>
                <td>${t.phone}</td>
            </tr>
        `;
    });
    
    html += `</tbody></table><p style="font-size: 0.75rem; color: #888; margin-top: 10px;">* Eğitmen verileri <strong>js/data/ogretmen.js</strong> dosyasından yönetilmektedir.</p>`;
    container.innerHTML = html;
}

// updateTeacherData, removeTeacher, addTeacher disabled as per new architecture
function updateTeacherData() {}
function removeTeacher() {}
function addTeacher() {}

// --- OFFLINE PACKAGES CRUD ---

function renderAdminOfflinePackages() {
    const container = document.getElementById('admin-offline-packages');
    if (!container) return;
    if (appState.packages.length === 0) {
        container.innerHTML = "<p>Çevrimdışı paket bulunmuyor.</p>"; return;
    }
    
    let html = `<div style="display:flex; flex-direction:column; gap:10px;">`;
    appState.packages.forEach((pkg, index) => {
        const reqs = pkg.requirements ? pkg.requirements.join(', ') : '';
        html += `
        <details name="admin-offline-packages" class="admin-details" style="background: #fff; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <summary class="admin-summary" style="padding: 10px; display: flex; justify-content: space-between; align-items: center; border-radius:8px;">
                <strong style="color:#16A085; font-size: 0.9rem;">${pkg.title}</strong>
            </summary>
            
            <div style="padding: 10px; border-top: 1px solid #eee;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.75rem; color: #555;">
                    <tr><td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0; width: 100px;"><strong>Başlık:</strong></td><td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;">${pkg.title}</td></tr>
                    <tr><td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><strong>Açıklama:</strong></td><td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;">${pkg.description}</td></tr>
                    <tr><td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><strong>Süre:</strong></td><td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;">${pkg.duration || ''} Saat</td></tr>
                    <tr><td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><strong>Fiyat:</strong></td><td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;">${pkg.price || ''} ₺</td></tr>
                    <tr><td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><strong>Gereklilikler:</strong></td><td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;">${reqs}</td></tr>
                    <tr><td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><strong>Hedef:</strong></td><td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;">${pkg.target || ''}</td></tr>
                </table>
                ${renderKazanimStepsHTML(pkg.id, pkg.title)}
            </div>
        </details>`;
    });
    html += `</div><p style="font-size: 0.75rem; color: #888; margin-top: 10px;">* Bu veriler <strong>js/data/paketler.js</strong> dosyasından yönetilmektedir.</p>`;
    container.innerHTML = html;
}

// updateOfflinePackageData, addOfflinePackage, removeOfflinePackage disabled as per new architecture
function updateOfflinePackageData() {}
function addOfflinePackage() {}
function removeOfflinePackage() {}

function renderAdminOnlinePackages() {
    const container = document.getElementById('admin-online-packages');
    if (!container) return;
    if (appState.onlinePackages.length === 0) {
        container.innerHTML = "<p>Canlı ders paketi bulunmuyor.</p>"; return;
    }
    
    let html = `<div style="display:flex; flex-direction:column; gap:10px;">`;
    appState.onlinePackages.forEach((pkg, index) => {
        html += `
        <details name="admin-online-packages" class="admin-details" style="background: #fff; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <summary class="admin-summary" style="padding: 10px; display: flex; justify-content: space-between; align-items: center; border-radius:8px;">
                <strong style="color:#2980b9; font-size: 0.9rem;">${pkg.name}</strong>
            </summary>
            
            <div style="padding: 10px; border-top: 1px solid #eee;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.75rem; color: #555;">
                    <tr><td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0; width: 100px;"><strong>Paket Adı:</strong></td><td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;">${pkg.name}</td></tr>
                    <tr><td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><strong>Açıklama:</strong></td><td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;">${pkg.desc}</td></tr>
                    <tr><td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><strong>Saat:</strong></td><td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;">${pkg.hours || ''} Saat / Ay</td></tr>
                    <tr><td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><strong>Fiyat:</strong></td><td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;">${pkg.price || ''} ₺</td></tr>
                    <tr><td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><strong>Materyal:</strong></td><td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;">${pkg.material || ''}</td></tr>
                </table>
                ${renderKazanimStepsHTML(pkg.id, pkg.name)}
            </div>
        </details>`;
    });
    html += `</div><p style="font-size: 0.75rem; color: #888; margin-top: 10px;">* Bu veriler <strong>js/data/paketler.js</strong> dosyasından yönetilmektedir.</p>`;
    container.innerHTML = html;
}

// updateOnlinePackageData, addOnlinePackage, removeOnlinePackage disabled as per new architecture
function updateOnlinePackageData() {}
function addOnlinePackage() {}
function removeOnlinePackage() {}

async function removeTeacher(id) {
    if (await showCustomConfirm("Bu öğretmeni silmek istediğinize emin misiniz?")) {
        appState.teachers = appState.teachers.filter(t => t.id !== id);
        delete teacherSchedules[id];
        saveTeachers();
        renderAdminTeacherList();
        refreshTeacherSelect();
    }
}

function renderTeacherPanel() {
    const teacherSection = document.getElementById('teacher-section');
    if (!teacherSection) return;

    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    // Get active teacher ID based on logged in email
    const activeTeacher = appState.teachers.find(t => t.email === appState.currentUser);
    if (!activeTeacher) {
        teacherSection.innerHTML = `
            <div class="glass-card">
                <h2 style="margin-bottom: 20px;">🎓 Öğretmen Kontrol Paneli</h2>
                <div style="background: #FFF3CD; color: #856404; padding: 15px; border-radius: 8px;">
                    Hesabınıza bağlı bir eğitmen profili bulunamadı. Lütfen yönetici ile iletişime geçin.
                </div>
            </div>
        `;
        return;
    }

    teacherSection.innerHTML = `
        <div class="glass-card">
            <h2 style="margin-bottom: 20px;">🎓 Öğretmen Kontrol Paneli - ${activeTeacher.name}</h2>
            
            <div style="margin-bottom: 20px;">
                <button class="btn btn-primary" style="background-color: #ff3b30; border-color: #ff3b30; font-size: 1.1rem; padding: 12px 24px; box-shadow: 0 4px 10px rgba(255, 59, 48, 0.4);" onclick="openLiveClassRoom()">
                    <span class="live-dot" style="background-color: white;"></span> Canlı Ders Başlat
                </button>
            </div>

            <details class="admin-details" name="teacher-accordion">
                <summary class="admin-summary">👤 Profilim</summary>
                <div style="margin-top: 15px; margin-bottom: 25px; padding-left: 15px; border-left: 3px solid #20C997;">
                    <p><strong>Ad Soyad:</strong> ${activeTeacher.name}</p>
                    <p><strong>E-posta:</strong> ${activeTeacher.email}</p>
                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 15px; flex-wrap: wrap;">
                        <strong>Şifre:</strong>
                        <input type="password" id="teacher-profile-password" value="${activeTeacher.password}" style="padding: 8px; border-radius: 4px; border: 1px solid #ccc; width: 200px;" disabled>
                        <button class="btn btn-secondary" style="padding: 8px 15px; border-radius: 4px;" onclick="toggleTeacherPasswordVisibility()">👁️ Göster/Gizle</button>
                    </div>
                    <div style="margin-top: 15px; display: flex; gap: 10px;">
                        <button id="edit-teacher-password-btn" class="btn btn-primary" onclick="enableTeacherPasswordEdit()">Şifreyi Değiştir</button>
                        <button id="save-teacher-password-btn" class="btn btn-success" style="display: none;" onclick="saveTeacherPassword('${activeTeacher.id}')">Yeni Şifreyi Kaydet</button>
                    </div>
                </div>
            </details>

            <details class="admin-details" name="teacher-accordion">
                <summary class="admin-summary">Açık Randevu Talepleri (Bekleyenler)</summary>
                <div id="teacher-pending-lessons" style="margin-top: 15px; margin-bottom: 10px;"></div>
            </details>

            <details class="admin-details" name="teacher-accordion">
                <summary class="admin-summary">Onayladığım Dersler</summary>
                <div id="teacher-approved-lessons" style="margin-top: 15px; margin-bottom: 10px;"></div>
            </details>

            <details class="admin-details" name="teacher-accordion">
                <summary class="admin-summary">Öğrenci Gelişim Takibi</summary>
                <div id="teacher-student-progress" style="margin-top: 15px; margin-bottom: 10px;"></div>
            </details>

            <details class="admin-details" name="teacher-accordion">
                <summary class="admin-summary">Alarm ve Hatırlatıcılar</summary>
                <div style="margin-top: 15px;">
                    <div id="teacher-alarms-list" style="margin-bottom: 20px;"></div>
                    <div class="dark-box" style="background: linear-gradient(135deg, #2c3e50, #34495e); color: white; border: none; box-shadow: 0 10px 20px rgba(0,0,0,0.1);">
                        <h4 style="margin-top:0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 1.5rem;">⏰</span> Yeni Hatırlatıcı Kur
                        </h4>
                        <div style="display:flex; gap:15px; flex-wrap:wrap; margin-top: 15px;">
                            <div class="form-group" style="flex:1; min-width: 120px;">
                                <label style="color: rgba(255,255,255,0.8);">Saat Seçin</label>
                                <input type="time" id="new-alarm-time" style="background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 10px; font-size: 1.1rem; width: 100%; box-sizing: border-box;">
                            </div>
                            <div class="form-group" style="flex:3; min-width: 200px;">
                                <label style="color: rgba(255,255,255,0.8);">Not / Görev</label>
                                <input type="text" id="new-alarm-note" placeholder="Örn: Ayşe'nin okuma ödevini kontrol et" style="background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 10px; font-size: 1.1rem; width: 100%; box-sizing: border-box;">
                                <div style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
                                    <span style="font-size: 0.8rem; color: #ccc;">Hızlı Seçim:</span>
                                    <button class="btn" style="background: rgba(32, 201, 151, 0.2); color: #20c997; border: 1px solid #20c997; padding: 3px 8px; font-size: 0.75rem; border-radius: 12px; cursor: pointer;" onclick="document.getElementById('new-alarm-note').value='Derse Hazırlık'">Derse Hazırlık</button>
                                    <button class="btn" style="background: rgba(253, 126, 20, 0.2); color: #fd7e14; border: 1px solid #fd7e14; padding: 3px 8px; font-size: 0.75rem; border-radius: 12px; cursor: pointer;" onclick="document.getElementById('new-alarm-note').value='Ödev Kontrolü'">Ödev Kontrolü</button>
                                    <button class="btn" style="background: rgba(13, 110, 253, 0.2); color: #0d6efd; border: 1px solid #0d6efd; padding: 3px 8px; font-size: 0.75rem; border-radius: 12px; cursor: pointer;" onclick="document.getElementById('new-alarm-note').value='Mola'">Mola</button>
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; flex-wrap: wrap; gap: 10px;">
                            <div style="display: flex; gap: 10px;">
                                <button class="btn" style="background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 5px 10px; font-size: 0.8rem;" onclick="setQuickTime(15)">+15 Dk</button>
                                <button class="btn" style="background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 5px 10px; font-size: 0.8rem;" onclick="setQuickTime(30)">+30 Dk</button>
                                <button class="btn" style="background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 5px 10px; font-size: 0.8rem;" onclick="setQuickTime(60)">+1 Saat</button>
                            </div>
                            <button class="btn btn-primary" style="background: #20C997; border: none; padding: 10px 20px; font-weight: bold;" onclick="addTeacherAlarm()">Alarmı Kur 🔔</button>
                        </div>
                    </div>
                </div>
            </details>

            <details class="admin-details" name="teacher-accordion">
                <summary class="admin-summary">Takvim ve Müsaitlik Yönetimi</summary>
                <div id="teacher-schedule-editor" style="margin-top: 15px; margin-bottom: 10px;"></div>
            </details>
        </div>
    `;
    refreshTeacherDashboard();
}

function refreshTeacherDashboard() {
    renderPendingLessons();
    renderApprovedLessons();
    renderStudentProgress();
    renderTeacherAlarms();
    renderTeacherScheduleEditor();
}

function renderPendingLessons() {
    const container = document.getElementById('teacher-pending-lessons');
    if (!container) return;

    const activeTeacher = appState.teachers.find(t => t.email === appState.currentUser);
    if (!activeTeacher) return;
    const teacherId = activeTeacher.id;

    const relevantLessons = appState.pendingLessons.filter(l => l.status === "pending" && (l.requestedTeacherId === "any" || l.requestedTeacherId === teacherId));

    if (relevantLessons.length === 0) {
        container.innerHTML = "<p>Bekleyen randevu talebi bulunmuyor.</p>";
        return;
    }

    let html = '';
    relevantLessons.forEach(l => {
        let typeBadge = l.requestedTeacherId === "any" ? '<span style="background: #F39C12; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 11px;">Havuz (Farketmez)</span>' : '<span style="background: #20C997; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 11px;">Doğrudan Size Özel</span>';
        
        html += `
        <div style="background: #fff; border: 1px solid #E9EEF5; padding: 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
                <strong style="font-size: 1.1rem;">${l.studentEmail}</strong> <a href="tel:${l.studentPhone}" style="margin-left: 10px; font-size: 0.9rem;">${l.studentPhone}</a>
                <br>
                <span style="font-size: 0.9rem; color: #555;">Paket: ${l.package}</span><br>
                <span style="font-size: 0.9rem; color: #555;">Tarih/Saat: ${l.slots.join(', ')}</span><br>
                ${typeBadge}
            </div>
            <div>
                <button class="btn btn-success" onclick="approveLesson('${l.id}')">Dersi Kap (Onayla)</button>
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

function subtractMinutes(timeStr, mins) {
    let [h, m] = timeStr.split(':').map(Number);
    let date = new Date();
    date.setHours(h, m, 0, 0);
    date.setMinutes(date.getMinutes() - mins);
    return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
}

function approveLesson(lessonId) {
    const lesson = appState.pendingLessons.find(l => l.id === lessonId);
    if (!lesson) return;
    
    const activeTeacher = appState.teachers.find(t => t.email === appState.currentUser);
    if (!activeTeacher) return;
    const teacherId = activeTeacher.id;

    // Check if slots are available
    if (teacherSchedules[teacherId]) {
        for (let slotStr of lesson.slots) {
            const timePart = slotStr.slice(-13); 
            const groupName = slotStr.slice(0, -14).trim();
            const group = teacherSchedules[teacherId].find(g => g.name === groupName);
            if (group) {
                const status = (group.data && group.data[timePart]) ? group.data[timePart] : "musait";
                if (status !== "musait") {
                    showCustomAlert(`Dikkat! Öğrencinin talep ettiği saatlerden biri (${groupName} ${timePart}) takviminizde "${status}" olarak işaretli. Çakışan saatler nedeniyle bu dersi onaylayamazsınız.`);
                    return; 
                }
            }
        }
    }

    lesson.status = "approved";
    lesson.teacherId = teacherId; // Teacher claimed it
    
    // Bekleyenlerden silip onaylananlara taşı
    appState.pendingLessons = appState.pendingLessons.filter(l => l.id !== lessonId);
    appState.approvedLessons.push(lesson);

    // Add alarms for the newly approved lesson
    let updatedCount = 0;
    lesson.slots.forEach(slotStr => {
        const timePart = slotStr.slice(-13); // "14:00 - 14:40"
        const startTimeStr = timePart.substring(0, 5); // "14:00"
        const alarmTime = subtractMinutes(startTimeStr, 5);
        
        if (!appState.teacherAlarms) appState.teacherAlarms = {};
        if (!appState.teacherAlarms[teacherId]) appState.teacherAlarms[teacherId] = [];
        
        appState.teacherAlarms[teacherId].push({
            id: Date.now() + Math.random(),
            time: alarmTime,
            note: `Ders Başlıyor (${slotStr}): ${lesson.studentName || 'Öğrenci'}`,
            isCompleted: false,
            isNotified: false
        });
        updatedCount++;
    });
    
    saveTeachers();
    
    if (updatedCount > 0) {
        showCustomAlert(`Ders başarıyla onaylandı!\nÖğrencinizin seçtiği ${updatedCount} saat dilimi sisteminize işlendi.`);
    } else {
        showCustomAlert("Ders başarıyla onaylandı!");
    }

    saveTeachers();
    refreshTeacherDashboard();
}

function renderApprovedLessons() {
    const container = document.getElementById('teacher-approved-lessons');
    if (!container) return;

    const activeTeacher = appState.teachers.find(t => t.email === appState.currentUser);
    if (!activeTeacher) return;
    const teacherId = activeTeacher.id;

    const myLessons = appState.approvedLessons.filter(l => l.teacherId === teacherId);

    if (myLessons.length === 0) {
        container.innerHTML = "<p>Henüz onayladığınız bir ders bulunmuyor.</p>";
        return;
    }

    let html = '';
    myLessons.forEach(l => {
        html += `
        <div style="background: #F8FAF9; border-left: 4px solid #20C997; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
            <strong style="font-size: 1.1rem;">${l.studentEmail}</strong> <a href="tel:${l.studentPhone}" style="margin-left: 10px; font-size: 0.9rem;">${l.studentPhone}</a>
            <br>
            <span style="font-size: 0.9rem; color: #555;">Paket: ${l.package}</span><br>
            <span style="font-size: 0.9rem; color: #555; font-weight: bold;">Tarih/Saat: ${l.slots.join(', ')}</span>
        </div>`;
    });
    container.innerHTML = html;
}

function renderStudentProgress() {
    const container = document.getElementById('teacher-student-progress');
    if (!container) return;

    const activeTeacher = appState.teachers.find(t => t.email === appState.currentUser);
    if (!activeTeacher) return;
    const teacherId = activeTeacher.id;

    const myLessons = appState.approvedLessons.filter(l => l.teacherId === teacherId);
    
    // Get unique students from approved lessons
    const studentsMap = {};
    myLessons.forEach(l => {
        if (!studentsMap[l.studentEmail]) {
            studentsMap[l.studentEmail] = { phone: l.studentPhone };
        }
    });

    const students = Object.keys(studentsMap);
    if (students.length === 0) {
        container.innerHTML = "<p>Kayıtlı öğrenciniz bulunmuyor.</p>";
        return;
    }

    if (!appState.studentProgress[teacherId]) {
        appState.studentProgress[teacherId] = {};
    }

    let html = '';
    students.forEach(email => {
        const progress = appState.studentProgress[teacherId][email] || { level: '', notes: '' };
        const idSafeEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
        
        html += `
        <div style="background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <div style="margin-bottom: 10px;">
                <strong style="font-size: 1.1rem; color:#2C3E50;">${email}</strong>
                <a href="tel:${studentsMap[email].phone}" style="margin-left: 10px; font-size: 0.9rem;">${studentsMap[email].phone}</a>
            </div>
            <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                <div class="form-group" style="flex: 1; min-width: 150px;">
                    <label style="font-size: 0.85rem;">Seviye / Durum</label>
                    <input type="text" id="level_${idSafeEmail}" value="${progress.level}" placeholder="Örn: Başlangıç, A2, Harflere geçildi..." onblur="updateStudentProgress('${teacherId}', '${email}', '${idSafeEmail}')">
                </div>
                <div class="form-group" style="flex: 3; min-width: 250px;">
                    <label style="font-size: 0.85rem;">Öğretmen Notları</label>
                    <input type="text" id="notes_${idSafeEmail}" value="${progress.notes}" placeholder="Öğrenci hakkında özel notlarınız..." onblur="updateStudentProgress('${teacherId}', '${email}', '${idSafeEmail}')">
                </div>
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

function updateStudentProgress(teacherId, email, idSafeEmail) {
    const level = document.getElementById(`level_${idSafeEmail}`).value.trim();
    const notes = document.getElementById(`notes_${idSafeEmail}`).value.trim();
    
    if (!appState.studentProgress[teacherId]) appState.studentProgress[teacherId] = {};
    appState.studentProgress[teacherId][email] = { level, notes };
    saveTeachers();
}

function renderTeacherAlarms() {
    const container = document.getElementById('teacher-alarms-list');
    if (!container) return;

    const activeTeacher = appState.teachers.find(t => t.email === appState.currentUser);
    if (!activeTeacher) return;
    const teacherId = activeTeacher.id;

    const alarms = appState.teacherAlarms[teacherId] || [];

    if (alarms.length === 0) {
        container.innerHTML = "<p style='color:#888;'>Kurulu bir alarm veya hatırlatıcı yok.</p>";
        return;
    }

    let html = '<div style="position: relative; padding-left: 20px; border-left: 2px solid #e3f2fd; margin-left: 10px;">';
    alarms.forEach(alarm => {
        const isPast = alarm.isCompleted;
        const iconColor = isPast ? "#ccc" : "#20C997";
        const cardBg = isPast ? "#f8f9fa" : "#ffffff";
        const textColor = isPast ? "#999" : "#333";
        const textDec = isPast ? "line-through" : "none";
        const shadow = isPast ? "none" : "0 4px 12px rgba(0,0,0,0.05)";
        const border = isPast ? "1px solid #eee" : "1px solid #e3f2fd";
        
        html += `
        <div style="position: relative; margin-bottom: 20px;">
            <div style="position: absolute; left: -29px; top: 15px; width: 16px; height: 16px; border-radius: 50%; background: ${iconColor}; border: 3px solid white; box-shadow: 0 0 0 2px ${iconColor}33;"></div>
            <div style="background: ${cardBg}; border: ${border}; box-shadow: ${shadow}; padding: 15px 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; transition: 0.3s ease;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: ${iconColor};">${alarm.time}</div>
                    <div style="text-decoration: ${textDec}; color: ${textColor}; font-size: 1.1rem;">
                        ${alarm.note}
                    </div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-sm" style="background: ${isPast ? '#e9ecef' : '#e8f9f4'}; color: ${isPast ? '#6c757d' : '#20c997'}; border: none; border-radius: 8px; font-weight: bold;" onclick="toggleAlarmStatus('${teacherId}', ${alarm.id})">
                        ${isPast ? 'Geri Al' : '✓ Tamamla'}
                    </button>
                    <button class="btn btn-sm" style="background: #ffebe9; color: #dc3545; border: none; border-radius: 8px; font-weight: bold;" onclick="removeTeacherAlarm('${teacherId}', ${alarm.id})">Sil</button>
                </div>
            </div>
        </div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

function addTeacherAlarm() {
    const activeTeacher = appState.teachers.find(t => t.email === appState.currentUser);
    if (!activeTeacher) return;
    const teacherId = activeTeacher.id;
    
    const time = document.getElementById('new-alarm-time').value;
    const note = document.getElementById('new-alarm-note').value.trim();

    if (!time || !note) return showCustomAlert("Lütfen saat ve not alanlarını doldurun.");

    if (!appState.teacherAlarms[teacherId]) appState.teacherAlarms[teacherId] = [];
    
    appState.teacherAlarms[teacherId].push({
        id: Date.now(),
        time: time,
        note: note,
        isCompleted: false
    });
    
    // Sort alarms by time
    appState.teacherAlarms[teacherId].sort((a, b) => a.time.localeCompare(b.time));
    
    saveTeachers();
    renderTeacherAlarms();
    
    document.getElementById('new-alarm-time').value = '';
    document.getElementById('new-alarm-note').value = '';
}

function setQuickTime(addMinutes) {
    const timeInput = document.getElementById('new-alarm-time');
    if (!timeInput) return;
    const now = new Date();
    now.setMinutes(now.getMinutes() + addMinutes);
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    timeInput.value = `${h}:${m}`;
}

function toggleAlarmStatus(teacherId, alarmId) {
    const alarm = appState.teacherAlarms[teacherId].find(a => a.id === alarmId);
    if (alarm) {
        alarm.isCompleted = !alarm.isCompleted;
        saveTeachers();
        renderTeacherAlarms();
    }
}

async function removeTeacherAlarm(teacherId, alarmId) {
    appState.teacherAlarms[teacherId] = appState.teacherAlarms[teacherId].filter(a => a.id !== alarmId);
    saveTeachers();
    renderTeacherAlarmsList();
}

function toggleTeacherPasswordVisibility() {
    const input = document.getElementById('teacher-profile-password');
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
    }
}

function enableTeacherPasswordEdit() {
    const input = document.getElementById('teacher-profile-password');
    const editBtn = document.getElementById('edit-teacher-password-btn');
    const saveBtn = document.getElementById('save-teacher-password-btn');
    if (input && editBtn && saveBtn) {
        input.disabled = false;
        input.type = 'text'; // Değiştirirken görsün diye
        input.focus();
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
    }
}

function saveTeacherPassword(teacherId) {
    const input = document.getElementById('teacher-profile-password');
    if (!input || !input.value.trim()) {
        showCustomAlert("Şifre boş olamaz.");
        return;
    }
    
    const teacher = appState.teachers.find(t => t.id === teacherId);
    if (teacher) {
        teacher.password = input.value.trim();
        saveTeachers();
        
        // Update users mock as well so they can login with new password
        let users = JSON.parse(localStorage.getItem('mockUsers') || '{}');
        if (users[teacher.email]) {
            users[teacher.email].password = teacher.password;
            localStorage.setItem('mockUsers', JSON.stringify(users));
        }

        if (typeof firebase !== 'undefined' && isFirebaseReady) {
            const user = firebase.auth().currentUser;
            if (user) {
                user.updatePassword(teacher.password).then(() => {
                    showCustomAlert("Şifreniz başarıyla güncellendi.");
                }).catch(err => {
                    showCustomAlert("Firebase şifre güncelleme hatası: " + err.message + "\nLütfen çıkış yapıp tekrar giriş yaparak deneyin.");
                });
            } else {
                showCustomAlert("Şifreniz başarıyla güncellendi.");
            }
        } else {
            showCustomAlert("Şifreniz başarıyla güncellendi.");
        }
        
        // Reset UI
        input.disabled = true;
        input.type = 'password';
        document.getElementById('edit-teacher-password-btn').style.display = 'inline-block';
        document.getElementById('save-teacher-password-btn').style.display = 'none';
    }
}



function renderTeacherScheduleEditor() {
    const editor = document.getElementById('teacher-schedule-editor');
    if (!editor) return;

    const activeTeacher = appState.teachers.find(t => t.email === appState.currentUser);
    if (!activeTeacher) return;
    const teacherId = activeTeacher.id;

    editor.innerHTML = getTeacherCalendarEditorHtml(teacherId, false);
}

async function toggleSlotStatus(teacherId, groupName, time, element, isStudentBooked = false) {
    if (isStudentBooked) {
        showCustomAlert("Bu saat spesifik olarak bir öğrenci randevusuna ayrılmıştır.\n\nEğer bu saati açmak istiyorsanız, öncelikle 'Tüm Randevu Talepleri' (veya Derslerim) bölümünden öğrencinin randevusunu iptal etmelisiniz.");
        return;
    }

    const group = teacherSchedules[teacherId].find(g => g.name === groupName);
    if (!group) return;
    const currentStatus = group.data[time] || "musait";
    
    if (currentStatus !== "musait") {
        const studentName = currentStatus === "dolu" ? "Bu" : `"${currentStatus}" isimli öğrencinin`;
        if (!await showCustomConfirm(`Emin misiniz? ${studentName} dersini iptal edip bu saati müsaite çevirmek üzeresiniz.`)) {
            return;
        }
    }

    const newStatus = currentStatus === "musait" ? "dolu" : "musait";
    group.data[time] = newStatus;
    
    element.classList.remove("musait", "dolu");
    element.classList.add(newStatus);
    
    const label = newStatus === "dolu" ? "Dolu" : "Müsait";
    const icon = newStatus === "dolu" ? "❌" : "✅";
    element.innerHTML = `${icon} ${time}<br><small style="font-size:0.7rem;">${label}</small>`;
    
    saveTeachers();
}

// Sürüklenebilir Kamera Mantığı
window.addEventListener('DOMContentLoaded', () => {
    const dragItem = document.getElementById("draggable-camera");
    if (!dragItem) return;
    let active = false, currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;

    dragItem.addEventListener("mousedown", dragStart, false);
    document.addEventListener("mouseup", dragEnd, false);
    document.addEventListener("mousemove", drag, false);
    dragItem.addEventListener("touchstart", dragStart, {passive: false});
    document.addEventListener("touchend", dragEnd, false);
    document.addEventListener("touchmove", drag, {passive: false});

    function dragStart(e) {
        initialX = (e.type === "touchstart" ? e.touches[0].clientX : e.clientX) - xOffset;
        initialY = (e.type === "touchstart" ? e.touches[0].clientY : e.clientY) - yOffset;
        if (e.target === dragItem || dragItem.contains(e.target)) active = true;
    }
    function dragEnd(e) { initialX = currentX; initialY = currentY; active = false; }
    function drag(e) {
        if (active) {
            e.preventDefault();
            currentX = (e.type === "touchmove" ? e.touches[0].clientX : e.clientX) - initialX;
            currentY = (e.type === "touchmove" ? e.touches[0].clientY : e.clientY) - initialY;
            xOffset = currentX; yOffset = currentY;
            dragItem.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        }
    }
});

