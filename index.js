/* ==========================================
   1. GÜVENLİK VE CAYDIRICI ÖNLEMLER
   ========================================== */
(function initSecurity() {
    document.addEventListener('contextmenu', event => event.preventDefault());
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12') e.preventDefault();
        if (e.ctrlKey && e.shiftKey && e.key === 'I') e.preventDefault();
        if (e.ctrlKey && e.shiftKey && e.key === 'J') e.preventDefault();
        if (e.ctrlKey && e.key === 'u') e.preventDefault();
    });
})();

/* ==========================================
   2. UYGULAMA DURUMU (STATE) VE HAFIZA SİSTEMİ
   ========================================== */
let appState = {
    currentUser: "Misafir Öğrenci",
    currentUserPhone: "",
    userRole: "guest",
    currentView: "dashboard",
    viewHistory: ["dashboard"],
    purchasedPackages: [],
    selectedPackageForPayment: null,
    currentPackageId: null,
    currentKazanim: 1,
    totalKazanimCount: 40,
    wrongAnswerPool: [], 
    localStream: null,
    selectedOnlinePackages: [],
    selectedOfflinePackages: [],
    selectedSlots: [],
    
    // Yeni Eklenenler (Randevu Takibi ve Öğretmen Araçları)
    pendingLessons: [],
    approvedLessons: [],
    teacherAlarms: {},
    studentProgress: {},
    
    teachers: [
        { id: "hoca1", name: "Eğitmen Geylani", phone: "+905386482614", email: "hoca1@mail.com", password: "123" }
    ],

    packages: [
        {
            id: 1,
            title: "Elif-Bâ ve Temel Okuma (A1 Başlangıç)", 
            description: "Harflerin mahreçleri, bitişik yazım kuralları ve temel seviye okuma pratikleri.", 
            duration: "10 Saat",
            price: "450 ₺",
            requirements: ["Arapçaya sıfırdan başlayanlar içindir."],
            target: "Öğrencinin yavaş okuma problemini ortadan kaldırmak ve Kur'an veya basit metin okumaya akıcı bir giriş yapmasını sağlamak."
        },
        {
            id: 2,
            title: "Temel Sarf ve Nahiv (A2 Giriş)", 
            description: "İsim ve Fiil cümleleri, kelime çekim mantığı ve kural dışı fiiller.",
            duration: "20 Saat",
            price: "750 ₺",
            requirements: ["Harfleri ve harekeleri akıcı okuyabilmek"],
            target: "Cümle kurulumundaki temel mantığı kavramak ve fiil çekimlerindeki ezber zorluğunu algoritmik bir yöntemle çözmek."
        },
        {
            id: 3,
            title: "Kapsamlı Cümle Analizi (B1 Orta)", 
            description: "Harekesiz metinleri doğru okuyabilmek için uygulamalı dilbilgisi ve İrab.",
            duration: "30 Saat",
            price: "1150 ₺",
            requirements: ["A2 seviyesi gramer ve kelime bilgisi"],
            target: "Cümle içindeki ögelerin (fail, meful, muzafun ileyh vb.) harekesini doğru tahmin edememe ve irabını yapamama sorununu gidermek."
        },
        {
            id: 4,
            title: "Haber ve Modern Metin Çevirisi (B2 İleri Orta)", 
            description: "Modern standart Arapça (Fusha) ile güncel medya ve haber metinleri çevirisi.",
            duration: "40 Saat",
            price: "1600 ₺",
            requirements: ["B1 seviyesi metinleri rahat okuyabilmek", "Sözlük kullanım becerisi"],
            target: "Güncel, siyasi ve sosyal metinlerdeki kalıp ifadeleri tanımak ve Türkçeye anadil doğallığında çevirebilme yeteneği kazanmak."
        },
        {
            id: 5,
            title: "Klasik ve Akademik Metinler (C1 İleri)", 
            description: "YDS/YÖKDİL sınavlarına hazırlık ve klasik eserlerde (Tefsir, Hadis vb.) anlam çözümleri.",
            duration: "50 Saat",
            price: "2200 ₺",
            requirements: ["İleri seviye nahiv bilgisi", "Geniş kelime dağarcığı"],
            target: "Akademik sınavlardaki ve edebi/klasik metinlerdeki karmaşık, uzun ve iç içe geçmiş cümle yapılarını kolayca analiz edebilmek."
        },
        {
            id: 6,
            title: "Belağat ve İfade Sanatı (C2 Uzman)", 
            description: "Arapçanın edebi derinliği; Meâni, Beyân ve Bedi ilimlerine giriş.",
            duration: "45 Saat",
            price: "2500 ₺",
            requirements: ["C1 seviyesi yetkinliği", "Arapça ile tam bir hakimiyet"],
            target: "Metinlerdeki mecazları, teşbihleri ve edebi sanatları fark ederek edebi ve Kur'ani metinlerin asıl ruhunu kavrayabilmek."
        }
    ],

    onlinePackages: [
        { id: 101, name: "A1-A2 Pratik Konuşma (Muhadese)", price: 1500, desc: "Cümle kurarken duraksamaları ve özgüven eksikliğini gidermek için yoğun günlük diyalog pratiği.", hours: "10 Saat / Ay", material: "PDF Diyaloglar & Ses Kayıtları" },
        { id: 102, name: "B1-B2 Aktif Kelime Hafızası", price: 1800, desc: "Öğrenilen fakat konuşma anında hatırlanamayan kelime ve fiilleri zihinde aktif hale getirme çalışmaları.", hours: "12 Saat / Ay", material: "Kelime Kartları & Anlık Çeviri Testleri" },
        { id: 103, name: "YDS/YÖKDİL Taktikleri", price: 2500, desc: "Sınavda zaman kaybettiren paragraf soruları ve boşluk doldurma mantığı üzerine birebir eğitmen analizi.", hours: "16 Saat / Ay", material: "Çıkmış Sorular & Özel Taktik Notları" },
        { id: 104, name: "C1-C2 İleri Seviye Konuşma Kulübü", price: 3000, desc: "Tamamen Arapça yürütülen, siyaset, edebiyat ve güncel meselelerin tartışıldığı ileri düzey oturumlar.", hours: "20 Saat / Ay", material: "Makaleler & Medya Analizleri" }
    ]
};

let teacherSchedules = {
    "hoca1": [
        { name: "Salı - Perşembe - Cumartesi Programı", slots: null, data: { "10:50 - 11:30": "dolu", "13:50 - 14:30": "dolu" }, startH: 10, endH: 16 },
        { name: "Cuma Programı", slots: null, data: { "14:40 - 15:20": "dolu", "18:50 - 19:30": "dolu" }, startH: 13, endH: 20 }
    ]
};


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
    const PACKAGE_VERSION = "vArapca-1.0";
    if (localStorage.getItem('packageVersion') !== PACKAGE_VERSION) {
        localStorage.removeItem('mockOfflinePackages');
        localStorage.removeItem('mockOnlinePackages');
        localStorage.setItem('packageVersion', PACKAGE_VERSION);
    }

    // Öğretmen verilerini sıfırlama (Sadece Geylani hoca ve Farketmez kalsın diye)
    const TEACHER_VERSION = "vTeacher-1.1";
    if (localStorage.getItem('teacherVersion') !== TEACHER_VERSION) {
        localStorage.removeItem('mockTeachers');
        localStorage.removeItem('mockSchedules');
        localStorage.setItem('teacherVersion', TEACHER_VERSION);
    }

    const savedT = localStorage.getItem('mockTeachers');
    const savedS = localStorage.getItem('mockSchedules');
    const savedA = localStorage.getItem('mockTeacherApps');
    const savedOffline = localStorage.getItem('mockOfflinePackages');
    const savedOnline = localStorage.getItem('mockOnlinePackages');
    
    if (savedT) appState.teachers = JSON.parse(savedT);
    if (savedS) teacherSchedules = JSON.parse(savedS);
    if (savedA) appState.teacherApplications = JSON.parse(savedA);
    if (savedOffline) appState.packages = JSON.parse(savedOffline);
    if (savedOnline) appState.onlinePackages = JSON.parse(savedOnline);
    
    const savedAlarms = localStorage.getItem('mockTeacherAlarms');
    const savedProgress = localStorage.getItem('mockStudentProgress');
    if (savedAlarms) appState.teacherAlarms = JSON.parse(savedAlarms);
    if (savedProgress) appState.studentProgress = JSON.parse(savedProgress);
})();

function saveTeachers() {
    localStorage.setItem('mockTeachers', JSON.stringify(appState.teachers));
    localStorage.setItem('mockSchedules', JSON.stringify(teacherSchedules));
    localStorage.setItem('mockTeacherApps', JSON.stringify(appState.teacherApplications));
    localStorage.setItem('mockOfflinePackages', JSON.stringify(appState.packages));
    localStorage.setItem('mockOnlinePackages', JSON.stringify(appState.onlinePackages));
    localStorage.setItem('mockTeacherAlarms', JSON.stringify(appState.teacherAlarms));
    localStorage.setItem('mockStudentProgress', JSON.stringify(appState.studentProgress));

    if (typeof firebase !== 'undefined' && isFirebaseReady) {
        db.collection('global').doc('appState').set({
            teachers: appState.teachers,
            teacherApplications: appState.teacherApplications,
            teacherAlarms: appState.teacherAlarms,
            studentProgress: appState.studentProgress,
            packages: appState.packages,
            onlinePackages: appState.onlinePackages
        });
        db.collection('global').doc('teacherSchedules').set({
            schedules: teacherSchedules
        });
    }
}

if (typeof firebase !== 'undefined' && isFirebaseReady) {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // Firestore'dan kullanıcı verisini çek
            db.collection('users').doc(user.email).get().then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    selectedRole = data.role || 'student';
                    
                    if (selectedRole === 'student') {
                        appState.purchasedPackages = data.purchasedPackages || [];
                        if (!appState.studentProgress["self"]) appState.studentProgress["self"] = {};
                        appState.studentProgress["self"][user.email] = data.progress || {};
                    }

                    basariliGiris(user.email, data.phone);
                } else {
                    // Belki admin'dir
                    if (user.email === 'gdmrbg7541@gmail.com') {
                        selectedRole = 'admin';
                        basariliGiris(user.email, "");
                    } else {
                        basariliGiris(user.email, "");
                    }
                }
            }).catch(err => {
                console.error("Firestore okuma hatası:", err);
                basariliGiris(user.email, "");
            });
        } else {
            initAppAsGuest();
        }
    });

    // Sayfa yüklendiğinde global verileri Firestore'dan al
    db.collection('global').doc('appState').get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            if (data.teachers) appState.teachers = data.teachers;
            if (data.teacherApplications) appState.teacherApplications = data.teacherApplications;
            if (data.teacherAlarms) appState.teacherAlarms = data.teacherAlarms;
            if (data.studentProgress) appState.studentProgress = data.studentProgress;
            // Diğer veriler
        }
    }).catch(err => console.log(err));

    db.collection('global').doc('teacherSchedules').get().then(doc => {
        if (doc.exists) teacherSchedules = doc.data().schedules || {};
    });

} else {
    // Firebase yokken (simülasyon)
    window.addEventListener('DOMContentLoaded', () => {
        const sessionStr = localStorage.getItem('mockSession');
        if (sessionStr) {
            try {
                const session = JSON.parse(sessionStr);
                selectedRole = session.role || 'student';
                basariliGiris(session.email, session.phone);
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

    // E-posta hafızaya kaydet
    localStorage.setItem('savedEmail', email);

    // Yönetici Firebase Auth ile girecek, eğer Firebase yoksa ve rol admin ise
    if (!isFirebaseReady && selectedRole === "admin") {
        errorEl.innerText = "Yönetici girişi için veritabanı (Firebase) bağlantısı gereklidir.";
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
                
                alert("Öğretmen başvurunuz başarıyla alındı! CV'niz ve belgeniz incelendikten sonra size dönüş yapılacaktır.");
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
                alert("Kayıt başarılı! Lütfen giriş yapın.");
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
                // HATA DÜZELTMESİ: currentUser olarak name değil email kaydedilmeli
                basariliGiris(teacher.email, teacher.phone || "");
                return;
            } else {
                if (!users[email] || users[email].password !== pass) {
                    errorEl.innerText = "Kullanıcı bulunamadı veya şifre hatalı. Lütfen önce kayıt olun."; 
                    return;
                }
            }
        }
        basariliGiris(email, users[email] ? users[email].phone : "");
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
                alert("Kayıt başarılı!");
                // onAuthStateChanged gerisini halleder
            });
        })
        .catch((error) => { errorEl.innerText = "Kayıt başarısız: " + error.message; });
    }
}

function basariliGiris(userEmail, userPhone = "") {
    appState.currentUser = userEmail;
    appState.currentUserPhone = userPhone;
    appState.userRole = selectedRole;
    
    if (!isFirebaseReady) {
        localStorage.setItem('mockSession', JSON.stringify({ email: userEmail, phone: userPhone, role: selectedRole }));
        
        // Eğer öğrenci giriş yapıyorsa verilerini yükle
        if (selectedRole === 'student') {
            let users = JSON.parse(localStorage.getItem('mockUsers') || '{}');
            if (users[userEmail]) {
                appState.purchasedPackages = users[userEmail].purchasedPackages || [];
                if (!appState.studentProgress["self"]) appState.studentProgress["self"] = {};
                appState.studentProgress["self"][userEmail] = users[userEmail].progress || {};
            }
        }
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
    if (isFirebaseReady) {
        firebase.auth().signOut().then(() => {
            initAppAsGuest();
        }).catch((error) => { console.error("Çıkış hatası:", error); });
    } else {
        localStorage.removeItem('mockSession');
        initAppAsGuest();
    }
}

function updateHeaderUI() {
    const isGuest = appState.currentUser === "Misafir Öğrenci";
    let roleText = isGuest ? "" : (appState.userRole === 'admin' ? 'Yönetici: ' : (appState.userRole === 'teacher' ? 'Öğretmen: ' : 'Öğrenci: '));
    
    document.getElementById('user-info').innerText = roleText + appState.currentUser;
    document.getElementById('logout-btn').style.display = isGuest ? 'none' : 'inline-block';
    
    // Eğer Header'da giriş butonu koymak isterseniz
    const headerLoginBtn = document.getElementById('header-login-btn');
    if(headerLoginBtn) headerLoginBtn.style.display = isGuest ? 'inline-block' : 'none';

    // Öğrenci profili butonu
    const profileBtn = document.getElementById('nav-student-profile');
    if (profileBtn) {
        profileBtn.style.display = (!isGuest && appState.userRole === 'student') ? 'inline-block' : 'none';
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

/* ==========================================
   4. BAŞLANGIÇ VE NAVİGASYON (ROUTING)
   ========================================== */
function initApp() {
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
    const sections = ['dashboard-section', 'offline-section', 'online-section', 'checkout-section', 'admin-section', 'teacher-section', 'student-profile-section'];
    sections.forEach(sec => {
        let el = document.getElementById(sec);
        if(el) el.style.display = 'none';
    });

    if(document.getElementById('package-list-area')) document.getElementById('package-list-area').style.display = 'none';
    if(document.getElementById('active-package-area')) document.getElementById('active-package-area').style.display = 'none';

    if (viewName === 'dashboard-section') {
        document.getElementById('dashboard-section').style.display = 'block';
    } else if (viewName === 'student-profile-section') {
        document.getElementById('student-profile-section').style.display = 'block';
        renderStudentProfile();
    } else if (viewName === 'offline-list') {
        document.getElementById('offline-section').style.display = 'block';
        document.getElementById('package-list-area').style.display = 'grid';
    } else if (viewName === 'active-package') {
        document.getElementById('offline-section').style.display = 'block';
        document.getElementById('active-package-area').style.display = 'block';
    } else if (viewName === 'online-section') {
        document.getElementById('online-section').style.display = 'block';
        
        // Online bölüme girince akordiyonları sıfırla
        const step1 = document.getElementById('online-step-1');
        const step2 = document.getElementById('online-step-2');
        const step3 = document.getElementById('online-step-3');
        if (step1) {
            step1.style.maxHeight = "1000px";
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
    const logoText = document.getElementById('header-logo-text');
    const isMainPage = (viewName === 'dashboard-section' || viewName === 'admin-section' || viewName === 'teacher-section');
    
    if (backBtn) backBtn.style.display = isMainPage ? 'none' : 'block';
    if (homeBtn) homeBtn.style.display = isMainPage ? 'block' : 'none';
    if (logoText) logoText.style.display = isMainPage ? 'block' : 'none';

    if (!isBackAction) {
        if (appState.viewHistory[appState.viewHistory.length - 1] !== viewName) {
            appState.viewHistory.push(viewName);
        }
    }
}

function goBack() {
    if(appState.userRole === 'admin' || appState.userRole === 'teacher') return;

    if (appState.viewHistory.length <= 1 || appState.currentView === 'dashboard-section') {
        window.location.href = 'https://kidefarapca.com';
        return;
    }
    
    appState.viewHistory.pop();
    const previousView = appState.viewHistory[appState.viewHistory.length - 1] || 'dashboard-section';
    changeView(previousView, true);
}

function toggleStudentProfile() {
    if (appState.currentView === 'student-profile-section') {
        changeView('dashboard-section');
    } else {
        changeView('student-profile-section');
    }
}

function renderStudentProfile() {
    const profileSection = document.getElementById('student-profile-section');
    if (!profileSection) return;

    let users = JSON.parse(localStorage.getItem('mockUsers') || '{}');
    let user = users[appState.currentUser] || {};
    
    let html = `
        <div class="glass-card" style="margin-bottom: 20px;">
            <h2 style="color: #20C997; margin-bottom: 10px;">Öğrenci Profili</h2>
            <p><strong>Ad Soyad:</strong> ${user.name || 'Belirtilmedi'}</p>
            <p><strong>E-posta:</strong> ${appState.currentUser}</p>
            <p><strong>Telefon:</strong> ${appState.currentUserPhone}</p>
            <p><strong>Meslek:</strong> ${user.profession || 'Belirtilmedi'}</p>
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
            const progressPercent = Math.round((savedStep / appState.totalKazanimCount) * 100);

            html += `
                <div class="package-card" style="border: 2px solid #20C997; cursor:pointer; flex-direction: column; align-items: stretch;" onclick="startPackage(${pkg.id}, '${pkg.title.replace(/'/g, "\\'")}')">
                    <h3 style="margin-top:0;">${pkg.title}</h3>
                    
                    <div style="margin-top: 15px;">
                        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:5px;">
                            <span>İlerleme: %${progressPercent}</span>
                            <span>Adım: ${savedStep} / ${appState.totalKazanimCount}</span>
                        </div>
                        <div style="width: 100%; background: #e9ecef; border-radius: 4px; height: 8px; overflow: hidden;">
                            <div style="width: ${progressPercent}%; height: 100%; background: #20C997;"></div>
                        </div>
                    </div>
                    <button class="btn btn-success" style="width: 100%; margin-top: 15px;">Derse Devam Et</button>
                </div>
            `;
        });
    }

    html += `</div>`;
    profileSection.innerHTML = html;
}

/* ==========================================
   5. DİNAMİK PAKETLER (OFFLINE)
   ========================================== */
function renderPackages() {
    const packageListArea = document.getElementById('package-list-area');
    if(!packageListArea) return;
    packageListArea.innerHTML = ''; 

    appState.packages.forEach(pkg => {
        const isPurchased = appState.purchasedPackages.includes(pkg.id);
        const isSelected = appState.selectedOfflinePackages.includes(pkg.id);

        const card = document.createElement('div');
        card.className = `glass-card package-card ${isSelected ? 'selected' : ''}`;
        
        if (isPurchased) {
            card.onclick = () => startPackage(pkg.id, pkg.title); 
        } else {
            card.onclick = () => selectOfflinePackage(pkg.id, card);
        }
        
        const statusBadge = isPurchased 
            ? `<span class="badge badge-success">✓ Sahipsiniz</span>`
            : `<span class="badge badge-price">${pkg.price}</span>`;

        let requirementsHtml = '';
        if (pkg.requirements && pkg.requirements.length > 0) {
            const listItems = pkg.requirements.map(req => `<li>${req}</li>`).join('');
            requirementsHtml = `
                <div class="pkg-requirements">
                    <strong>Gereklilikler:</strong>
                    <ul>${listItems}</ul>
                </div>
            `;
        }

        let targetHtml = '';
        if (pkg.target) {
            targetHtml = `
                <div class="pkg-target">
                    <strong>Hedef Kazanım:</strong>
                    <p>${pkg.target}</p>
                </div>
            `;
        }
        
        const checkIcon = isSelected ? `<div style="position:absolute; top:20px; left:20px; color:#20C997; font-size:1.5rem;"><i class="fa fa-check-circle"></i></div>` : '';
        const paddingLeft = isSelected ? 'padding-left: 40px;' : '';

        card.innerHTML = `
            ${checkIcon}
            <div style="flex: 2; min-width: 200px; ${paddingLeft}">
                <div class="pkg-header" style="flex-direction: column; align-items: flex-start; gap: 5px;">
                    <h4 style="margin: 0;">${pkg.title}</h4>
                    ${statusBadge}
                </div>
                <div class="pkg-duration" style="margin-top: 5px;">⏱ ${pkg.duration}</div>
                <div class="pkg-desc" style="margin-bottom: 0;">${pkg.description}</div>
            </div>
            
            <div style="flex: 2; min-width: 200px;">
                ${requirementsHtml}
                ${targetHtml}
            </div>
            
            <div style="flex: 1; min-width: 150px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;">
                <div style="font-weight: 700; color: #F39C12; font-size: 1.3rem; background: rgba(255,255,255,0.8); padding: 5px 15px; border-radius: 10px;">${pkg.price}</div>
                ${isPurchased ? '<button class="btn btn-primary" style="width: 100%;">Eğitime Başla</button>' : '<button class="btn btn-secondary" style="width: 100%;">Seç / Kaldır</button>'}
            </div>
        `;
        packageListArea.appendChild(card);
    });
}

function selectOfflinePackage(id, el) {
    if (appState.purchasedPackages.includes(id)) return;
    
    const index = appState.selectedOfflinePackages.indexOf(id);
    if (index > -1) {
        appState.selectedOfflinePackages.splice(index, 1);
        el.classList.remove('selected');
    } else {
        appState.selectedOfflinePackages.push(id);
        el.classList.add('selected');
    }
    
    updateOfflineSummary();
    renderPackages();
}

function updateOfflineSummary() {
    const summaryDiv = document.getElementById('offline-checkout-summary');
    const totalText = document.getElementById('offline-total-text');
    if (!summaryDiv || !totalText) return;
    
    if (appState.selectedOfflinePackages.length > 0) {
        let total = 0;
        appState.selectedOfflinePackages.forEach(pid => {
            const pkg = appState.packages.find(p => p.id === pid);
            if (pkg) {
                let priceNum = parseInt(pkg.price.replace(/[^0-9]/g, ''));
                total += priceNum;
            }
        });
        totalText.innerText = `Toplam: ${total.toLocaleString('tr-TR')} ₺`;
        summaryDiv.style.display = 'flex';
    } else {
        summaryDiv.style.display = 'none';
    }
}

function bookOfflinePackages() {
    if (appState.selectedOfflinePackages.length === 0) return;
    openCheckoutFlow('offline_multiple', null);
}

function startPackage(packageId, packageName) {
    if (appState.purchasedPackages.includes(packageId)) {
        appState.currentPackageId = packageId;
        
        // Kaydedilmiş ilerlemeyi yükle
        const progressObj = appState.studentProgress["self"] && appState.studentProgress["self"][appState.currentUser] ? appState.studentProgress["self"][appState.currentUser] : {};
        appState.currentKazanim = progressObj[packageId] || 1;
        
        document.getElementById('current-package-title').innerText = packageName;
        renderKazanimTimeline();
        loadKazanimData();
        changeView('active-package');
    } else {
        openCheckoutFlow('offline', packageId);
    }
}

/* ==========================================
   6. CANLI DERS RANDEVU (ONLINE)
   ========================================== */
function renderOnlinePackages() {
    const listEl = document.getElementById('online-package-list');
    if(!listEl) return;
    listEl.innerHTML = appState.onlinePackages.map(p => {
        const isSelected = appState.selectedOnlinePackages.find(x => x.id === p.id);
        return `
        <div class="glass-card online-package-card ${isSelected ? 'selected' : ''}" onclick="selectOnlinePackage(${p.id}, this)" style="display:flex; align-items:center;">
            <div style="margin-right: 15px; font-size: 1.5rem; color: #4facfe;">
                <i class="far ${isSelected ? 'fa-check-circle' : 'fa-circle'}" id="pkg-icon-${p.id}"></i>
            </div>
            <div class="online-package-info" style="flex:1;">
                <h4>${p.name}</h4>
                <p>${p.desc}</p>
                <div style="display:flex; gap: 15px; margin-top: 10px; font-size: 0.85rem; color: #555;">
                    <span style="display:flex; align-items:center;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F39C12" stroke-width="2" style="margin-right:5px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        ${p.hours}
                    </span>
                    <span style="display:flex; align-items:center;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4facfe" stroke-width="2" style="margin-right:5px;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                        ${p.material}
                    </span>
                </div>
            </div>
            <div class="online-package-price">${p.price.toLocaleString('tr-TR')} ₺</div>
        </div>`
    }).join('');
}

function selectOnlinePackage(id, el) {
    const pkg = appState.onlinePackages.find(x => x.id === id);
    if (!pkg) return;
    
    const index = appState.selectedOnlinePackages.findIndex(x => x.id === id);
    const iconEl = document.getElementById(`pkg-icon-${id}`);
    if (index > -1) {
        // Eğer zaten seçiliyse çıkar
        appState.selectedOnlinePackages.splice(index, 1);
        el.classList.remove('selected');
        if(iconEl) {
            iconEl.classList.remove('fa-check-circle');
            iconEl.classList.add('fa-circle');
        }
    } else {
        // Seçili değilse ekle
        appState.selectedOnlinePackages.push(pkg);
        el.classList.add('selected');
        if(iconEl) {
            iconEl.classList.remove('fa-circle');
            iconEl.classList.add('fa-check-circle');
        }
    }
    updateSummary();
    
    // Canlı Toplam Fiyat Güncellemesi
    const liveTotalEl = document.getElementById('step1-live-total');
    if (liveTotalEl) {
        const total = appState.selectedOnlinePackages.reduce((sum, p) => sum + p.price, 0);
        liveTotalEl.innerHTML = `Ara Toplam: ${total.toLocaleString('tr-TR')} ₺`;
    }
}

function checkOnlineStep1() {
    if (appState.selectedOnlinePackages.length > 0) {
        const step1 = document.getElementById('online-step-1');
        const step2 = document.getElementById('online-step-2');
        if (step1 && step2) {
            step1.style.maxHeight = "70px"; // Sadece başlık kalsın
            step1.style.opacity = "0.8";

            const headerTotal = document.getElementById('step1-header-total');
            if(headerTotal) {
                const total = appState.selectedOnlinePackages.reduce((sum, p) => sum + p.price, 0);
                headerTotal.innerHTML = `(Toplam: ${total.toLocaleString('tr-TR')} ₺)`;
                headerTotal.style.display = 'inline-block';
            }

            step2.style.opacity = "1";
            step2.style.pointerEvents = "auto";
            
            // Eğer hoca seçimi önceden yapılmışsa veya varsayılan varsa takvimi hemen render et
            const tSelect = document.getElementById('teacher-select');
            if (tSelect && !tSelect.value) {
                tSelect.value = "any";
            }
            renderCalendar();
            // scrollIntoView kaldırıldı (sayfa sabit kalsın)
        }
    } else {
        alert("Lütfen devam etmek için en az bir paket seçin.");
    }
}

function editOnlineStep1() {
    const step1 = document.getElementById('online-step-1');
    const step2 = document.getElementById('online-step-2');
    if (step1) {
        if (step1.style.maxHeight === "1000px") {
            // Zaten açıksa daralt
            if (appState.selectedOnlinePackages.length > 0) {
                checkOnlineStep1(); // Seçim varsa tamamla mantığı çalışsın
            } else {
                step1.style.maxHeight = "70px";
                step1.style.opacity = "0.8";
            }
        } else {
            // Kapalıysa aç
            step1.style.maxHeight = "1000px";
            step1.style.opacity = "1";
            
            const headerTotal = document.getElementById('step1-header-total');
            if(headerTotal) headerTotal.style.display = 'none';
        }
    }
}

function editOnlineStep2() {
    const step2 = document.getElementById('online-step-2');
    const step1 = document.getElementById('online-step-1');
    if (step2) {
        if (step2.style.maxHeight === "1000px") {
            // Daralt
            step2.style.maxHeight = "70px";
            step2.style.opacity = "0.8";
        } else {
            // Aç
            step2.style.maxHeight = "1000px";
            step2.style.opacity = "1";
            
            // "eğitmen kısmına basınca paketler kapansın"
            if (step1 && step1.style.maxHeight === "1000px") {
                step1.style.maxHeight = "70px";
                step1.style.opacity = "0.8";
                const headerTotal = document.getElementById('step1-header-total');
                if(headerTotal) {
                    const total = appState.selectedOnlinePackages.reduce((sum, p) => sum + p.price, 0);
                    headerTotal.innerHTML = `(Toplam: ${total.toLocaleString('tr-TR')} ₺)`;
                    headerTotal.style.display = 'inline-block';
                }
            }
            
            const step3 = document.getElementById('online-step-3');
            if(step3) {
                step3.style.maxHeight = "70px";
                step3.style.opacity = "0.4";
                step3.style.pointerEvents = "none";
            }
        }
    }
}

function checkOnlineStep2() {
    if (appState.selectedSlots.length > 0) {
        const step2 = document.getElementById('online-step-2');
        const step3 = document.getElementById('online-step-3');
        if (step2 && step3) {
            step2.style.maxHeight = "70px"; 
            step2.style.opacity = "0.8";

            step3.style.opacity = "1";
            step3.style.pointerEvents = "auto";
            step3.style.maxHeight = "1000px";
        }
    } else {
        alert("Lütfen takvimden yeşil renkli en az bir ders saati seçin.");
    }
}

function editOnlineStep3() {
    const step2 = document.getElementById('online-step-2');
    const step3 = document.getElementById('online-step-3');
    if (step3) {
        if (step3.style.maxHeight === "1000px") {
            // Daralt
            step3.style.maxHeight = "70px";
            step3.style.opacity = "0.8";
        } else {
            // Aç
            if (appState.selectedSlots.length === 0) {
                alert("Lütfen önce takvimden saat seçimi yapınız.");
                return;
            }
            step3.style.maxHeight = "1000px";
            step3.style.opacity = "1";
            if(step2) {
                step2.style.maxHeight = "70px";
                step2.style.opacity = "0.8";
            }
        }
    }
}

function refreshTeacherSelect() {
    const teacherSelect = document.getElementById('teacher-select');
    if(teacherSelect) {
        teacherSelect.innerHTML = '<option value="any">Farketmez (İlk Müsait Eğitmen)</option>'; 
        appState.teachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.id; 
            option.text = teacher.name; 
            teacherSelect.appendChild(option);
        });
        renderCalendar(); 
    }
}

function generateSlots(startH, endH) {
    let slots = []; 
    let current = new Date(); 
    current.setHours(startH, 0, 0);
    while(current.getHours() < endH) {
        let start = current.toTimeString().substring(0, 5);
        let d = new Date(current); 
        d.setMinutes(d.getMinutes() + 40);
        let end = d.toTimeString().substring(0, 5);
        
        // 12:00-13:00 Öğle Yemeği, 18:00 Akşam Yemeği molası
        if(start.startsWith("12") || start.startsWith("18")) {
            slots.push({ time: "MOLA", isBreak: true });
            current.setHours(current.getHours() + 1, 0, 0); 
        } else {
            slots.push({ time: `${start} - ${end}`, isBreak: false });
            current.setMinutes(current.getMinutes() + 50); 
        }
    }
    return slots;
}

function renderCalendar() {
    const cal = document.getElementById('calendar-view');
    if(!cal) return;
    
    const selectedTeacherId = document.getElementById('teacher-select').value;
    let groupsRaw = [];

    if (selectedTeacherId === "any" || !selectedTeacherId) {
        const defaultDays = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
        groupsRaw = defaultDays.map(day => ({
            name: day,
            startH: 9,
            endH: 21,
            data: {} 
        }));
    } else {
        groupsRaw = teacherSchedules[selectedTeacherId] || [];
    }
    
    const groups = groupsRaw.map(g => ({
        ...g,
        slots: generateSlots(g.startH, g.endH)
    }));

    const useAccordion = groups.length > 2;

    cal.innerHTML = groups.map((group, index) => {
        const slotsHtml = group.slots.map(s => {
            const durum = group.data && group.data[s.time] ? group.data[s.time] : "musait";
            const click = (s.isBreak || durum === "dolu") ? "" : `onclick="selectSlot('${group.name}', '${s.time}', this)"`;
            const cName = s.isBreak ? "break" : (durum === "dolu" ? "dolu" : "musait");
            const icon = s.isBreak ? "☕" : (durum === "dolu" ? "❌" : "");
            return `<div class="slot ${cName}" ${click}>${icon} ${s.time}</div>`;
        }).join('');

        if (useAccordion) {
            return `
            <details class="day-group" ${index === 0 ? 'open' : ''}>
                <summary class="day-title">${group.name}</summary>
                <div class="slots-grid">
                    ${slotsHtml}
                </div>
            </details>
            `;
        } else {
            return `
            <div class="day-group">
                <span class="day-title">${group.name}</span>
                <div class="slots-grid">
                    ${slotsHtml}
                </div>
            </div>
            `;
        }
    }).join('');
    
    appState.selectedSlots = []; 
    updateSummary();
}

function selectSlot(day, time, el) {
    if (appState.selectedOnlinePackages.length === 0) return;
    const slotStr = `${day} ${time}`;
    if(appState.selectedSlots.includes(slotStr)) {
        appState.selectedSlots = appState.selectedSlots.filter(s => s !== slotStr);
        el.classList.remove('selected');
    } else {
        appState.selectedSlots.push(slotStr);
        el.classList.add('selected');
    }
    updateSummary();
}

function updateSummary() {
    const summaryEl = document.getElementById('selected-summary');
    if(!summaryEl) return;
    
    if (appState.selectedOnlinePackages.length === 0 && appState.selectedSlots.length === 0) {
        summaryEl.innerHTML = "Henüz seçim yapılmadı";
        return;
    }
    
    const pkgsStr = appState.selectedOnlinePackages.map(p => `<span class="highlight">${p.name}</span>`).join(', ') || "Seçilmedi";
    const slotsStr = appState.selectedSlots.length > 0 ? `<span class="highlight">${appState.selectedSlots.join(', ')}</span>` : "Seçilmedi";
    
    const totalPrice = appState.selectedOnlinePackages.reduce((sum, p) => sum + p.price, 0);
    
    summaryEl.innerHTML = `
        <strong>Paketler:</strong> ${pkgsStr} <br>
        <strong>Saatler:</strong> ${slotsStr} <br>
        <strong style="color:#20C997;">Toplam Tutar: ${totalPrice.toLocaleString('tr-TR')} ₺</strong>
    `;
}

function bookLiveLesson() {
    if (appState.selectedOnlinePackages.length === 0) { alert("Lütfen en az bir konuşma paketi seçin."); return; }
    if (!appState.selectedSlots || appState.selectedSlots.length === 0) { alert("Lütfen takvimden yeşil renkli en az bir ders saati seçin."); return; }
    
    // Çoklu paketler için özel tip yolluyoruz
    openCheckoutFlow('online_multiple', null);
}


/* ==========================================
   7. UNIFIED CHECKOUT FLOW (ÖDEME VE KAYIT TEK SAYFADA)
   ========================================== */
function openCheckoutFlow(type, packageId) {
    appState.paymentType = type; // Ne tür bir ödeme yapıldığını takip edelim
    
    const checkoutInfo = document.getElementById('checkout-package-info');
    if (!checkoutInfo) return;

    if (type === 'online_multiple') {
        appState.selectedPackageForPayment = null; 
        const pkgs = appState.selectedOnlinePackages;
        const total = pkgs.reduce((sum, p) => sum + p.price, 0);
        
        checkoutInfo.innerHTML = `
            <h3>Seçilen Paketler (Canlı Ders)</h3>
            <div class="checkout-pkg-card">
                ${pkgs.map(p => `<div style="margin-bottom: 10px;"><strong>${p.name}</strong><br><span style="font-size:0.9rem; color:#555;">${p.price.toLocaleString('tr-TR')} ₺</span></div>`).join('')}
                <hr style="border-color:rgba(0,0,0,0.1); margin: 15px 0;">
                <div class="checkout-price" style="color:#20C997;">Toplam: ${total.toLocaleString('tr-TR')} ₺</div>
            </div>
            <div class="iban-box glass-card mt-20">
                <h4>Banka Havalesi / EFT</h4>
                <p>Aşağıdaki IBAN numarasına ödemeyi gerçekleştirdikten sonra işlemi onaylayın.</p>
                <div class="iban-number">TR00 0000 0000 0000 0000 0000 00</div>
                <button class="btn btn-secondary mt-10" onclick="copyIban()">IBAN Kopyala</button>
            </div>
        `;
    } else if (type === 'offline_multiple') {
        appState.selectedPackageForPayment = null; 
        const pkgs = appState.selectedOfflinePackages.map(id => appState.packages.find(p => p.id === id)).filter(Boolean);
        let total = 0;
        pkgs.forEach(p => total += parseInt(p.price.replace(/[^0-9]/g, '')));
        
        checkoutInfo.innerHTML = `
            <h3>Seçilen Paketler (Özel Eğitim)</h3>
            <div class="checkout-pkg-card">
                ${pkgs.map(p => `<div style="margin-bottom: 10px;"><strong>${p.title}</strong><br><span style="font-size:0.9rem; color:#555;">${p.price}</span></div>`).join('')}
                <hr style="border-color:rgba(0,0,0,0.1); margin: 15px 0;">
                <div class="checkout-price" style="color:#20C997;">Toplam: ${total.toLocaleString('tr-TR')} ₺</div>
            </div>
            <div class="iban-box glass-card mt-20">
                <h4>Banka Havalesi / EFT</h4>
                <p>Aşağıdaki IBAN numarasına ödemeyi gerçekleştirdikten sonra işlemi onaylayın.</p>
                <div class="iban-number">TR00 0000 0000 0000 0000 0000 00</div>
                <button class="btn btn-secondary mt-10" onclick="copyIban()">IBAN Kopyala</button>
            </div>
        `;
    } else {
        let pkg;
        if (type === 'offline') {
            pkg = appState.packages.find(p => p.id === packageId);
        } else {
            pkg = appState.onlinePackages.find(p => p.id === packageId);
        }

        if(!pkg) return;
        appState.selectedPackageForPayment = pkg;
        
        checkoutInfo.innerHTML = `
            <h3>Seçilen Paket</h3>
            <div class="checkout-pkg-card">
                <h4>${pkg.title || pkg.name}</h4>
                <p>${pkg.description || pkg.desc || ''}</p>
                <div class="checkout-price">${typeof pkg.price === 'number' ? pkg.price.toLocaleString('tr-TR') + ' ₺' : pkg.price}</div>
            </div>
            <div class="iban-box glass-card mt-20">
                <h4>Banka Havalesi / EFT</h4>
                <p>Aşağıdaki IBAN numarasına ödemeyi gerçekleştirdikten sonra işlemi onaylayın.</p>
                <div class="iban-number">TR00 0000 0000 0000 0000 0000 00</div>
                <button class="btn btn-secondary mt-10" onclick="copyIban()">IBAN Kopyala</button>
            </div>
        `;
    }

    // Sol Taraf (Auth veya Giriş Yapıldı bilgisi)
    renderCheckoutAuthView();
    prefillEmail();
    changeView('checkout-section');
}

function renderCheckoutAuthView() {
    const authForm = document.getElementById('checkout-auth-form');
    const loggedInView = document.getElementById('checkout-logged-in-view');

    if (appState.currentUser !== "Misafir Öğrenci") {
        // Zaten giriş yapmış
        if(authForm) authForm.style.display = 'none';
        if(loggedInView) {
            loggedInView.style.display = 'block';
            document.getElementById('checkout-user-email').innerText = appState.currentUser;
        }
    } else {
        // Misafir
        if(authForm) authForm.style.display = 'block';
        if(loggedInView) loggedInView.style.display = 'none';
    }
}

function copyIban() {
    navigator.clipboard.writeText("TR00 0000 0000 0000 0000 0000 00").then(() => {
        alert("IBAN panoya kopyalandı!");
    });
}

function confirmPurchase() {
    if (appState.currentUser === "Misafir Öğrenci") {
        alert("Lütfen önce giriş yapın veya kayıt olun.");
        return;
    }

    if (appState.paymentType === 'online_multiple') {
        const selectedTeacherId = document.getElementById('teacher-select').value;
        const pkgs = appState.selectedOnlinePackages;
        const pkgsNames = pkgs.map(p => p.name).join(', ');
        
        let pendingLesson = {
            id: 'lesson_' + Date.now(),
            studentEmail: appState.currentUser,
            studentPhone: appState.currentUserPhone,
            package: pkgsNames,
            slots: [...appState.selectedSlots],
            requestedTeacherId: selectedTeacherId,
            status: "pending",
            createdAt: new Date().toISOString()
        };
        appState.pendingLessons.push(pendingLesson);

        let alertMessage = "";

        if (selectedTeacherId === "any" || !selectedTeacherId) {
            alertMessage = "Randevu talebiniz sistemdeki ortak havuza başarıyla iletildi. Müsait olan bir eğitmenimiz dersi onayladığında sistem üzerinden bilgilendirileceksiniz.";
        } else {
            const selectedTeacher = appState.teachers.find(t => t.id === selectedTeacherId);
            const teacherFirstName = selectedTeacher.name.split(' ')[1] || selectedTeacher.name; 
            alertMessage = `Randevu talebiniz doğrudan ${teacherFirstName} Hocaya sistem üzerinden iletildi. Öğretmeniniz onayladığında takviminize düşecektir.`;
        }

        alert(alertMessage);
        
        changeView('dashboard-section');
        return;
    }

function saveStudentData() {
    if (appState.userRole === 'student') {
        let users = JSON.parse(localStorage.getItem('mockUsers') || '{}');
        if (users[appState.currentUser]) {
            users[appState.currentUser].purchasedPackages = appState.purchasedPackages;
            if (appState.studentProgress["self"] && appState.studentProgress["self"][appState.currentUser]) {
                users[appState.currentUser].progress = appState.studentProgress["self"][appState.currentUser];
            }
            localStorage.setItem('mockUsers', JSON.stringify(users));
        }

        if (typeof firebase !== 'undefined' && isFirebaseReady) {
            db.collection('users').doc(appState.currentUser).update({
                purchasedPackages: appState.purchasedPackages,
                progress: appState.studentProgress["self"] ? appState.studentProgress["self"][appState.currentUser] : {}
            }).catch(err => console.error("Öğrenci verisi kaydedilemedi:", err));
        }
    }
}

    if (appState.paymentType === 'offline_multiple') {
        appState.selectedOfflinePackages.forEach(id => {
            if (!appState.purchasedPackages.includes(id)) {
                appState.purchasedPackages.push(id);
            }
        });
        saveStudentData();
        alert("Satın alma işleminiz onaylandı! Seçtiğiniz tüm eğitimlere artık erişebilirsiniz.");
        appState.selectedOfflinePackages = [];
        changeView('offline-list');
        return;
    }

    const pkg = appState.selectedPackageForPayment;
    if(!pkg) return;
    
    // Offline paketse (eski sistem fallback)
    if (appState.packages.find(p => p.id === pkg.id)) {
        if(!appState.purchasedPackages.includes(pkg.id)) {
            appState.purchasedPackages.push(pkg.id);
        }
        saveStudentData();
        alert(`Ödeme onaylandı! "${pkg.title}" hesabınıza tanımlandı.`);
        appState.viewHistory.pop();
        startPackage(pkg.id, pkg.title);
    }
}

/* ==========================================
   8. DERS İÇERİK VE QUIZ
   ========================================== */
function renderKazanimTimeline() {
    const container = document.getElementById('kazanim-timeline-render');
    if(!container) return;
    container.innerHTML = '';
    for(let i = 1; i <= appState.totalKazanimCount; i++) {
        const node = document.createElement('div');
        node.className = 'kazanim-node';
        node.innerText = i;
        if(i < appState.currentKazanim) {
            node.classList.add('completed');
        } else if(i === appState.currentKazanim) {
            node.classList.add('active');
        }
        container.appendChild(node);
    }
}

function loadKazanimData() {
    const t = document.getElementById('topic-text');
    const q = document.getElementById('question-text');
    if(t) t.innerHTML = `<strong>Adım ${appState.currentKazanim}:</strong> Mevcut kazanıma ait metinler, görseller burada yer alacaktır.`;
    if(q) q.innerText = `Kazanım ${appState.currentKazanim} test sorusu...`;
}

function simulateAnswer(isCorrect) {
    if(isCorrect) {
        if(appState.currentKazanim < appState.totalKazanimCount) {
            appState.currentKazanim++;
            
            // İlerlemeyi kaydet
            if (!appState.studentProgress["self"]) appState.studentProgress["self"] = {};
            if (!appState.studentProgress["self"][appState.currentUser]) appState.studentProgress["self"][appState.currentUser] = {};
            appState.studentProgress["self"][appState.currentUser][appState.currentPackageId] = appState.currentKazanim;
            saveStudentData();

            renderKazanimTimeline();
            loadKazanimData();
        } else {
            alert("TEBRİKLER! Tüm kazanımları başarıyla bitirdiniz.");
            goBack();
        }
    } else {
        appState.wrongAnswerPool.push({ packageId: appState.currentPackageId, kazanimId: appState.currentKazanim, time: new Date() });
        alert("Hatalı cevap verdiniz. Konuyu ileriki adımlarda tekrar sunacağız.");
    }
}

function joinLesson() {
    if (appState.userRole === "teacher") {
        document.getElementById('join-lesson-container').style.display = 'none';
        document.getElementById('lesson-video-container').style.display = 'block';
        alert("Derse başarıyla bağlandınız. Kameranız yayına açıldı.");
        return;
    }

    // Öğrenci için panel görünüyorsa zaten ders saati gelmiş demektir.
    document.getElementById('join-lesson-container').style.display = 'none';
    document.getElementById('lesson-video-container').style.display = 'block';
    alert("Derse başarıyla bağlandınız. Eğitmeninizin yayını bekleniyor...");
}

function leaveLesson() {
    document.getElementById('lesson-video-container').style.display = 'none';
    document.getElementById('join-lesson-container').style.display = 'block';
}

/* ==========================================
   9. YÖNETİCİ & ÖĞRETMEN PANELLERİ
   ========================================== */
function renderAdminPanel() {
    const adminSection = document.getElementById('admin-section');
    if (!adminSection) return;

    adminSection.innerHTML = `
        <div class="glass-card">
            <h2 style="margin-bottom: 25px;">👨‍💼 Yönetici Paneli</h2>
            
            <details class="admin-details" name="admin-accordion" open>
                <summary class="admin-summary">Öğretmen Başvuruları (Bekleyen Talepler)</summary>
                <div id="admin-teacher-applications" style="margin-top: 15px; margin-bottom: 10px;"></div>
            </details>
            
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

            <details class="admin-details" name="admin-accordion">
                <summary class="admin-summary">Sistemdeki Öğretmenler</summary>
                <div id="admin-teacher-list" style="margin-top: 15px; margin-bottom: 10px; overflow-x: auto;"></div>
            </details>

            <details class="admin-details" name="admin-accordion">
                <summary class="admin-summary">Yeni Öğretmen Ekle</summary>
                <div style="margin-top: 15px;">
                    <div class="dark-box">
                        <div class="form-group">
                            <label>Öğretmen Adı Soyadı</label>
                            <input type="text" id="new-teacher-name" placeholder="Örn: Eğitmen Ahmet (YDS Uzmanı)">
                        </div>
                        <div class="form-group">
                            <label>Kullanıcı ID</label>
                            <input type="text" id="new-teacher-id" placeholder="Örn: ahmet_hoca">
                        </div>
                        <div class="form-group">
                            <label>E-posta</label>
                            <input type="email" id="new-teacher-email" placeholder="Örn: ahmet@mail.com">
                        </div>
                        <div class="form-group">
                            <label>Şifre</label>
                            <input type="text" id="new-teacher-password" placeholder="Giriş için kullanılacak şifre">
                        </div>
                        <div class="form-group">
                            <label>Telefon (WhatsApp)</label>
                            <div style="display: flex;">
                                <span style="padding: 12px; background: #E9EEF5; border: 1px solid #E9EEF5; border-radius: 12px 0 0 12px; color: #555; font-weight: bold;">+90</span>
                                <input type="tel" id="new-teacher-phone" placeholder="5XX XXX XX XX" pattern="^5[0-9]{9}$" maxlength="10" style="border-radius: 0 12px 12px 0; border-left: none;">
                            </div>
                        </div>
                        <button class="btn btn-primary" onclick="addTeacher()">Ekle ve Kaydet</button>
                    </div>
                </div>
            </details>
            
            <details class="admin-details" name="admin-accordion">
                <summary class="admin-summary">Özel Eğitim Paketleri (Çevrimdışı) Yönetimi</summary>
                <div style="margin-top: 15px;">
                    <div id="admin-offline-packages" style="margin-bottom: 30px;"></div>
                    
                    <div class="dark-box">
                        <h4 style="margin-top:0;">Yeni Çevrimdışı Paket Ekle</h4>
                        <div class="form-group"><label>Başlık</label><input type="text" id="new-offline-title" placeholder="Örn: Okuma Paketi"></div>
                        <div class="form-group"><label>Açıklama</label><input type="text" id="new-offline-desc" placeholder="Örn: Kural dışı fiillerin..."></div>
                        <div style="display:flex; gap:15px; flex-wrap:wrap;">
                            <div class="form-group" style="flex:1; min-width: 150px;"><label>Süre</label><input type="text" id="new-offline-duration" placeholder="Örn: 12 Saat"></div>
                            <div class="form-group" style="flex:1; min-width: 150px;"><label>Fiyat</label><input type="text" id="new-offline-price" placeholder="Örn: 450 ₺"></div>
                        </div>
                        <div class="form-group"><label>Gereklilikler (Virgülle Ayırın)</label><input type="text" id="new-offline-reqs" placeholder="Örn: A1 seviyesi, Arapça harfleri tanımak"></div>
                        <div class="form-group"><label>Hedef Kazanım</label><input type="text" id="new-offline-target" placeholder="Örn: Hızlı okumayı sağlamak"></div>
                        <button class="btn btn-primary" onclick="addOfflinePackage()">Paketi Ekle</button>
                    </div>
                </div>
            </details>
            
            <details class="admin-details" name="admin-accordion">
                <summary class="admin-summary">Canlı Ders Paketleri Yönetimi</summary>
                <div style="margin-top: 15px;">
                    <div id="admin-online-packages" style="margin-bottom: 30px;"></div>
                    
                    <div class="dark-box">
                        <h4 style="margin-top:0;">Yeni Canlı Ders Paketi Ekle</h4>
                        <div class="form-group"><label>Paket Adı</label><input type="text" id="new-online-name" placeholder="Örn: YDS/YÖKDİL Metin Çözümleme"></div>
                        <div class="form-group"><label>Açıklama</label><input type="text" id="new-online-desc" placeholder="Örn: İleri seviye Arapça metin okuma"></div>
                        <div style="display:flex; gap:15px; flex-wrap:wrap;">
                            <div class="form-group" style="flex:1; min-width: 150px;"><label>Fiyat (Sadece Rakam)</label><input type="number" id="new-online-price" placeholder="Örn: 2500"></div>
                            <div class="form-group" style="flex:1; min-width: 150px;"><label>Saat</label><input type="text" id="new-online-hours" placeholder="Örn: 16 Saat / Ay"></div>
                        </div>
                        <div class="form-group"><label>Materyal</label><input type="text" id="new-online-material" placeholder="Örn: Çıkmış Sorular & İleri Seviye Metinler"></div>
                        <button class="btn btn-primary" onclick="addOnlinePackage()">Canlı Ders Ekle</button>
                    </div>
                </div>
            </details>

            <details class="admin-details" name="admin-accordion">
                <summary class="admin-summary">Eğitmen Programı (Müsaitlik) Yönetimi</summary>
                <div style="margin-top: 15px;">
                    <p style="margin-top:0;">Hangi öğretmenin programını düzenlemek istediğinizi seçin:</p>
                    <select id="admin-teacher-edit-select" class="form-group" style="padding:10px; width:100%; border-radius:8px;" onchange="renderAdminTeacherScheduleEditor()">
                        <!-- Options will be injected by renderAdminPanel -->
                    </select>
                    <div id="admin-teacher-schedule-editor" class="mt-20"></div>
                </div>
            </details>
        </div>
    `;
    
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

function renderAdminTeacherScheduleEditor() {
    const editor = document.getElementById('admin-teacher-schedule-editor');
    if (!editor) return;
    const teacherId = document.getElementById('admin-teacher-edit-select').value;
    if (!teacherId) return editor.innerHTML = "<p>Lütfen seçin.</p>";

    const groupsRaw = teacherSchedules[teacherId] || [];
    const groups = groupsRaw.map(g => ({ ...g, slots: generateSlots(g.startH, g.endH) }));

    let html = '<p>Saatlerin üzerine tıklayarak <strong>Müsait</strong> veya <strong>Dolu</strong> olarak değiştirebilirsiniz.</p>';
    html += groups.map(group => `
        <div class="day-group">
            <span class="day-title">${group.name}</span>
            <div class="slots-grid">
                ${group.slots.map(s => {
                    const durum = group.data && group.data[s.time] ? group.data[s.time] : "musait";
                    if (s.isBreak) return `<div class="slot break">${s.time}</div>`;
                    const label = durum === "dolu" ? "Dolu" : "Müsait";
                    return `<div class="slot ${durum}" onclick="toggleSlotStatus('${teacherId}', '${group.name}', '${s.time}', this, true)" style="cursor: pointer;">${s.time}<br><small style="font-size:0.7rem;">${label}</small></div>`;
                }).join('')}
            </div>
        </div>
    `).join('');
    editor.innerHTML = html;
}

function renderTeacherApplications() {
    const listContainer = document.getElementById('admin-teacher-applications');
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
    
    teacherSchedules[newId] = [{ name: "Varsayılan Program", slots: null, data: {}, startH: 9, endH: 17 }];
    
    appState.teacherApplications.splice(appIndex, 1);
    saveTeachers();
    
    renderTeacherApplications();
    renderAdminTeacherList();
    refreshTeacherSelect();
    alert("Öğretmen başvurusu onaylandı ve sisteme eklendi! Bilgileri tablodan düzenleyebilirsiniz.");
}

function rejectTeacherApplication(appId) {
    if (confirm("Bu başvuruyu reddetmek istediğinize emin misiniz?")) {
        appState.teacherApplications = appState.teacherApplications.filter(a => a.id !== appId);
        saveTeachers();
        renderTeacherApplications();
    }
}

function renderAdminStudentList() {
    const listContainer = document.getElementById('admin-student-list');
    if (!listContainer) return;

    let users = JSON.parse(localStorage.getItem('mockUsers') || '{}');
    let emails = Object.keys(users);
    
    if (emails.length === 0) {
        listContainer.innerHTML = "<p>Henüz kayıtlı öğrenci bulunmuyor.</p>";
        return;
    }

    let groups = {};
    emails.forEach(email => {
        let firstLetter = email.charAt(0).toUpperCase();
        if (!groups[firstLetter]) groups[firstLetter] = [];
        groups[firstLetter].push({ 
            email: email, 
            phone: users[email].phone || 'Belirtilmedi',
            name: users[email].name || 'Belirtilmedi',
            profession: users[email].profession || 'Belirtilmedi'
        });
    });

    let html = '';
    Object.keys(groups).sort().forEach(letter => {
        html += `<div style="background: #F0F4F8; padding: 10px; margin-bottom: 15px; border-radius: 8px;">
                    <h4 style="margin: 0 0 10px 0; color: #16A085;">${letter}</h4>
                    <table class="admin-table" style="margin-bottom: 0;">
                        <tr><th>Ad Soyad</th><th>E-posta</th><th>Telefon</th><th>Meslek</th></tr>`;
        groups[letter].forEach(student => {
            html += `<tr>
                <td><strong>${student.name}</strong></td>
                <td>${student.email}</td>
                <td><a href="tel:${student.phone}" style="color: #F39C12; text-decoration: none; font-weight: bold;">${student.phone}</a></td>
                <td style="color: #666; font-size: 0.9em;">${student.profession}</td>
            </tr>`;
        });
        html += `</table></div>`;
    });

    listContainer.innerHTML = html;
}

function renderAdminTeacherList() {
    const listContainer = document.getElementById('admin-teacher-list');
    if (!listContainer) return;
    if (appState.teachers.length === 0) {
        listContainer.innerHTML = "<p>Öğretmen bulunmuyor.</p>"; return;
    }
    let html = '<table class="admin-table">';
    html += '<tr><th>ID</th><th>İsim</th><th>Telefon</th><th>E-posta</th><th>Şifre</th><th>CV / Belge</th><th>İşlem</th></tr>';
    appState.teachers.forEach((t, index) => {
        let cvInfo = (t.cv || t.documentName) ? `<small style="display:block; max-width: 150px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${t.cv || ''}">${t.documentName || 'CV Var'}</small>` : '-';
        html += `<tr>
            <td contenteditable="true" oninput="activateTeacherSaveBtn()" style="background: #fff8e1; border-radius: 4px; padding: 5px; outline: none;">${t.id}</td>
            <td contenteditable="true" oninput="activateTeacherSaveBtn()" style="background: #fff8e1; border-radius: 4px; padding: 5px; outline: none;">${t.name}</td>
            <td contenteditable="true" oninput="activateTeacherSaveBtn()" style="background: #fff8e1; border-radius: 4px; padding: 5px; outline: none;">${t.phone}</td>
            <td contenteditable="true" oninput="activateTeacherSaveBtn()" style="background: #fff8e1; border-radius: 4px; padding: 5px; outline: none;">${t.email || ''}</td>
            <td contenteditable="true" oninput="activateTeacherSaveBtn()" style="background: #fff8e1; border-radius: 4px; padding: 5px; outline: none;">${t.password || ''}</td>
            <td>${cvInfo}</td>
            <td style="text-align:center;"><button class="btn btn-danger btn-sm" onclick="removeTeacher('${t.id}')">Sil</button></td>
        </tr>`;
    });
    html += '</table>';
    html += `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
            <p style="font-size: 0.85rem; color: #888; margin: 0;">* Öğretmen bilgilerini güncellemek için sarı alanlara tıklayıp yazın, ardından kaydet butonuna basın.</p>
            <button id="teacher-save-btn" class="btn btn-success" disabled onclick="saveTeacherChanges()">Değişiklikleri Kaydet</button>
        </div>
    `;
    listContainer.innerHTML = html;
}

function activateTeacherSaveBtn() {
    const btn = document.getElementById('teacher-save-btn');
    if (btn) {
        btn.disabled = false;
        btn.innerText = "Değişiklikleri Kaydet";
    }
}

function saveTeacherChanges() {
    const listContainer = document.getElementById('admin-teacher-list');
    if (!listContainer) return;
    const table = listContainer.querySelector('.admin-table');
    if (!table) return;
    
    const rows = table.querySelectorAll('tr');
    
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll('td');
        if (cells.length >= 5) {
            const index = i - 1; // appState.teachers dizisindeki index
            if (appState.teachers[index]) {
                const newId = cells[0].innerText.replace(/[\r\n]+/g, "").trim();
                const oldId = appState.teachers[index].id;
                
                // Eğer ID değiştiyse takvim ve alarmları yeni ID'ye taşı
                if (oldId !== newId && newId !== "") {
                    if (teacherSchedules[oldId]) {
                        teacherSchedules[newId] = teacherSchedules[oldId];
                        delete teacherSchedules[oldId];
                    }
                    if (appState.teacherAlarms && appState.teacherAlarms[oldId]) {
                        appState.teacherAlarms[newId] = appState.teacherAlarms[oldId];
                        delete appState.teacherAlarms[oldId];
                    }
                }

                appState.teachers[index].id = newId || oldId;
                appState.teachers[index].name = cells[1].innerText.replace(/[\r\n]+/g, "").trim();
                appState.teachers[index].phone = cells[2].innerText.replace(/[\r\n]+/g, "").trim();
                appState.teachers[index].email = cells[3].innerText.replace(/[\r\n]+/g, "").trim();
                appState.teachers[index].password = cells[4].innerText.replace(/[\r\n]+/g, "").trim();
            }
        }
    }

    saveTeachers();
    
    // Select seçeneklerini güncelle
    const adminSelect = document.getElementById('admin-teacher-edit-select');
    if (adminSelect) {
        const currentVal = adminSelect.value;
        adminSelect.innerHTML = appState.teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
        if(appState.teachers.find(t => t.id === currentVal)) adminSelect.value = currentVal;
    }

    const btn = document.getElementById('teacher-save-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerText = "Tüm Bilgiler Anında Kaydedildi ✔";
        setTimeout(() => {
            if(btn.disabled) btn.innerText = "Değişiklikleri Kaydet";
        }, 2500);
    }
}

function addTeacher() {
    const name = document.getElementById('new-teacher-name').value.trim();
    const id = document.getElementById('new-teacher-id').value.trim();
    const email = document.getElementById('new-teacher-email').value.trim();
    const password = document.getElementById('new-teacher-password').value.trim();
    let phone = document.getElementById('new-teacher-phone').value.trim();
    
    if (!name || !id || !email || !password || !phone) return alert("Tüm alanları doldurun.");
    if (!phone.match(/^5[0-9]{9}$/)) return alert("Lütfen 5 ile başlayan 10 haneli bir telefon numarası girin.");
    if (appState.teachers.find(t => t.id === id)) return alert("ID zaten mevcut!");

    phone = "+90" + phone;
    appState.teachers.push({ id, name, phone, email, password });
    teacherSchedules[id] = [{ name: "Varsayılan Program", slots: null, data: {}, startH: 9, endH: 17 }];
    
    saveTeachers();
    alert("Öğretmen eklendi!");
    
    document.getElementById('new-teacher-name').value = "";
    document.getElementById('new-teacher-id').value = "";
    document.getElementById('new-teacher-email').value = "";
    document.getElementById('new-teacher-password').value = "";
    document.getElementById('new-teacher-phone').value = "";
    
    renderAdminTeacherList();
    refreshTeacherSelect();
}

// --- OFFLINE PACKAGES CRUD ---
function renderAdminOfflinePackages() {
    const container = document.getElementById('admin-offline-packages');
    if (!container) return;
    if (appState.packages.length === 0) {
        container.innerHTML = "<p>Çevrimdışı paket bulunmuyor.</p>"; return;
    }
    let html = '<table class="admin-table">';
    html += '<tr><th>ID</th><th>Başlık</th><th>Açıklama</th><th>Süre</th><th>Fiyat</th><th>Gereklilikler</th><th>Hedef</th><th>İşlem</th></tr>';
    appState.packages.forEach((pkg, index) => {
        const reqs = pkg.requirements ? pkg.requirements.join(', ') : '';
        html += `<tr>
            <td style="font-size:12px; color:#888;">${pkg.id}</td>
            <td contenteditable="true" onblur="updateOfflinePackageData(${index}, 'title', this.innerText)" style="background: #fff8e1; outline: none; min-width:100px;">${pkg.title}</td>
            <td contenteditable="true" onblur="updateOfflinePackageData(${index}, 'description', this.innerText)" style="background: #fff8e1; outline: none; min-width:150px;">${pkg.description}</td>
            <td contenteditable="true" onblur="updateOfflinePackageData(${index}, 'duration', this.innerText)" style="background: #fff8e1; outline: none;">${pkg.duration}</td>
            <td contenteditable="true" onblur="updateOfflinePackageData(${index}, 'price', this.innerText)" style="background: #fff8e1; outline: none;">${pkg.price}</td>
            <td contenteditable="true" onblur="updateOfflinePackageData(${index}, 'requirements', this.innerText)" style="background: #fff8e1; outline: none; min-width:150px;">${reqs}</td>
            <td contenteditable="true" onblur="updateOfflinePackageData(${index}, 'target', this.innerText)" style="background: #fff8e1; outline: none; min-width:150px;">${pkg.target || ''}</td>
            <td style="text-align:center;"><button class="btn btn-danger btn-sm" onclick="removeOfflinePackage(${pkg.id})">Sil</button></td>
        </tr>`;
    });
    html += '</table><p style="font-size: 0.85rem; color: #888; margin-top: 10px;">* Sarı alanlara tıklayıp yazarak anında güncelleyebilirsiniz. (Gereklilikleri virgülle ayırın)</p>';
    container.innerHTML = html;
}

function updateOfflinePackageData(index, field, value) {
    if (appState.packages[index]) {
        if (field === 'requirements') {
            appState.packages[index][field] = value.split(',').map(s => s.trim()).filter(s => s);
        } else {
            appState.packages[index][field] = value.trim();
        }
        saveTeachers();
        if(appState.currentView === 'dashboard-section') renderPackages();
    }
}

function addOfflinePackage() {
    const title = document.getElementById('new-offline-title').value.trim();
    const desc = document.getElementById('new-offline-desc').value.trim();
    const duration = document.getElementById('new-offline-duration').value.trim();
    const price = document.getElementById('new-offline-price').value.trim();
    const reqsInput = document.getElementById('new-offline-reqs').value.trim();
    const target = document.getElementById('new-offline-target').value.trim();
    
    if (!title || !desc || !duration || !price) return alert("Başlık, Açıklama, Süre ve Fiyat zorunludur.");
    
    const id = Date.now();
    const requirements = reqsInput ? reqsInput.split(',').map(s => s.trim()).filter(s => s) : [];
    
    appState.packages.push({ id, title, description: desc, duration, price, requirements, target });
    saveTeachers();
    alert("Özel eğitim paketi eklendi!");
    
    document.getElementById('new-offline-title').value = "";
    document.getElementById('new-offline-desc').value = "";
    document.getElementById('new-offline-duration').value = "";
    document.getElementById('new-offline-price').value = "";
    document.getElementById('new-offline-reqs').value = "";
    document.getElementById('new-offline-target').value = "";
    
    renderAdminOfflinePackages();
    if(appState.currentView === 'dashboard-section') renderPackages();
}

function removeOfflinePackage(id) {
    if (confirm("Bu paketi silmek istediğinize emin misiniz?")) {
        appState.packages = appState.packages.filter(p => p.id !== id);
        saveTeachers();
        renderAdminOfflinePackages();
        if(appState.currentView === 'dashboard-section') renderPackages();
    }
}

// --- ONLINE PACKAGES CRUD ---
function renderAdminOnlinePackages() {
    const container = document.getElementById('admin-online-packages');
    if (!container) return;
    if (appState.onlinePackages.length === 0) {
        container.innerHTML = "<p>Canlı ders paketi bulunmuyor.</p>"; return;
    }
    let html = '<table class="admin-table">';
    html += '<tr><th>ID</th><th>Paket Adı</th><th>Açıklama</th><th>Fiyat (Sayı)</th><th>Saat</th><th>Materyal</th><th>İşlem</th></tr>';
    appState.onlinePackages.forEach((pkg, index) => {
        html += `<tr>
            <td style="font-size:12px; color:#888;">${pkg.id}</td>
            <td contenteditable="true" onblur="updateOnlinePackageData(${index}, 'name', this.innerText)" style="background: #fff8e1; outline: none; min-width:100px;">${pkg.name}</td>
            <td contenteditable="true" onblur="updateOnlinePackageData(${index}, 'desc', this.innerText)" style="background: #fff8e1; outline: none; min-width:150px;">${pkg.desc}</td>
            <td contenteditable="true" onblur="updateOnlinePackageData(${index}, 'price', this.innerText)" style="background: #fff8e1; outline: none;">${pkg.price}</td>
            <td contenteditable="true" onblur="updateOnlinePackageData(${index}, 'hours', this.innerText)" style="background: #fff8e1; outline: none;">${pkg.hours}</td>
            <td contenteditable="true" onblur="updateOnlinePackageData(${index}, 'material', this.innerText)" style="background: #fff8e1; outline: none;">${pkg.material || ''}</td>
            <td style="text-align:center;"><button class="btn btn-danger btn-sm" onclick="removeOnlinePackage(${pkg.id})">Sil</button></td>
        </tr>`;
    });
    html += '</table><p style="font-size: 0.85rem; color: #888; margin-top: 10px;">* Sarı alanlara tıklayıp yazarak anında güncelleyebilirsiniz.</p>';
    container.innerHTML = html;
}

function updateOnlinePackageData(index, field, value) {
    if (appState.onlinePackages[index]) {
        if (field === 'price') {
            appState.onlinePackages[index][field] = parseInt(value) || 0;
        } else {
            appState.onlinePackages[index][field] = value.trim();
        }
        saveTeachers();
        if(appState.currentView === 'dashboard-section') renderOnlinePackages();
    }
}

function addOnlinePackage() {
    const name = document.getElementById('new-online-name').value.trim();
    const desc = document.getElementById('new-online-desc').value.trim();
    const priceStr = document.getElementById('new-online-price').value.trim();
    const hours = document.getElementById('new-online-hours').value.trim();
    const material = document.getElementById('new-online-material').value.trim();
    
    if (!name || !desc || !priceStr || !hours) return alert("Paket Adı, Açıklama, Fiyat ve Saat zorunludur.");
    
    const id = Date.now();
    const price = parseInt(priceStr) || 0;
    
    appState.onlinePackages.push({ id, name, desc, price, hours, material });
    saveTeachers();
    alert("Canlı ders paketi eklendi!");
    
    document.getElementById('new-online-name').value = "";
    document.getElementById('new-online-desc').value = "";
    document.getElementById('new-online-price').value = "";
    document.getElementById('new-online-hours').value = "";
    document.getElementById('new-online-material').value = "";
    
    renderAdminOnlinePackages();
    if(appState.currentView === 'dashboard-section') renderOnlinePackages();
}

function removeOnlinePackage(id) {
    if (confirm("Bu canlı ders paketini silmek istediğinize emin misiniz?")) {
        appState.onlinePackages = appState.onlinePackages.filter(p => p.id !== id);
        saveTeachers();
        renderAdminOnlinePackages();
        if(appState.currentView === 'dashboard-section') renderOnlinePackages();
    }
}

function removeTeacher(id) {
    if (confirm("Bu öğretmeni silmek istediğinize emin misiniz?")) {
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

function approveLesson(lessonId) {
    const lesson = appState.pendingLessons.find(l => l.id === lessonId);
    if (!lesson) return;
    
    const activeTeacher = appState.teachers.find(t => t.email === appState.currentUser);
    if (!activeTeacher) return;
    const teacherId = activeTeacher.id;

    lesson.status = "approved";
    lesson.teacherId = teacherId; // Teacher claimed it
    
    // Bekleyenlerden silip onaylananlara taşı
    appState.pendingLessons = appState.pendingLessons.filter(l => l.id !== lessonId);
    appState.approvedLessons.push(lesson);

    // Auto-fill teacher's schedule as "dolu" for these slots
    if (teacherSchedules[teacherId]) {
        let updatedCount = 0;
        lesson.slots.forEach(slotStr => {
            // slotStr format is typically "Group Name 14:00 - 14:40"
            // Let's parse it properly
            const timePart = slotStr.slice(-13); // "14:00 - 14:40"
            const groupName = slotStr.slice(0, -14).trim();
            
            const group = teacherSchedules[teacherId].find(g => g.name === groupName);
            if (group) {
                if (!group.data) group.data = {};
                group.data[timePart] = "dolu";
                updatedCount++;
            }
        });
        if (updatedCount > 0) {
            alert(`Ders başarıyla onaylandı!\nTakviminizdeki ilgili ${updatedCount} saat dilimi otomatik olarak "Dolu" işaretlendi.`);
        } else {
            alert("Ders başarıyla onaylandı!");
        }
    } else {
        alert("Ders başarıyla onaylandı!");
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

    let html = '';
    alarms.forEach(alarm => {
        const bg = alarm.isCompleted ? "#E9EEF5" : "#FFF3CD";
        const textDec = alarm.isCompleted ? "line-through" : "none";
        const color = alarm.isCompleted ? "#888" : "#856404";
        
        html += `
        <div style="background: ${bg}; border: 1px solid #ddd; padding: 10px 15px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
            <div style="text-decoration: ${textDec}; color: ${color};">
                <strong style="font-size: 1.1rem; margin-right: 10px;">${alarm.time}</strong> ${alarm.note}
            </div>
            <div style="display: flex; gap: 5px;">
                <button class="btn btn-sm ${alarm.isCompleted ? 'btn-secondary' : 'btn-success'}" onclick="toggleAlarmStatus('${teacherId}', ${alarm.id})">
                    ${alarm.isCompleted ? 'Geri Al' : 'Tamamlandı'}
                </button>
                <button class="btn btn-danger btn-sm" onclick="removeTeacherAlarm('${teacherId}', ${alarm.id})">Sil</button>
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

function addTeacherAlarm() {
    const activeTeacher = appState.teachers.find(t => t.email === appState.currentUser);
    if (!activeTeacher) return;
    const teacherId = activeTeacher.id;
    
    const time = document.getElementById('new-alarm-time').value;
    const note = document.getElementById('new-alarm-note').value.trim();

    if (!time || !note) return alert("Lütfen saat ve not alanlarını doldurun.");

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

function removeTeacherAlarm(teacherId, alarmId) {
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
        alert("Şifre boş olamaz.");
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
                    alert("Şifreniz başarıyla güncellendi.");
                }).catch(err => {
                    alert("Firebase şifre güncelleme hatası: " + err.message + "\nLütfen çıkış yapıp tekrar giriş yaparak deneyin.");
                });
            } else {
                alert("Şifreniz başarıyla güncellendi.");
            }
        } else {
            alert("Şifreniz başarıyla güncellendi.");
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

    const groupsRaw = teacherSchedules[teacherId] || [];
    const groups = groupsRaw.map(g => ({ ...g, slots: generateSlots(g.startH, g.endH) }));

    let html = '<p>Saatlerin üzerine tıklayarak <strong>Müsait</strong> veya <strong>Dolu</strong> olarak değiştirebilirsiniz.</p>';
    html += groups.map(group => `
        <div class="day-group">
            <span class="day-title">${group.name}</span>
            <div class="slots-grid">
                ${group.slots.map(s => {
                    const durum = group.data && group.data[s.time] ? group.data[s.time] : "musait";
                    if (s.isBreak) return `<div class="slot break">${s.time}</div>`;
                    const label = durum === "dolu" ? "Dolu" : "Müsait";
                    return `<div class="slot ${durum}" onclick="toggleSlotStatus('${teacherId}', '${group.name}', '${s.time}', this, false)" style="cursor: pointer;">${s.time}<br><small style="font-size:0.7rem;">${label}</small></div>`;
                }).join('')}
            </div>
        </div>
    `).join('');
    editor.innerHTML = html;
}

function toggleSlotStatus(teacherId, groupName, time, element, isAdmin = false) {
    const group = teacherSchedules[teacherId].find(g => g.name === groupName);
    if (!group) return;
    if (!group.data) group.data = {};
    const newStatus = (group.data[time] || "musait") === "musait" ? "dolu" : "musait";
    group.data[time] = newStatus;
    
    element.classList.remove("musait", "dolu");
    element.classList.add(newStatus);
    
    const label = newStatus === "dolu" ? "Dolu" : "Müsait";
    element.innerHTML = `${time}<br><small style="font-size:0.7rem;">${label}</small>`;
    
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

/* ==========================================
   ALARM / HATIRLATICI KONTROL SİSTEMİ
   ========================================== */
function playSineWaveAlarm() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        // 440'tan 880'e hızla çıkan dikkat çekici bir "bip" sesi
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); 
        oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 1);
    } catch(e) {
        console.warn("Ses çalınamadı (kullanıcı etkileşimi gerekebilir):", e);
    }
}

function showAlarmToast(note) {
    const toast = document.createElement('div');
    toast.innerHTML = `<strong style="font-size:1.3rem;">⏰ Hatırlatıcı</strong><br><span style="font-size:1.1rem; margin-top:5px; display:inline-block;">${note}</span>`;
    toast.style.cssText = "position: fixed; top: 20px; right: 20px; z-index: 9999; background: #E74C3C; color: white; padding: 20px; border-radius: 12px; box-shadow: 0 5px 20px rgba(231,76,60,0.5); transition: opacity 0.5s ease, transform 0.5s ease; opacity: 0; transform: translateX(50px);";
    document.body.appendChild(toast);
    
    // Animasyonu tetikle
    requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateX(0)";
    });

    if(navigator.vibrate) navigator.vibrate([200, 100, 200]);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(50px)";
        setTimeout(() => toast.remove(), 500);
    }, 10000);
}

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
            showAlarmToast(alarm.note);
        }
    });

    if (alarmTriggered) {
        saveTeachers();
        if (document.getElementById('teacher-alarms-list')) {
            renderTeacherAlarms();
        }
    }
}, 30000);
