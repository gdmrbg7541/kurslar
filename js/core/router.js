/* ==========================================
   4. BAŞLANGIÇ VE NAVİGASYON (ROUTING)
   ========================================== */
function initApp() {
    const urlParams = new URLSearchParams(window.location.search);
    const liveRoomId = urlParams.get('liveRoom');

    if (liveRoomId) {
        appState.isInviteMode = true;
        
        // Eğer giriş yapan kişi öğretmen veya admin ise, çıkış yaptır.
        if (appState.userRole === 'admin' || appState.userRole === 'teacher') {
            cikisYap(); 
            return; // cikisYap -> initAppAsGuest -> initApp döngüsü ile geri gelecek
        }

        // Arayüzü tamamen gizle
        const appContainer = document.getElementById('app-container');
        if (appContainer) appContainer.style.display = 'none';

        // Tam ekran butonunu gizle (Zorla tam ekran yapacağız)
        const fsBtn = document.getElementById('fullscreen-btn');
        if (fsBtn) fsBtn.style.display = 'none';

        // Odayı kapatma butonunu da kapatalım, yerine sadece alttaki "Ayrıl" tuşu çalışsın.
        const closeBtns = document.querySelectorAll('#live-modal-content .modal-close, #live-modal-content [title="Kapat"]');
        closeBtns.forEach(btn => btn.style.display = 'none');

        // Misafir ise isim sor VEYA Google ile giriş iste
        const isAnonymous = typeof firebase !== 'undefined' && firebase.auth().currentUser && firebase.auth().currentUser.isAnonymous;
        if (appState.userRole === 'student' && (appState.currentUser === "Misafir Öğrenci" || (isAnonymous && (!appState.currentUserName || appState.currentUserName === "Öğrenci")))) {
            const promptHTML = `
                <div id="guest-name-prompt" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100dvh; background: #111; z-index: 3000; display: flex; align-items: center; justify-content: center; flex-direction: column; font-family: 'Inter', sans-serif;">
                    <div class="glass-card" style="padding: 40px; border-radius: 16px; text-align: center; max-width: 400px; width: 90%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);">
                        <h2 style="color: white; margin-bottom: 20px;">Canlı Derse Katıl</h2>
                        <p style="color: #aaa; margin-bottom: 20px; font-size: 0.95rem;">Derse katılmak için lütfen adınızı yazın.</p>
                        
                        <input type="text" id="guest-name-input" placeholder="Örn: Ali Yılmaz" style="width: 100%; padding: 15px; border-radius: 8px; border: none; margin-bottom: 20px; font-size: 1.1rem; background: rgba(255,255,255,0.9); color: #333; outline: none; box-sizing: border-box; text-align: center;">
                        <button onclick="joinAsGuest(this)" style="width: 100%; padding: 15px; font-size: 1.1rem; background: #20C997; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; transition: background 0.2s;" onmouseover="this.style.background='#17a589'" onmouseout="this.style.background='#20C997'">Odaya Gir</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', promptHTML);
            
            window.joinAsGuest = async function(btnElement) {
                const name = document.getElementById('guest-name-input').value.trim();
                if (!name) {
                    showCustomAlert("Lütfen adınızı girin.");
                    return;
                }
                
                if (btnElement) {
                    btnElement.innerHTML = "Odaya Bağlanıyor...";
                    btnElement.style.opacity = "0.7";
                    btnElement.disabled = true;
                }

                appState.currentUserName = name;
                
                try {
                    if (firebase.auth().currentUser === null) {
                        await firebase.auth().signInAnonymously();
                    }
                    const prompt = document.getElementById('guest-name-prompt');
                    if (prompt) prompt.remove();
                    
                    openLiveClassRoom();
                    const modalContent = document.getElementById('live-modal-content');
                    if (modalContent && !modalContent.classList.contains('maximized')) {
                        modalContent.classList.add('maximized');
                    }
                } catch(e) {
                    console.warn("Anonim giriş yapılamadı:", e);
                    showCustomAlert("Odaya bağlanırken sunucu engeline takıldı. Firebase kurallarınızı kontrol edin.");
                    if (btnElement) {
                        btnElement.innerHTML = "Odaya Gir";
                        btnElement.style.opacity = "1";
                        btnElement.disabled = false;
                    }
                }
            };
        } else {
            // Zaten kayıtlı öğrenci ise doğrudan gir
            openLiveClassRoom();
            const modalContent = document.getElementById('live-modal-content');
            if (modalContent && !modalContent.classList.contains('maximized')) {
                modalContent.classList.add('maximized');
            }
        }

        return; // Sitenin kalanını render etme
    }

    if (appState.userRole === 'admin') {
        changeView('admin-section');
        renderAdminPanel();
    } else if (appState.userRole === 'teacher') {
        changeView('teacher-section');
        renderTeacherPanel();
    } else {
        // Misafir veya Öğrenci ise Dashboard göster (Ödemesi yapılanları görmek için)
        changeView('dashboard-section');
        renderPackages();
        renderOnlinePackages();
        refreshTeacherSelect();
    }
}

function changeView(viewName, isBackAction = false) {
    const sections = ['dashboard-section', 'offline-section', 'online-packages-section', 'booking-section', 'checkout-section', 'admin-section', 'teacher-section', 'student-profile-section'];
    sections.forEach(sec => {
        let el = document.getElementById(sec);
        if(el) el.style.display = 'none';
    });

    if(document.getElementById('package-list-area')) document.getElementById('package-list-area').style.display = 'none';
    if(document.getElementById('active-package-area')) document.getElementById('active-package-area').style.display = 'none';
    if(document.getElementById('offline-checkout-summary')) document.getElementById('offline-checkout-summary').style.display = 'none';

    // Tab active styling and visibility
    const navTabs = document.getElementById('header-nav-tabs');
    const tabPaketler = document.getElementById('tab-paketler');
    const tabOnlinePackages = document.getElementById('tab-online-packages');
    const tabBooking = document.getElementById('tab-booking');
    
    if (navTabs) {
        if (appState.userRole === 'admin' || appState.userRole === 'teacher') {
            navTabs.style.display = 'none';
        } else {
            navTabs.style.display = 'flex';
        }
    }

    if (tabPaketler && tabOnlinePackages && tabBooking) {
        // Reset styles
        [tabPaketler, tabOnlinePackages, tabBooking].forEach(t => {
            t.style.borderBottom = '3px solid transparent';
            t.style.color = 'rgba(255,255,255,0.8)';
        });
        
        if (viewName === 'offline-list' || viewName === 'active-package') {
            tabPaketler.style.borderBottom = '3px solid white';
            tabPaketler.style.color = 'white';
        } else if (viewName === 'online-packages-list') {
            tabOnlinePackages.style.borderBottom = '3px solid white';
            tabOnlinePackages.style.color = 'white';
        } else if (viewName === 'booking-section') {
            tabBooking.style.borderBottom = '3px solid white';
            tabBooking.style.color = 'white';
        }
    }

    if (viewName !== 'student-profile-section' && appState.currentView === 'student-profile-section') {
        appState.profileScrollPos = window.scrollY || document.documentElement.scrollTop;
        const details = document.getElementById('student-info-details');
        if (details) appState.profileDetailsOpen = details.open;
    }

    if (viewName === 'dashboard-section') {
        document.getElementById('dashboard-section').style.display = 'block';
    } else if (viewName === 'student-profile-section') {
        document.getElementById('student-profile-section').style.display = 'block';
        renderStudentProfile();
        
        if (isBackAction) {
            const details = document.getElementById('student-info-details');
            if (details && appState.profileDetailsOpen) {
                details.open = true;
            }
            setTimeout(() => {
                window.scrollTo({ top: appState.profileScrollPos || 0, behavior: 'instant' });
            }, 50);
        } else {
            window.scrollTo(0, 0);
        }
    } else if (viewName === 'offline-list') {
        document.getElementById('offline-section').style.display = 'block';
        let h2 = document.querySelector('#offline-section h2');
        if(h2) h2.style.display = 'block';
        document.getElementById('package-list-area').style.display = 'grid';
        if (typeof renderPackages === 'function') renderPackages();
        if (typeof updateOfflineSummary === 'function') updateOfflineSummary();
    } else if (viewName === 'active-package') {
        document.getElementById('offline-section').style.display = 'block';
        let h2 = document.querySelector('#offline-section h2');
        if(h2) h2.style.display = 'none';
        document.getElementById('active-package-area').style.display = 'block';
    } else if (viewName === 'online-packages-list') {
        document.getElementById('online-packages-section').style.display = 'block';
        document.getElementById('online-package-list-area').style.display = 'grid';
        if (typeof renderOnlinePackagesGrid === 'function') renderOnlinePackagesGrid();
        if (typeof updateOnlineSummary === 'function') updateOnlineSummary();
    } else if (viewName === 'booking-section') {
        document.getElementById('booking-section').style.display = 'block';
        if (typeof renderOnlinePackages === 'function') renderOnlinePackages(); // this might be legacy call
        
        // Online bölüme girince akordiyonları sıfırla
        const step1 = document.getElementById('online-step-1');
        const step2 = document.getElementById('online-step-2');
        const step3 = document.getElementById('online-step-3');
        if (step1) {
            step1.style.maxHeight = "3000px";
            step1.style.opacity = "1";
            const hTotal = document.getElementById('step1-header-total');
            if(hTotal) hTotal.style.display = 'none';
        }
        if (step2) {
            step2.style.maxHeight = "70px";
            step2.style.opacity = "0.4";
            step2.style.pointerEvents = "none";
        }
        if (step3) {
            step3.style.maxHeight = "70px";
            step3.style.opacity = "0.4";
            step3.style.pointerEvents = "none";
        }
    } else if (viewName === 'checkout-section') {
        document.getElementById('checkout-section').style.display = 'block';
    } else if (viewName === 'admin-section') {
        document.getElementById('admin-section').style.display = 'block';
    } else if (viewName === 'teacher-section') {
        document.getElementById('teacher-section').style.display = 'block';
    }

    appState.currentView = viewName;

    const backBtn = document.getElementById('header-back-icon');
    const homeBtn = document.getElementById('header-home-icon');
    const isMainPage = (viewName === 'dashboard-section' || viewName === 'admin-section' || viewName === 'teacher-section');
    
    if (backBtn) backBtn.style.display = isMainPage ? 'none' : 'block';
    if (homeBtn) homeBtn.style.display = isMainPage ? 'block' : 'none';

    if (!isBackAction) {
        if (appState.viewHistory[appState.viewHistory.length - 1] !== viewName) {
            appState.viewHistory.push(viewName);
        }
    }
}

function goBack() {
    let baseView = 'dashboard-section';
    if(appState.userRole === 'admin') baseView = 'admin-section';
    if(appState.userRole === 'teacher') baseView = 'teacher-section';

    if (appState.viewHistory.length <= 1 || appState.currentView === baseView) {
        window.location.href = 'https://kidefarapca.com';
        return;
    }
    
    appState.viewHistory.pop();
    const previousView = appState.viewHistory[appState.viewHistory.length - 1] || baseView;
    changeView(previousView, true);
}

function toggleStudentProfile() {
    if (appState.currentView === 'student-profile-section') {
        goBack();
    } else {
        changeView('student-profile-section');
    }
}

function renderStudentProfile() {
    const profileSection = document.getElementById('student-profile-section');
    if (!profileSection) return;

    let users = JSON.parse(localStorage.getItem('mockUsers') || '{}');
    let user = users[appState.currentUser] || {};
    
    const myPendingLessons = appState.pendingLessons.filter(l => l.studentEmail === appState.currentUser);
    const myApprovedLessons = appState.approvedLessons.filter(l => l.studentEmail === appState.currentUser);
    let myAllLiveLessons = [...myPendingLessons, ...myApprovedLessons];
    
    // YÖNETİCİ MODU: Yöneticide tüm canlı ders paketleri de profilde sanki alınmış gibi görünsün
    if (appState.userRole === 'admin') {
        const adminMockLessons = appState.onlinePackages.map(pkg => ({
            id: 'mock_admin_' + pkg.id,
            studentEmail: appState.currentUser,
            package: pkg.name,
            status: 'approved',
            requestedTeacherId: 'any',
            slots: ["Pazartesi 10:00", "Çarşamba 14:00"] // Örnek saatler
        }));
        myAllLiveLessons = [...myAllLiveLessons, ...adminMockLessons];
    }
    const offlineCount = appState.purchasedPackages.length;
    const liveCount = myAllLiveLessons.length;
    
    let html = `
        <div style="display: flex; gap: 20px; margin-bottom: 25px; flex-wrap: wrap;">
            <div class="glass-card" style="flex: 1; min-width: 200px; text-align: center; border-bottom: 4px solid #20C997;">
                <h3 style="color: #666; margin-bottom: 10px; font-size: 1.1rem;">Çevrimdışı Paketler</h3>
                <div style="font-size: 2.5rem; font-weight: bold; color: #20C997;">${offlineCount}</div>
            </div>
            <div class="glass-card" style="flex: 1; min-width: 200px; text-align: center; border-bottom: 4px solid #4facfe;">
                <h3 style="color: #666; margin-bottom: 10px; font-size: 1.1rem;">Canlı / Özel Dersler</h3>
                <div style="font-size: 2.5rem; font-weight: bold; color: #4facfe;">${liveCount}</div>
            </div>
        </div>
        
        <h3 style="margin-top: 30px; margin-bottom: 15px;">Satın Aldığım Çevrimdışı Paketler</h3>
        <div class="package-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
    `;

    if (appState.purchasedPackages.length === 0) {
        html += `<p style="grid-column: 1/-1;">Henüz satın alınmış bir paketiniz bulunmuyor.</p>`;
    } else {
        appState.purchasedPackages.forEach(pkgId => {
            const pkg = appState.packages.find(p => p.id === pkgId);
            if (!pkg) return;
            
            // İlerleme verisini çek
            const progressObj = appState.studentProgress["self"] && appState.studentProgress["self"][appState.currentUser] ? appState.studentProgress["self"][appState.currentUser] : {};
            const savedStep = progressObj[pkgId] || 1;
            const pkgData = appState.kazanimData[pkgId] || { total: 40 };
            const pkgTotalCount = pkgData.total;
            
            let completedSteps = savedStep - 1;
            if (completedSteps > pkgTotalCount) completedSteps = pkgTotalCount;
            
            const progressPercent = Math.round((completedSteps / pkgTotalCount) * 100);
            
            let btnHtml = '';
            let labelStep = savedStep;
            if (savedStep > pkgTotalCount) {
                btnHtml = `<button class="btn btn-outline" style="width: 100%; margin-top: 15px; border:2px solid #20C997; color:#20C997; background:white; font-weight:bold;">Tamamlandı (Tekrarla)</button>`;
                labelStep = pkgTotalCount;
            } else {
                btnHtml = `<button class="btn btn-success" style="width: 100%; margin-top: 15px;">Derse Devam Et</button>`;
            }

            let pdfBtnHtml = '';
            if (pkg.pdfLink) {
                pdfBtnHtml = `<button onclick="downloadFasikul(${pkg.id}, 'assets/pdf/${pkg.pdfLink}')" class="btn btn-outline" style="width: 100%; margin-top: 10px; border:2px solid #4facfe; color:#4facfe; background:white; font-weight:bold; display:block; text-align:center; padding: 10px 0; cursor:pointer;">📄 Fasikülü İndir (PDF)</button>`;
            }

            html += `
                <div class="package-card" style="border: 2px solid #20C997; flex-direction: column; align-items: stretch;">
                    <h3 style="margin-top:0; cursor:pointer;" onclick="startPackage(${pkg.id}, '${pkg.title.replace(/'/g, "\\'")}')">${pkg.title}</h3>
                    
                    <div style="margin-top: 15px; cursor:pointer;" onclick="startPackage(${pkg.id}, '${pkg.title.replace(/'/g, "\\'")}')">
                        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:5px;">
                            <span>İlerleme: %${progressPercent}</span>
                            <span>Adım: ${labelStep} / ${pkgTotalCount}</span>
                        </div>
                        <div style="width: 100%; background: #e9ecef; border-radius: 4px; height: 8px; overflow: hidden;">
                            <div style="width: ${progressPercent}%; height: 100%; background: #20C997;"></div>
                        </div>
                    </div>
                    <div onclick="startPackage(${pkg.id}, '${pkg.title.replace(/'/g, "\\'")}')">${btnHtml}</div>
                    ${pdfBtnHtml}
                </div>
            `;
        });
    }

    html += `</div>`;

    // CANLI DERSLER BÖLÜMÜ (Önceden myAllLiveLessons hesaplandı)

    html += `<h3 style="margin-top: 30px; margin-bottom: 15px;">Canlı & Özel Derslerim</h3>`;
    html += `<div class="package-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">`;
    
    if (myAllLiveLessons.length === 0) {
        html += `<p style="grid-column: 1/-1;">Henüz alınmış bir canlı veya özel dersiniz bulunmuyor.</p>`;
    } else {
        myAllLiveLessons.forEach(lesson => {
            const statusLabel = lesson.status === 'pending' ? '<span style="color:#F39C12; font-weight:bold;">⏳ Eğitmen Onayı Bekliyor</span>' : '<span style="color:#20C997; font-weight:bold;">✅ Onaylandı / Aktif</span>';
            const teacherObj = appState.teachers.find(t => t.id === lesson.requestedTeacherId);
            const teacherName = teacherObj ? teacherObj.name : "Havuz (Tüm Eğitmenler)";
            
            // Group slots by day
            const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
            let slotsByDay = {};
            lesson.slots.forEach(slotStr => {
                let foundDay = slotStr.split(' ')[0];
                let time = slotStr.substring(foundDay.length).trim();
                
                for(let i=0; i<days.length; i++) {
                    if(slotStr.startsWith(days[i] + ' ')) {
                        foundDay = days[i];
                        time = slotStr.substring(days[i].length).trim();
                        break;
                    }
                }
                
                if (!slotsByDay[foundDay]) slotsByDay[foundDay] = [];
                slotsByDay[foundDay].push(time);
            });
            
            let slotsHtml = '';
            days.forEach(d => {
                if (slotsByDay[d] && slotsByDay[d].length > 0) {
                    slotsHtml += `<div style="margin-bottom: 6px;"><strong style="color: #1f5f99; border-bottom: 1px solid rgba(31,95,153,0.2); padding-bottom: 2px;">${d}</strong><br><span style="color:#555; display: inline-block; margin-top: 3px;">${slotsByDay[d].join(', ')}</span></div>`;
                }
            });

            const packageNames = lesson.package.split(',').map(name => name.trim());
            
            packageNames.forEach(pkgName => {
                if (!pkgName) return;
                html += `
                    <div class="package-card" style="border: 2px solid #4facfe; flex-direction: column; align-items: stretch; cursor: default;">
                        <h3 style="margin-top:0; color:#4facfe; font-size:1.1rem;">${pkgName}</h3>
                        <div style="margin-top: 10px; font-size: 0.9rem;">
                            <p style="margin-bottom: 5px;"><strong>Durum:</strong> ${statusLabel}</p>
                            <p style="margin-bottom: 5px;"><strong>Eğitmen:</strong> ${teacherName}</p>
                            <p style="margin-bottom: 5px;"><strong>Toplam Seçilen Saat:</strong> ${lesson.slots.length} Saat</p>
                            <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 6px; font-size: 0.8rem; border: 1px solid #eee; max-height: 150px; overflow-y: auto;">
                                <div style="margin-bottom: 8px;"><strong>📅 Ders Programı:</strong></div>
                                ${slotsHtml}
                            </div>
                        </div>
                    </div>
                `;
            });
        });
    }
    html += `</div>`;

    // Haftalık Takvim Alanı
    html += `<h3 style="margin-top: 30px; margin-bottom: 15px;">Haftalık Canlı Ders Takvimi</h3>`;
    html += `<div id="student-calendar-container" class="student-calendar"></div>`;

    profileSection.innerHTML = html;
    renderStudentCalendar();
}

function renderStudentCalendar() {
    const container = document.getElementById('student-calendar-container');
    if (!container) return;
    
    const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
    const myApprovedLessons = appState.approvedLessons.filter(l => l.studentEmail === appState.currentUser);
    
    let html = '';
    
    days.forEach(day => {
        let daySlots = [];
        myApprovedLessons.forEach(lesson => {
            lesson.slots.forEach(slotStr => {
                if (slotStr.startsWith(day + ' ')) {
                    const time = slotStr.substring(day.length).trim();
                    daySlots.push({ time: time, teacher: lesson.teacherId });
                }
            });
        });
        
        // Sort by time
        daySlots.sort((a, b) => {
            return parseInt(a.time.split(':')[0]) - parseInt(b.time.split(':')[0]);
        });
        
        const hasClass = daySlots.length > 0 ? 'has-class' : '';
        html += `<div class="calendar-day ${hasClass}">
                    <div class="calendar-day-title">${day}</div>`;
        
        if (daySlots.length > 0) {
            daySlots.forEach(slot => {
                const teacherObj = appState.teachers.find(t => t.id === slot.teacher);
                const teacherName = teacherObj ? teacherObj.name : "Eğitmen";
                html += `<div class="calendar-slot" data-day="${day}" data-time="${slot.time}" data-teacher="${slot.teacher}">
                            <strong>${slot.time}</strong><br>
                            <small>${teacherName}</small>
                            <span class="live-dot-container" style="display:none;" title="Canlı Derse Katıl" onclick="openLiveClassRoom()"></span>
                         </div>`;
            });
        } else {
            html += `<div style="font-size: 0.8rem; color: #999; margin-top: 20px;">Ders Yok</div>`;
        }
        
        html += `</div>`;
    });
    
    container.innerHTML = html;
}

// Canlı Ders Odası Fonksiyonları
function toggleSidebar(tabName) {
    const sidebar = document.getElementById('live-sidebar');
    if (!sidebar) return;
    
    if (!sidebar.classList.contains('open')) {
        sidebar.classList.add('open');
        switchSidebarTab(tabName);
    } else {
        // If it's already open and we clicked the same tab's button, close it
        const currentActiveBtn = document.querySelector('.sidebar-tab.active');
        const clickedTabId = `tab-btn-${tabName}`;
        if (currentActiveBtn && currentActiveBtn.id === clickedTabId) {
            sidebar.classList.remove('open');
        } else {
            // Switch tab
            switchSidebarTab(tabName);
        }
    }
}

function switchSidebarTab(tabName) {
    document.getElementById('tab-btn-participants').classList.remove('active');
    document.getElementById('tab-btn-chat').classList.remove('active');
    document.getElementById('sidebar-content-participants').style.display = 'none';
    document.getElementById('sidebar-content-chat').style.display = 'none';

    document.getElementById(`tab-btn-${tabName}`).classList.add('active');
    document.getElementById(`sidebar-content-${tabName}`).style.display = tabName === 'chat' ? 'flex' : 'block';
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg || !appState.activeRoomId || typeof isFirebaseReady === 'undefined' || !isFirebaseReady) {
        // Fallback or just append locally if not ready
        if (msg) {
            const chatContainer = document.getElementById('chat-messages');
            const msgDiv = document.createElement('div');
            msgDiv.className = 'chat-message';
            msgDiv.innerHTML = `<div class="sender">Siz</div><div style="font-size: 0.9rem;">${msg}</div>`;
            chatContainer.appendChild(msgDiv);
            input.value = '';
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
        return;
    }

    const senderName = appState.isInviteMode ? "Öğrenci/Misafir" : (appState.currentUserName && appState.currentUserName !== "Belirtilmedi" ? appState.currentUserName : "Öğretmen");

    db.collection('rooms').doc(appState.activeRoomId).collection('messages').add({
        text: msg,
        sender: senderName,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    input.value = '';
}

function populateParticipants() {
    const list = document.getElementById('participants-list');
    if(!list) return;
    list.innerHTML = '';
    
    let youName = appState.currentUser ? appState.currentUser.split('@')[0] : 'Misafir';
    if(appState.userRole === 'admin') youName = 'Yönetici';
    else if(appState.userRole === 'teacher') youName = 'Eğitmen ' + youName;

    // You
    list.innerHTML += `
        <li class="participant-item">
            <div class="avatar">${youName.charAt(0).toUpperCase()}</div>
            <div>
                <div style="font-weight:bold;">${youName} (Siz)</div>
                <div style="font-size:0.8rem; color:#20C997;">Mikrofon Açık</div>
            </div>
        </li>
    `;

    // Dummy participant depending on role
    let otherName = appState.userRole === 'student' ? 'Eğitmen Geylani' : 'Öğrenci Ahmet';
    
    // Yöneticiler (Öğretmen/Admin) dersi başlattığında diğer katılımcıları sessize alma/görüntü kapatma yetkisine sahiptir.
    let adminControls = '';
    if(appState.userRole !== 'student') {
        adminControls = `
            <div style="margin-top: 5px; display: flex; gap: 5px;">
                <button onclick="toggleRemoteMute()" style="background:#444; border:none; color:white; border-radius:4px; padding:2px 5px; cursor:pointer; font-size:0.7rem;" id="btn-remote-mute" title="Sesi Kapat">🔇</button>
                <button onclick="toggleRemoteVideo()" style="background:#444; border:none; color:white; border-radius:4px; padding:2px 5px; cursor:pointer; font-size:0.7rem;" id="btn-remote-video" title="Görüntüyü Kapat">🚫</button>
                <button onclick="ejectRemoteParticipant()" style="background:#ff3b30; border:none; color:white; border-radius:4px; padding:2px 5px; cursor:pointer; font-size:0.7rem;" id="btn-remote-eject" title="Odadan At"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg></button>
            </div>
        `;
    }

    list.innerHTML += `
        <li class="participant-item" id="dummy-participant-item">
            <div class="avatar" style="background:#f39c12;">${otherName.charAt(0).toUpperCase()}</div>
            <div>
                <div style="font-weight:bold;">${otherName}</div>
                <div style="font-size:0.8rem; color:#aaa;" id="dummy-participant-status">Bekleniyor...</div>
                ${adminControls}
            </div>
        </li>
    `;
}

function toggleRemoteMute() {
    const statusText = document.getElementById('dummy-participant-status');
    const btn = document.getElementById('btn-remote-mute');
    if(!statusText || !btn) return;

    if(statusText.innerText.includes('Kapatıldı')) {
        statusText.innerText = 'Mikrofon Açık';
        statusText.style.color = '#20C997';
        btn.style.background = '#444';
    } else {
        statusText.innerText = 'Sesi Kapatıldı (Yönetici)';
        statusText.style.color = '#ff3b30';
        btn.style.background = '#ff3b30';
    }
}

function toggleRemoteVideo() {
    const remoteVideo = document.getElementById('mock-remote-video');
    const remoteBox = document.getElementById('remote-participant-box');
    const remoteAvatar = document.getElementById('remote-avatar');
    const btn = document.getElementById('btn-remote-video');
    if(!remoteVideo || !btn || !remoteBox) return;

    if(remoteBox.classList.contains('camera-off')) {
        remoteBox.classList.remove('camera-off');
        if(remoteAvatar) remoteAvatar.style.display = 'none';
        btn.style.background = '#444';
    } else {
        remoteBox.classList.add('camera-off');
        if(remoteAvatar) remoteAvatar.style.display = 'flex';
        btn.style.background = '#ff3b30';
    }
}

function ejectRemoteParticipant() {
    // Katılımcı öğesini listeden sil
    const participantItem = document.getElementById('dummy-participant-item');
    if(participantItem) participantItem.remove();

    // Kamera öğesini grid'den sil
    const remoteBox = document.getElementById('remote-participant-box');
    if(remoteBox) remoteBox.remove();

    // Bildirim göster
    const toast = document.getElementById("toast-message");
    if(toast) {
        toast.innerText = "Katılımcı odadan çıkarıldı.";
        toast.className = "toast-message show";
        setTimeout(function(){ toast.className = toast.className.replace("show", ""); setTimeout(() => toast.innerText="Link Kopyalandı!", 500); }, 3000);
    }
}

function playJoinSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1); // A6
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    } catch(e) {
        console.log("AudioContext not supported or blocked");
    }
}

// Canlı Ders Kontrol ve Bildirim Sistemi (Interval)
setInterval(checkLiveLessonStatus, 30000); // Her 30 saniyede bir kontrol et

function checkLiveLessonStatus() {
    if(appState.userRole !== 'student' && appState.userRole !== 'teacher') return;
    
    // Test amaçlı bugünü simüle edebiliriz ama normalde gerçek saat kullanılır
    const now = new Date();
    // Geylani hoca sistemi simüle etmek için saati Pazartesi vs yapmayacağız ama
    // JavaScript getDay() ile Pazar=0, Pzt=1, Sali=2, Cars=3, Pers=4, Cuma=5, Cts=6
    const daysMap = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
    const currentDayStr = daysMap[now.getDay()];
    
    // Simüle etmek istiyorsak, manuel bir ayar yapabiliriz ama şimdilik sistem saati
    // Test için: let currentDayStr = "Cumartesi"; 
    // let nowHour = 15; let nowMin = 0; vb.
    
    let upcomingLessonIn5Mins = false;
    let upcomingLessonIn2Mins = false;
    let targetLessonSlot = null;

    let relevantLessons = [];
    if(appState.userRole === 'student') {
        relevantLessons = appState.approvedLessons.filter(l => l.studentEmail === appState.currentUser);
    } else if(appState.userRole === 'teacher') {
        relevantLessons = appState.approvedLessons.filter(l => l.teacherId === appState.currentUser);
    }

    relevantLessons.forEach(lesson => {
        lesson.slots.forEach(slotStr => {
            if(slotStr.startsWith(currentDayStr + ' ')) {
                const timeStr = slotStr.substring(currentDayStr.length).trim();
                const [startH, startM] = timeStr.split('-')[0].split('.').map(Number);
                
                // Ders başlangıç zamanı (bugün için)
                let lessonDate = new Date(now);
                lessonDate.setHours(startH, startM || 0, 0, 0);
                
                let diffMinutes = (lessonDate - now) / 1000 / 60;
                
                // Eğer ders geçmişteyse ama 1 saat süresi dolmadıysa hala derstedir, 
                // biz "derse başla" uyarısını -60 ile +5 dakika arasında tutabiliriz.
                if(diffMinutes <= 5 && diffMinutes >= -60) {
                    upcomingLessonIn5Mins = true;
                }
                
                if(diffMinutes <= 2 && diffMinutes >= -60) {
                    upcomingLessonIn2Mins = true;
                    targetLessonSlot = timeStr;
                }
            }
        });
    });

    // Header Noktası (Öğrenci & Öğretmen için)
    const headerDot = document.getElementById('header-live-dot');
    if(headerDot) {
        if(upcomingLessonIn5Mins) {
            headerDot.style.display = 'block';
            headerDot.onclick = () => openLiveClassRoom();
            headerDot.style.cursor = 'pointer';
        } else {
            headerDot.style.display = 'none';
        }
    }

    // Takvim Noktası (Sadece Öğrenci için ve takvim açıksa)
    if(appState.userRole === 'student' && document.getElementById('student-calendar-container')) {
        const slots = document.querySelectorAll('.calendar-slot');
        slots.forEach(slot => {
            const dot = slot.querySelector('.live-dot-container');
            if(dot) {
                if(slot.getAttribute('data-day') === currentDayStr && slot.getAttribute('data-time') === targetLessonSlot && upcomingLessonIn2Mins) {
                    dot.innerHTML = '<span class="live-dot"></span>';
                    dot.style.display = 'block';
                    slot.style.borderColor = '#ff3b30';
                } else {
                    dot.style.display = 'none';
                    slot.style.borderColor = '#ddd';
                }
            }
        });
    }
}


window.showCustomAlert = function(message) {
    // Check if modal already exists
    let alertBox = document.getElementById('custom-alert-box');
    if (!alertBox) {
        alertBox = document.createElement('div');
        alertBox.id = 'custom-alert-box';
        alertBox.style.cssText = `
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
            background: #fff; border-left: 4px solid #F39C12; border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2); padding: 15px 20px;
            z-index: 9999; display: flex; align-items: center; gap: 15px;
            font-family: 'Inter', sans-serif; transition: 0.3s;
        `;
        alertBox.innerHTML = `
            <div id="custom-alert-msg" style="flex:1; color:#333;"></div>
            <button onclick="document.getElementById('custom-alert-box').style.display='none'" style="background:transparent; border:none; font-size:1.2rem; cursor:pointer; color:#999;">&times;</button>
        `;
        document.body.appendChild(alertBox);
    }
    
    document.getElementById('custom-alert-msg').innerText = message;
    alertBox.style.display = 'flex';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        if (alertBox.style.display === 'flex') {
            alertBox.style.display = 'none';
        }
    }, 5000);
};

window.downloadFasikul = function(pkgId, pdfPath) {
    if (!appState.studentProgress["self"]) appState.studentProgress["self"] = {};
    if (!appState.studentProgress["self"][appState.currentUser]) appState.studentProgress["self"][appState.currentUser] = {};
    
    let downloadedKey = pkgId + "_pdfDownloaded";
    
    if (appState.studentProgress["self"][appState.currentUser][downloadedKey]) {
        if (typeof showCustomAlert === 'function') {
            showCustomAlert("Bu fasikülü daha önce indirdiniz! Her paket için sadece 1 indirme hakkınız bulunmaktadır.");
        } else {
            alert("Bu fasikülü daha önce indirdiniz! Her paket için sadece 1 indirme hakkınız bulunmaktadır.");
        }
        return;
    }
    
    // İşaretle
    appState.studentProgress["self"][appState.currentUser][downloadedKey] = true;
    if (typeof saveStudentData === 'function') saveStudentData();
    
    // İndirmeyi başlat
    let a = document.createElement('a');
    a.href = pdfPath;
    a.download = pdfPath.split('/').pop();
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    if (typeof showCustomAlert === 'function') {
        showCustomAlert("Fasikül indirme işlemi başlatıldı. Bu paketteki hakkınızı kullandınız.");
    }
};
