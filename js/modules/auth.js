/* ==========================================
   3. FIREBASE & AUTH (GİRİŞ/KAYIT)
   ========================================== */
const firebaseConfig = {
    apiKey: "AIzaSyCACkSgl93T0ffFDTFLuCszy9nh7odH5VU",
    authDomain: "kurslar-835c0.firebaseapp.com",
    projectId: "kurslar-835c0",
    storageBucket: "kurslar-835c0.firebasestorage.app",
    messagingSenderId: "956300904876",
    appId: "1:956300904876:web:8e43e9a0c60a1811dad209",
    measurementId: "G-JENZQ7X5LW"
};

let isFirebaseReady = true;
let db = null;

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
}

(function loadAppData() {
    // Versiyon kontrolü: Eğer paketler güncellenmişse eskisini silip yeni paketleri yükle
    const PACKAGE_VERSION = "vArapca-1.1";
    if (localStorage.getItem('packageVersion') !== PACKAGE_VERSION) {
        localStorage.removeItem('mockOfflinePackages');
        localStorage.removeItem('mockOnlinePackages');
        localStorage.setItem('packageVersion', PACKAGE_VERSION);
    }

    // Öğretmen verilerini sıfırlama (Sadece Geylani hoca ve Farketmez kalsın diye)
    const TEACHER_VERSION = "vTeacher-1.2";
    if (localStorage.getItem('teacherVersion') !== TEACHER_VERSION) {
        localStorage.removeItem('mockTeachers');
        localStorage.removeItem('mockSchedules');
        localStorage.setItem('teacherVersion', TEACHER_VERSION);
    }

    const savedA = localStorage.getItem('mockTeacherApps');
    if (savedA) appState.teacherApplications = JSON.parse(savedA);
    
    const savedAlarms = localStorage.getItem('mockTeacherAlarms');
    const savedProgress = localStorage.getItem('mockStudentProgress');
    if (savedAlarms) appState.teacherAlarms = JSON.parse(savedAlarms);
    if (savedProgress) appState.studentProgress = JSON.parse(savedProgress);
})();

function saveTeachers() {
    localStorage.setItem('mockTeacherApps', JSON.stringify(appState.teacherApplications));
    localStorage.setItem('mockTeacherAlarms', JSON.stringify(appState.teacherAlarms));
    localStorage.setItem('mockStudentProgress', JSON.stringify(appState.studentProgress));

    if (typeof firebase !== 'undefined' && isFirebaseReady) {
        db.collection('global').doc('appState').set({
            teacherApplications: appState.teacherApplications,
            teacherAlarms: appState.teacherAlarms,
            studentProgress: appState.studentProgress,
            kazanimData: appState.kazanimData
        });
        
    }
}

if (typeof firebase !== 'undefined' && isFirebaseReady) {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            let sessionRole = localStorage.getItem('activeSessionRole') || selectedRole;
            
            db.collection('users').doc(user.email).get().then(doc => {
                const data = doc.exists ? doc.data() : { role: 'student', phone: '' };
                
                // Yetki kontrolleri
                if (sessionRole === 'admin') {
                    if (user.email !== 'gdmrbg7541@gmail.com') {
                        showCustomAlert("Yönetici yetkiniz bulunmamaktadır.");
                        firebase.auth().signOut();
                        return;
                    }
                } else if (sessionRole === 'teacher') {
                    const isTeacher = appState.teachers.some(t => t.email === user.email) || data.role === 'teacher';
                    if (!isTeacher) {
                        showCustomAlert("Öğretmen yetkiniz bulunmamaktadır veya hesabınız henüz onaylanmamıştır.");
                        firebase.auth().signOut();
                        return;
                    }
                }

                selectedRole = sessionRole;
                
                if (selectedRole === 'student') {
                    appState.purchasedPackages = data.purchasedPackages || [];
                    if (!appState.studentProgress["self"]) appState.studentProgress["self"] = {};
                    // Anonymous users have user.email = null, so skip progress tracking
                    if (user.email) appState.studentProgress["self"][user.email] = data.progress || {};
                }

                const fallbackName = user.isAnonymous && appState.currentUserName && appState.currentUserName !== "Misafir Öğrenci" ? appState.currentUserName : (user.displayName || "Öğrenci");
                const finalName = data.name && data.name !== "Belirtilmedi" ? data.name : fallbackName;
                
                basariliGiris(user.email || "anonim", data.phone, finalName);

            }).catch(err => {
                console.error("Firestore okuma hatası:", err);
                const fallbackName = user.isAnonymous && appState.currentUserName && appState.currentUserName !== "Misafir Öğrenci" ? appState.currentUserName : (user.displayName || "Öğrenci");
                basariliGiris(user.email || "anonim", "", fallbackName);
            });
        } else {
            // Firebase girişi yoksa, admin bypass yapılmış olabilir mi kontrol et
            const sessionStr = localStorage.getItem('mockSession');
            if (sessionStr) {
                try {
                    const session = JSON.parse(sessionStr);
                    if (session.role === 'admin' && session.email === 'gdmrbg7541@gmail.com') {
                        selectedRole = 'admin';
                        basariliGiris(session.email, session.phone, session.name);
                        return;
                    }
                } catch(e) {}
            }
            initAppAsGuest();
        }
    });

    // Sayfa yüklendiğinde global verileri Firestore'dan al
    db.collection('global').doc('appState').get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            if (data.teacherApplications) appState.teacherApplications = data.teacherApplications;
            if (data.teacherAlarms) appState.teacherAlarms = data.teacherAlarms;
            if (data.studentProgress) appState.studentProgress = data.studentProgress;
            
            // Re-render UI if dashboard is active since we got new data
            if(appState.currentView === 'dashboard-section') {
                renderPackages();
                renderOnlinePackages();
            } else if (appState.currentView === 'admin-section') {
                if (typeof renderAdminPackageManagement === 'function') {
                    renderAdminPackageManagement();
                }
            }
        }
    }).catch(err => console.log(err));

    

} else {
    // Firebase yokken (simülasyon)
    window.addEventListener('DOMContentLoaded', () => {
        const sessionStr = localStorage.getItem('mockSession');
        if (sessionStr) {
            try {
                const session = JSON.parse(sessionStr);
                selectedRole = session.role || 'student';
                basariliGiris(session.email, session.phone, session.name);
            } catch(e) {
                initAppAsGuest();
            }
        } else {
            initAppAsGuest();
        }
    });
}

function initAppAsGuest() {
    appState.currentUser = "Misafir Öğrenci";
    appState.userRole = "student";
    appState.purchasedPackages = [];
    appState.selectedOfflinePackages = [];
    appState.currentPackageId = null;
    appState.currentKazanim = 1;
    if(appState.studentProgress["self"]) {
        appState.studentProgress["self"][appState.currentUser] = {};
    }
    updateHeaderUI();
    initApp();
}

let isLoginMode = true;
let selectedRole = 'student';

function setRole(role) {
    selectedRole = role;
    document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active-role'));
    const btn = document.getElementById('btn-' + role);
    if(btn) btn.classList.add('active-role');
    
    const switchContainer = document.getElementById('auth-switch-container');
    if (role === 'admin') {
        if (switchContainer) switchContainer.style.display = 'none';
        if (!isLoginMode) moduDegistir(); // Yöneticiler kayıt olamaz
    } else {
        if (switchContainer) switchContainer.style.display = 'block';
    }
    
    updateAuthUI();
}

function moduDegistir() {
    isLoginMode = !isLoginMode;
    updateAuthUI();
}

function updateAuthUI() {
    const isCheckout = appState.currentView === 'checkout-section';
    let titlePrefix = isCheckout ? "Satın Almak İçin " : "Sisteme ";

    document.getElementById('hata-mesaji').innerText = "";

    if (isLoginMode) {
        document.getElementById('auth-title').innerText = titlePrefix + "Giriş Yap";
        document.getElementById('auth-action-btn').innerText = "Giriş Yap";
        document.getElementById('auth-switch-text').innerText = "Hesabınız yok mu?";
        document.getElementById('auth-switch-link').innerText = "Kayıt Ol";
        
        document.getElementById('re-password-group').style.display = "none";
        document.getElementById('phone-group').style.display = "none";
        document.getElementById('student-extra-group').style.display = "none";
        document.getElementById('teacher-cv-group').style.display = "none";
        document.getElementById('teacher-file-group').style.display = "none";
        
        document.querySelector('.modal-content').style.maxWidth = "450px";
        document.querySelector('.modal-content').style.width = "90%";
    } else {
        if (selectedRole === 'teacher') {
            document.getElementById('auth-title').innerText = "Öğretmen Başvurusu Yap";
            document.getElementById('auth-action-btn').innerText = "Talep Oluştur";
            document.getElementById('auth-switch-text').innerText = "Zaten hesabınız var mı?";
            document.getElementById('auth-switch-link').innerText = "Giriş Yap";
            
            document.getElementById('re-password-group').style.display = "flex";
            document.getElementById('phone-group').style.display = "block";
            document.getElementById('student-extra-group').style.display = "none";
            document.getElementById('teacher-cv-group').style.display = "block";
            document.getElementById('teacher-file-group').style.display = "block";
            
            document.querySelector('.modal-content').style.maxWidth = "800px";
            document.querySelector('.modal-content').style.width = "50%";
        } else {
            document.getElementById('auth-title').innerText = titlePrefix + "Kayıt Ol";
            document.getElementById('auth-action-btn').innerText = "Kayıt Ol";
            document.getElementById('auth-switch-text').innerText = "Zaten hesabınız var mı?";
            document.getElementById('auth-switch-link').innerText = "Giriş Yap";
            
            document.getElementById('re-password-group').style.display = "flex";
            document.getElementById('phone-group').style.display = "block";
            document.getElementById('student-extra-group').style.display = "flex";
            document.getElementById('teacher-cv-group').style.display = "none";
            document.getElementById('teacher-file-group').style.display = "none";
            
            document.querySelector('.modal-content').style.maxWidth = "800px";
            document.querySelector('.modal-content').style.width = "50%";
        }
    }
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if(input) {
        input.type = input.type === "password" ? "text" : "password";
    }
}

function authIslemi() {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value;
    const errorEl = document.getElementById('hata-mesaji');
    errorEl.innerText = "";

    if (!email || !pass) {
        errorEl.innerText = "Lütfen tüm alanları doldurun.";
        return;
    }

    // E-posta ve aktif seans rolünü hafızaya kaydet
    localStorage.setItem('savedEmail', email);
    localStorage.setItem('activeSessionRole', selectedRole);

    // Yönetici Kontrolü (Şifre gizlenmiş formatta kontrol ediliyor)
    if (email === "gdmrbg7541@gmail.com" && btoa(pass) === "VlRYMjlTTGg=") {
        if (selectedRole === "admin") {
            basariliGiris(email, "");
            return;
        } else {
            errorEl.innerText = "Yönetici e-postası ile sadece Yönetici sekmesinden giriş yapabilirsiniz.";
            return;
        }
    } else if (selectedRole === "admin") {
        errorEl.innerText = "Yönetici girişi başarısız. Yetkiniz bulunmuyor veya şifreniz hatalı.";
        return;
    }

    if (!isFirebaseReady) {
        let users = JSON.parse(localStorage.getItem('mockUsers') || '{}');
        
        if (!isLoginMode) {
            const pass2 = document.getElementById('re-password').value;
            const phone = document.getElementById('phone').value.trim();
            if (pass !== pass2) { errorEl.innerText = "Şifreler uyuşmuyor."; return; }
            if (!phone.match(/^5[0-9]{9}$/)) { errorEl.innerText = "Lütfen 5 ile başlayan 10 haneli bir telefon numarası girin."; return; }
            if (users[email] && selectedRole !== 'teacher') { errorEl.innerText = "Bu e-posta zaten kayıtlı."; return; }
            
            if (selectedRole === 'teacher') {
                const cv = document.getElementById('teacher-cv').value.trim();
                const fileInput = document.getElementById('teacher-file');
                if (!cv || fileInput.files.length === 0) {
                    errorEl.innerText = "Lütfen CV ve belge yükleme alanlarını doldurun.";
                    return;
                }
                const fileName = fileInput.files[0].name;
                
                // Add to teacher applications
                appState.teacherApplications = appState.teacherApplications || [];
                appState.teacherApplications.push({
                    id: 'app_' + Date.now(),
                    email: email,
                    password: pass,
                    phone: "+90" + phone,
                    cv: cv,
                    documentName: fileName,
                    status: "pending",
                    date: new Date().toISOString()
                });
                saveTeachers();
                
                showCustomAlert("Öğretmen başvurunuz başarıyla alındı! CV'niz ve belgeniz incelendikten sonra size dönüş yapılacaktır.");
                closeLoginModal();
                return;
            } else if (selectedRole === 'student') {
                const sName = document.getElementById('student-name').value.trim();
                const sProf = document.getElementById('student-profession').value.trim();
                
                users[email] = { 
                    password: pass, 
                    phone: "+90" + phone, 
                    role: selectedRole,
                    name: sName || "Belirtilmedi",
                    profession: sProf || "Belirtilmedi"
                };
                localStorage.setItem('mockUsers', JSON.stringify(users));
                showCustomAlert("Kayıt başarılı! Lütfen giriş yapın.");
                isLoginMode = true;
                updateAuthUI();
                return;
            }
        } else {
            if (selectedRole === 'teacher') {
                const teacher = appState.teachers.find(t => t.email === email && t.password === pass);
                if (!teacher) {
                    errorEl.innerText = "Yetkisiz giriş veya hatalı şifre. Kaydınız yönetici tarafından henüz onaylanmamış olabilir.";
                    return;
                }
                basariliGiris(teacher.email, teacher.phone || "", teacher.name || "");
                return;
            } else {
                if (!users[email] || users[email].password !== pass) {
                    errorEl.innerText = "Kullanıcı bulunamadı veya şifre hatalı. Lütfen önce kayıt olun."; 
                    return;
                }
                basariliGiris(email, users[email] ? users[email].phone : "", users[email] ? users[email].name : "");
                return;
            }
        }
        return;
    }

    if (isLoginMode) {
        firebase.auth().signInWithEmailAndPassword(email, pass)
        .then((userCredential) => { 
            // onAuthStateChanged verileri Firestore'dan çekecek
        })
        .catch((error) => { errorEl.innerText = "Giriş başarısız: " + error.message; });
    } else {
        const pass2 = document.getElementById('re-password').value;
        const phone = document.getElementById('phone').value.trim();
        const sName = document.getElementById('student-name').value.trim();
        const sProf = document.getElementById('student-profession').value.trim();

        if (pass !== pass2) { errorEl.innerText = "Şifreler uyuşmuyor."; return; }
        
        firebase.auth().createUserWithEmailAndPassword(email, pass)
        .then((userCredential) => { 
            // Firestore'a kaydet
            db.collection('users').doc(email).set({
                role: selectedRole,
                name: sName || "Belirtilmedi",
                profession: sProf || "Belirtilmedi",
                phone: "+90" + phone,
                purchasedPackages: [],
                progress: {}
            }).then(() => {
                showCustomAlert("Kayıt başarılı!");
                // onAuthStateChanged gerisini halleder
            });
        })
        .catch((error) => { errorEl.innerText = "Kayıt başarısız: " + error.message; });
    }
}


function basariliGiris(userEmail, userPhone = "", userName = "") {
    appState.currentUser = userEmail;
    appState.currentUserPhone = userPhone;
    appState.currentUserName = userName;
    appState.userRole = selectedRole;
    
    if (!isFirebaseReady || selectedRole === 'admin') {
        localStorage.setItem('mockSession', JSON.stringify({ email: userEmail, phone: userPhone, name: userName, role: selectedRole }));
    }

    if (!isFirebaseReady) {
        // Eğer öğrenci giriş yapıyorsa (Firebase yokken) verilerini yükle
        if (selectedRole === 'student') {
            let users = JSON.parse(localStorage.getItem('mockUsers') || '{}');
            if (users[userEmail]) {
                appState.purchasedPackages = users[userEmail].purchasedPackages || [];
                if (!appState.studentProgress["self"]) appState.studentProgress["self"] = {};
                appState.studentProgress["self"][userEmail] = users[userEmail].progress || {};
            }
        }
    }

    // YÖNETİCİ MODU (FIREBASE OLSUN VEYA OLMASIN): Tüm paketlere test amaçlı erişim sağla
    if (selectedRole === 'admin') {
        appState.purchasedPackages = [
            ...appState.packages.map(p => p.id),
            ...appState.onlinePackages.map(p => p.id)
        ];
        if (!appState.studentProgress["self"]) appState.studentProgress["self"] = {};
        appState.studentProgress["self"][userEmail] = {};
    }
    
    // Modal varsa kapat
    const modal = document.getElementById('login-modal');
    if(modal) modal.style.display = 'none';

    updateHeaderUI();

    // Eğer Checkout sayfasındaysa Checkout görünümünü güncelle
    if (appState.currentView === 'checkout-section') {
        renderCheckoutAuthView();
    } else {
        initApp();
    }
}

function cikisYap() {
    localStorage.removeItem('mockSession');
    if (isFirebaseReady) {
        firebase.auth().signOut().then(() => {
            initAppAsGuest();
        }).catch((error) => { console.error("Çıkış hatası:", error); });
    } else {
        initAppAsGuest();
    }
}

function updateHeaderUI() {
    const isGuest = appState.currentUser === "Misafir Öğrenci";
    let roleText = isGuest ? "" : (appState.userRole === 'admin' ? 'Yönetici: ' : (appState.userRole === 'teacher' ? 'Öğretmen: ' : 'Öğrenci: '));
    const userInfoEl = document.getElementById('user-info');
    
    if (isGuest) {
        userInfoEl.style.display = 'none';
        userInfoEl.innerText = '';
    } else {
        const icon = (appState.userRole === 'student' || appState.userRole === 'admin') ? '<i class="fas fa-user-circle"></i> ' : '';
        const dropdownIcon = (appState.userRole === 'student' || appState.userRole === 'admin') ? ' <i class="fas fa-chevron-down" style="font-size: 0.8em; margin-left: 5px;"></i>' : '';
        userInfoEl.style.display = 'flex';
        userInfoEl.innerHTML = icon + roleText + appState.currentUser + dropdownIcon;
    }
    
    document.getElementById('logout-btn').style.display = isGuest ? 'none' : 'inline-block';
    
    // Eğer Header'da giriş butonu koymak isterseniz
    const headerLoginBtn = document.getElementById('header-login-btn');
    if(headerLoginBtn) headerLoginBtn.style.display = isGuest ? 'inline-block' : 'none';

    // Öğrenci profili butonu
    const profileBtn = document.getElementById('nav-student-profile');
    if (profileBtn) {
        profileBtn.style.display = (!isGuest && (appState.userRole === 'student' || appState.userRole === 'admin')) ? 'inline-block' : 'none';
    }

    // Aktif ders kontrolünü tetikle
    checkActiveLessonStatus();
}

function checkActiveLessonStatus() {
    const interactiveSection = document.getElementById('interactive-class-section');
    if (!interactiveSection) return;

    if (appState.currentUser === "Misafir Öğrenci") {
        interactiveSection.style.display = 'none';
        return;
    }

    if (appState.userRole === 'admin' || appState.userRole === 'teacher') {
        interactiveSection.style.display = 'block';
        const infoEl = document.getElementById('interactive-class-info');
        if(infoEl) infoEl.innerText = "Yönetici / Öğretmen Modu - Ders Ekranı her zaman açık.";
        return;
    }

    const now = new Date();
    const currentTotalM = now.getHours() * 60 + now.getMinutes();
    const dayMap = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
    const currentDayStr = dayMap[now.getDay()];

    let hasActiveLesson = false;
    let upcomingTimeStr = "";
    
    const studentLessons = appState.approvedLessons.filter(l => l.studentEmail === appState.currentUser);
    
    for (let lesson of studentLessons) {
        for (let slot of lesson.slots) {
            const parts = slot.split(' ');
            if (parts.length < 2) continue;
            
            const slotDay = parts[0];
            const slotTime = parts[1];
            
            if (slotDay !== currentDayStr) continue;

            const startH = parseInt(slotTime.split(':')[0]);
            const startM = parseInt(slotTime.split(':')[1]);
            const startTotalM = startH * 60 + startM;
            const endTotalM = startTotalM + 40;
            
            if (currentTotalM >= startTotalM - 5 && currentTotalM <= endTotalM) {
                hasActiveLesson = true;
                upcomingTimeStr = slotTime;
                break;
            }
        }
        if (hasActiveLesson) break;
    }

    if (hasActiveLesson) {
        interactiveSection.style.display = 'block';
        const infoEl = document.getElementById('interactive-class-info');
        if(infoEl) infoEl.innerText = `Bugün saat ${upcomingTimeStr} dersiniz için sınıf aktiftir. Derse katılabilirsiniz!`;
    } else {
        interactiveSection.style.display = 'none';
        // Ekran açıksa da kapat
        const videoCont = document.getElementById('lesson-video-container');
        const joinCont = document.getElementById('join-lesson-container');
        if(videoCont) videoCont.style.display = 'none';
        if(joinCont) joinCont.style.display = 'block';
    }
}

// Her 30 saniyede bir ders durumunu kontrol et
setInterval(checkActiveLessonStatus, 30000);

function showLoginModal() {
    const modal = document.getElementById('login-modal');
    if(modal) {
        // Formu temizle ve autofill
        prefillEmail();
        document.getElementById('password').value = "";
        const rep = document.getElementById('re-password');
        if(rep) rep.value = "";
        document.getElementById('hata-mesaji').innerText = "";
        modal.style.display = 'flex';
    }
}

function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if(modal) modal.style.display = 'none';
}

function prefillEmail() {
    const saved = localStorage.getItem('savedEmail');
    if(saved) {
        document.getElementById('email').value = saved;
    }
}

