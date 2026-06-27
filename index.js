/* ==========================================
   1. GÜVENLİK VE CAYDIRICI ÖNLEMLER (DEVRE DIŞI BIRAKILDI)
   ========================================== */
// (function initSecurity() { ... })();

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
    screenStream: null,
    selectedOnlinePackages: [],
    selectedOfflinePackages: [],
    selectedSlots: [],
    pipWindow: null,
    
    // Yeni Eklenenler (Randevu Takibi ve Öğretmen Araçları)
    pendingLessons: [],
    approvedLessons: [],
    teacherAlarms: {},
    studentProgress: {},
    kazanimData: {},
    
    teachers: [
        { id: "hoca1", name: "Eğitmen Geylani", phone: "+905386482614", email: "hoca1@mail.com", password: "123" }
    ],

    packages: [
        {
            id: 1,
            title: "Elif-Bâ ve Temel Okuma (A1 Başlangıç)", 
            description: "Harflerin mahreçleri, bitişik yazım kuralları ve temel seviye okuma pratikleri.", 
            duration: "10 Saat",
            price: 450,
            requirements: ["Arapçaya sıfırdan başlayanlar içindir."],
            target: "Öğrencinin yavaş okuma problemini ortadan kaldırmak ve Kur'an veya basit metin okumaya akıcı bir giriş yapmasını sağlamak."
        },
        {
            id: 2,
            title: "Temel Sarf ve Nahiv (A2 Giriş)", 
            description: "İsim ve Fiil cümleleri, kelime çekim mantığı ve kural dışı fiiller.",
            duration: "20 Saat",
            price: 750,
            requirements: ["Harfleri ve harekeleri akıcı okuyabilmek"],
            target: "Cümle kurulumundaki temel mantığı kavramak ve fiil çekimlerindeki ezber zorluğunu algoritmik bir yöntemle çözmek."
        },
        {
            id: 3,
            title: "Kapsamlı Cümle Analizi (B1 Orta)", 
            description: "Harekesiz metinleri doğru okuyabilmek için uygulamalı dilbilgisi ve İrab.",
            duration: "30 Saat",
            price: 1150,
            requirements: ["A2 seviyesi gramer ve kelime bilgisi"],
            target: "Cümle içindeki ögelerin (fail, meful, muzafun ileyh vb.) harekesini doğru tahmin edememe ve irabını yapamama sorununu gidermek."
        },
        {
            id: 4,
            title: "Haber ve Modern Metin Çevirisi (B2 İleri Orta)", 
            description: "Modern standart Arapça (Fusha) ile güncel medya ve haber metinleri çevirisi.",
            duration: "40 Saat",
            price: 1600,
            requirements: ["B1 seviyesi metinleri rahat okuyabilmek", "Sözlük kullanım becerisi"],
            target: "Güncel, siyasi ve sosyal metinlerdeki kalıp ifadeleri tanımak ve Türkçeye anadil doğallığında çevirebilme yeteneği kazanmak."
        },
        {
            id: 5,
            title: "Klasik ve Akademik Metinler (C1 İleri)", 
            description: "YDS/YÖKDİL sınavlarına hazırlık ve klasik eserlerde (Tefsir, Hadis vb.) anlam çözümleri.",
            duration: "50 Saat",
            price: 2200,
            requirements: ["İleri seviye nahiv bilgisi", "Geniş kelime dağarcığı"],
            target: "Akademik sınavlardaki ve edebi/klasik metinlerdeki karmaşık, uzun ve iç içe geçmiş cümle yapılarını kolayca analiz edebilmek."
        },
        {
            id: 6,
            title: "Belağat ve İfade Sanatı (C2 Uzman)", 
            description: "Arapçanın edebi derinliği; Meâni, Beyân ve Bedi ilimlerine giriş.",
            duration: "45 Saat",
            price: 2500,
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

function getDefaultSchedule() {
    const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
    return days.map(day => ({
        name: day,
        slots: null,
        data: {},
        startH: 9,
        endH: 17
    }));
}

let teacherSchedules = {
    "hoca1": getDefaultSchedule()
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
    const savedKazanim = localStorage.getItem('mockKazanimData');
    if (savedAlarms) appState.teacherAlarms = JSON.parse(savedAlarms);
    if (savedProgress) appState.studentProgress = JSON.parse(savedProgress);
    if (savedKazanim) appState.kazanimData = JSON.parse(savedKazanim);
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
            onlinePackages: appState.onlinePackages,
            kazanimData: appState.kazanimData
        });
        db.collection('global').doc('teacherSchedules').set({
            schedules: teacherSchedules
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
                        alert("Yönetici yetkiniz bulunmamaktadır.");
                        firebase.auth().signOut();
                        return;
                    }
                } else if (sessionRole === 'teacher') {
                    const isTeacher = appState.teachers.some(t => t.email === user.email) || data.role === 'teacher';
                    if (!isTeacher) {
                        alert("Öğretmen yetkiniz bulunmamaktadır veya hesabınız henüz onaylanmamıştır.");
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
            if (data.teachers) appState.teachers = data.teachers;
            if (data.teacherApplications) appState.teacherApplications = data.teacherApplications;
            if (data.teacherAlarms) appState.teacherAlarms = data.teacherAlarms;
            if (data.studentProgress) appState.studentProgress = data.studentProgress;
            if (data.packages) appState.packages = data.packages;
            if (data.onlinePackages) appState.onlinePackages = data.onlinePackages;
            if (data.kazanimData) appState.kazanimData = data.kazanimData;
            
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

    db.collection('global').doc('teacherSchedules').get().then(doc => {
        if (doc.exists) {
            teacherSchedules = doc.data().schedules || {};
            // Geylani Hoca (hoca1) için eski 2 günlük öbeği zorla 7 güne çevir
            if (teacherSchedules['hoca1'] && teacherSchedules['hoca1'].length !== 7) {
                teacherSchedules['hoca1'] = getDefaultSchedule();
                db.collection('global').doc('teacherSchedules').set({ schedules: teacherSchedules }, { merge: true });
                localStorage.setItem('mockSchedules', JSON.stringify(teacherSchedules));
            }
        }
    });

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
                alert("Kayıt başarılı!");
                // onAuthStateChanged gerisini halleder
            });
        })
        .catch((error) => { errorEl.innerText = "Kayıt başarısız: " + error.message; });
    }
}

function loginWithGoogle() {
    if (!isFirebaseReady) {
        alert("Firebase bağlantısı yok. Lütfen e-posta ile devam edin.");
        return;
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    const errorEl = document.getElementById('hata-mesaji');
    if(errorEl) errorEl.innerText = "Google'a bağlanılıyor, lütfen açılan pencereden giriş yapın...";
    
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            if(errorEl) errorEl.innerText = "";
            const user = result.user;
            const email = user.email;
            const name = user.displayName || "Belirtilmedi";
            
            // Eğer veritabanında yoksa kullanıcıyı seçili rolle oluştur
            db.collection('users').doc(email).get().then(doc => {
                if (!doc.exists) {
                    db.collection('users').doc(email).set({
                        role: selectedRole || 'student',
                        name: name,
                        profession: "Belirtilmedi",
                        phone: "Belirtilmedi",
                        purchasedPackages: [],
                        progress: {}
                    }).then(() => {
                        // onAuthStateChanged ilgilenecek
                    });
                } else {
                    // Kullanıcı varsa seçtiği rolden bağımsız olarak veritabanındaki rolünü korur
                    // onAuthStateChanged bunu otomatik yönetecek
                }
            });
        })
        .catch((error) => {
            if(errorEl) errorEl.innerText = "Google Girişi Başarısız: " + error.message;
            console.error("Google Auth Hatası:", error);
            if(error.code === 'auth/operation-not-allowed') {
                alert("ÖNEMLİ: Firebase konsolundan 'Authentication > Sign-in method' bölümüne gidip 'Google' girişini aktif (Enable) yapmanız gerekiyor!");
            } else {
                alert("Google girişi sırasında hata oluştu: " + error.message);
            }
        });
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
        const icon = appState.userRole === 'student' ? '<i class="fas fa-user-circle"></i> ' : '';
        const dropdownIcon = appState.userRole === 'student' ? ' <i class="fas fa-chevron-down" style="font-size: 0.8em; margin-left: 5px;"></i>' : '';
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
                    alert("Lütfen adınızı girin.");
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
                    alert("Odaya bağlanırken sunucu engeline takıldı. Firebase kurallarınızı kontrol edin.");
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
    const sections = ['dashboard-section', 'offline-section', 'online-section', 'checkout-section', 'admin-section', 'teacher-section', 'student-profile-section'];
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
    const tabOzel = document.getElementById('tab-ozeldersler');
    
    if (navTabs) {
        if (appState.userRole === 'admin' || appState.userRole === 'teacher') {
            navTabs.style.display = 'none';
        } else {
            navTabs.style.display = 'flex';
        }
    }

    if (tabPaketler && tabOzel) {
        // Reset styles
        tabPaketler.style.borderBottom = '3px solid transparent';
        tabPaketler.style.color = 'rgba(255,255,255,0.8)';
        tabOzel.style.borderBottom = '3px solid transparent';
        tabOzel.style.color = 'rgba(255,255,255,0.8)';
        
        if (viewName === 'offline-list' || viewName === 'active-package') {
            tabPaketler.style.borderBottom = '3px solid white';
            tabPaketler.style.color = 'white';
        } else if (viewName === 'online-section') {
            tabOzel.style.borderBottom = '3px solid white';
            tabOzel.style.color = 'white';
        }
    }

    if (viewName === 'dashboard-section') {
        document.getElementById('dashboard-section').style.display = 'block';
    } else if (viewName === 'student-profile-section') {
        document.getElementById('student-profile-section').style.display = 'block';
        renderStudentProfile();
    } else if (viewName === 'offline-list') {
        document.getElementById('offline-section').style.display = 'block';
        document.getElementById('package-list-area').style.display = 'grid';
        if (typeof updateOfflineSummary === 'function') updateOfflineSummary();
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
        const details = document.getElementById('student-info-details');
        if (details) details.open = !details.open;
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
    const myAllLiveLessons = [...myPendingLessons, ...myApprovedLessons];
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

        <details class="admin-details" id="student-info-details" style="margin-bottom: 20px;">
            <summary class="admin-summary">👤 Detaylı Profil Bilgileri</summary>
            <div class="glass-card" style="margin-top: 15px;">
                <p><strong>Ad Soyad:</strong> ${user.name || 'Belirtilmedi'}</p>
                <p><strong>E-posta:</strong> ${appState.currentUser}</p>
                <p><strong>Telefon:</strong> ${appState.currentUserPhone}</p>
                <p><strong>Meslek:</strong> ${user.profession || 'Belirtilmedi'}</p>
            </div>
        </details>
        
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

            html += `
                <div class="package-card" style="border: 2px solid #20C997; cursor:pointer; flex-direction: column; align-items: stretch;" onclick="startPackage(${pkg.id}, '${pkg.title.replace(/'/g, "\\'")}')">
                    <h3 style="margin-top:0;">${pkg.title}</h3>
                    
                    <div style="margin-top: 15px;">
                        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:5px;">
                            <span>İlerleme: %${progressPercent}</span>
                            <span>Adım: ${labelStep} / ${pkgTotalCount}</span>
                        </div>
                        <div style="width: 100%; background: #e9ecef; border-radius: 4px; height: 8px; overflow: hidden;">
                            <div style="width: ${progressPercent}%; height: 100%; background: #20C997;"></div>
                        </div>
                    </div>
                    ${btnHtml}
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

            html += `
                <div class="package-card" style="border: 2px solid #4facfe; flex-direction: column; align-items: stretch; cursor: default;">
                    <h3 style="margin-top:0; color:#4facfe; font-size:1.1rem;">${lesson.package}</h3>
                    <div style="margin-top: 10px; font-size: 0.9rem;">
                        <p style="margin-bottom: 5px;"><strong>Durum:</strong> ${statusLabel}</p>
                        <p style="margin-bottom: 5px;"><strong>Eğitmen:</strong> ${teacherName}</p>
                        <p style="margin-bottom: 5px;"><strong>Toplam Saat:</strong> ${lesson.slots.length} Saat</p>
                        <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 6px; font-size: 0.8rem; border: 1px solid #eee; max-height: 150px; overflow-y: auto;">
                            <div style="margin-bottom: 8px;"><strong>📅 Ders Programı:</strong></div>
                            ${slotsHtml}
                        </div>
                    </div>
                </div>
            `;
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
async function openLiveClassRoom() {
    const modal = document.getElementById('live-class-modal');
    if(modal) {
        modal.style.display = 'flex';
        
        // Setup local camera first
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            appState.localStream = stream;
            
            // Eğer link ile gelmişse sesi ve görüntüyü baştan kapalı başlat
            if (appState.isInviteMode) {
                stream.getAudioTracks().forEach(track => track.enabled = false);
                stream.getVideoTracks().forEach(track => track.enabled = false);
                
                // İkonları da güncelleyelim (Kırmızı ve üstü çizili yapalım)
                const btnMute = document.getElementById('btn-mute');
                const btnVideo = document.getElementById('btn-video');
                
                const svgMicOff = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:24px;height:24px;"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`;
                const svgVidOff = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:24px;height:24px;"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56"></path></svg>`;
                
                if (btnMute) {
                    btnMute.innerHTML = svgMicOff;
                    btnMute.style.background = '#ff3b30';
                }
                if (btnVideo) {
                    btnVideo.innerHTML = svgVidOff;
                    btnVideo.style.background = '#ff3b30';
                }
                
                // Avatar göster, kamerayı gizle
                const localBox = document.getElementById('local-box');
                const localAvatar = document.getElementById('local-avatar');
                if (localBox) localBox.classList.add('camera-off');
                if (localAvatar) localAvatar.style.display = 'flex';
            }
            
            const videoElement = document.getElementById('local-video');
            if(videoElement) {
                videoElement.srcObject = stream;
            }
            document.getElementById('live-wait-msg').style.display = 'block';
        } catch (err) {
            console.error("Kamera izni reddedildi veya hata oluştu", err);
            // alert("Kamera veya mikrofona erişilemiyor. Sadece izleyici olarak katılıyorsunuz.");
            document.getElementById('live-wait-msg').innerHTML = '<p style="color: #ff3b30; font-size: 1.2rem; font-weight: bold;">Sadece İzleyici Modu</p>';
        }

        // WebRTC Başlat (Kamera olsa da olmasa da odaya gir)
        const urlParams = new URLSearchParams(window.location.search);
        const urlRoomId = urlParams.get('liveRoom');
        
        if (urlRoomId) {
            // Linkle gelen kişi (Öğrenci)
            appState.activeRoomId = urlRoomId;
            if (document.getElementById('live-wait-msg').innerHTML.includes('Sadece İzleyici Modu')) {
                document.getElementById('live-wait-msg').innerHTML += '<p style="color: #20C997; font-size: 0.9rem;">Öğretmene Bağlanılıyor...</p>';
            } else {
                document.getElementById('live-wait-msg').innerHTML = '<p style="color: #20C997; font-size: 1.2rem; font-weight: bold;">Öğretmene Bağlanılıyor...</p>';
            }
            
            // Ekran paylaşma ve link butonlarını gizle
            const btnScreenContainer = document.getElementById('btn-screen').parentElement;
            if (btnScreenContainer && btnScreenContainer.classList.contains('tooltip-container')) {
                btnScreenContainer.style.display = 'none';
            } else {
                const bs = document.getElementById('btn-screen');
                if (bs) bs.style.display = 'none';
            }
            const btnInvite = document.getElementById('btn-invite');
            if (btnInvite) btnInvite.style.display = 'none';

            if (typeof initWebRTCRoom === 'function') {
                await initWebRTCRoom(urlRoomId, false);
            }
        } else {
            // Öğretmen odayı kendi başlatıyor
            appState.activeRoomId = Math.random().toString(36).substring(2, 10);
            if (!document.getElementById('live-wait-msg').innerHTML.includes('Sadece İzleyici Modu')) {
                document.getElementById('live-wait-msg').innerHTML = '<p style="color: #20C997; font-size: 1.2rem; font-weight: bold;">Öğrenci Bekleniyor...</p>';
            }
            if (typeof initWebRTCRoom === 'function') {
                await initWebRTCRoom(appState.activeRoomId, true);
            }
        }
    }
}

function closeLiveClassRoom() {
    const modal = document.getElementById('live-class-modal');
    if(modal) {
        modal.style.display = 'none';
        
        if(appState.localStream) {
            appState.localStream.getTracks().forEach(track => track.stop());
            appState.localStream = null;
        }
        if(appState.screenStream) {
            appState.screenStream.getTracks().forEach(track => track.stop());
            appState.screenStream = null;
        }
        
        const videoElement = document.getElementById('local-video');
        if(videoElement) videoElement.srcObject = null;
        
        const screenVideoElement = document.getElementById('screen-video');
        if(screenVideoElement) {
            screenVideoElement.srcObject = null;
            screenVideoElement.style.display = 'none';
        }
        
        document.getElementById('live-class-room-container').classList.remove('screen-shared');
        document.getElementById('live-wait-msg').innerHTML = '<p style="font-size: 1.2rem; margin-bottom: 10px;">Kamera Başlatılıyor...</p><p style="color: #aaa; font-size: 0.9rem;">Karşı taraf bekleniyor.</p>';
        
        // Reset fullscreen if active
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        
        // Reset sidebar
        const sidebar = document.getElementById('live-sidebar');
        if(sidebar) {
            sidebar.classList.remove('open');
        }
        
        // Clean up simulation
        if(appState.simTimeout) clearTimeout(appState.simTimeout);
        const grid = document.getElementById('participants-video-container');
        if(grid) grid.innerHTML = '';
        
        // Eğer link ile gelinmişse, geri kalan siteye erişimi engelle
        if (appState.isInviteMode) {
            document.body.innerHTML = `
                <div style="display: flex; height: 100vh; width: 100vw; background: #111; color: white; align-items: center; justify-content: center; flex-direction: column; font-family: 'Inter', sans-serif;">
                    <h1 style="color: #20C997;">Dersten Ayrıldınız</h1>
                    <p style="color: #aaa; margin-top: 10px;">Görüşmek üzere. Bu pencereyi veya sekmeyi kapatabilirsiniz.</p>
                </div>
            `;
        }
    }
}

function toggleMute() {
    const btn = document.getElementById('btn-mute');
    if(appState.localStream) {
        const audioTrack = appState.localStream.getAudioTracks()[0];
        if(audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            const svgOn = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:24px;height:24px;"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`;
            const svgOff = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:24px;height:24px;"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`;
            
            btn.innerHTML = audioTrack.enabled ? svgOn : svgOff;
            btn.style.background = audioTrack.enabled ? 'rgba(255,255,255,0.2)' : '#ff3b30';
            
            if (appState.pipWindow) {
                const pipBtn = appState.pipWindow.document.getElementById('pip-btn-mute');
                if (pipBtn) {
                    pipBtn.innerHTML = btn.innerHTML;
                    pipBtn.style.background = btn.style.background;
                }
            }
        }
    }
}

function toggleVideo() {
    const btn = document.getElementById('btn-video');
    const localBox = document.getElementById('local-box');
    const localAvatar = document.getElementById('local-avatar');

    if(appState.localStream) {
        const videoTrack = appState.localStream.getVideoTracks()[0];
        if(videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            const svgOn = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:24px;height:24px;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`;
            const svgOff = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:24px;height:24px;"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56"></path></svg>`;

            btn.innerHTML = videoTrack.enabled ? svgOn : svgOff;
            btn.style.background = videoTrack.enabled ? 'rgba(255,255,255,0.2)' : '#ff3b30';

            if(localBox) {
                if(videoTrack.enabled) {
                    localBox.classList.remove('camera-off');
                    if(localAvatar) localAvatar.style.display = 'none';
                } else {
                    localBox.classList.add('camera-off');
                    if(localAvatar) localAvatar.style.display = 'flex';
                }
            }

            if (appState.pipWindow) {
                const pipBtn = appState.pipWindow.document.getElementById('pip-btn-video');
                if (pipBtn) {
                    pipBtn.innerHTML = btn.innerHTML;
                    pipBtn.style.background = btn.style.background;
                }
            }
        }
    }
}

async function openPiPWindow() {
    if (!('documentPictureInPicture' in window)) {
        console.warn('Document Picture-in-Picture API is not supported in this browser.');
        return;
    }

    try {
        const pipWindow = await window.documentPictureInPicture.requestWindow({
            width: 350,
            height: 220
        });

        appState.pipWindow = pipWindow;

        // Copy styles to the PiP window (essential for rendering buttons nicely)
        [...document.styleSheets].forEach((styleSheet) => {
            try {
                const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
                const style = document.createElement('style');
                style.textContent = cssRules;
                pipWindow.document.head.appendChild(style);
            } catch (e) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.type = styleSheet.type;
                link.media = styleSheet.media;
                link.href = styleSheet.href;
                pipWindow.document.head.appendChild(link);
            }
        });

        // Add Google Fonts
        const linkFonts = document.createElement('link');
        linkFonts.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Marhey:wght@400;600;700&display=swap";
        linkFonts.rel = "stylesheet";
        pipWindow.document.head.appendChild(linkFonts);

        // Build PiP HTML
        pipWindow.document.body.style.margin = "0";
        pipWindow.document.body.style.display = "flex";
        pipWindow.document.body.style.flexDirection = "column";
        pipWindow.document.body.style.alignItems = "center";
        pipWindow.document.body.style.justifyContent = "center";
        pipWindow.document.body.style.background = "#1a1a1a";
        pipWindow.document.body.style.fontFamily = "'Inter', sans-serif";
        pipWindow.document.body.style.padding = "10px";

        // Video Grid
        const pipVideoGrid = document.createElement('div');
        pipVideoGrid.style.display = "flex";
        pipVideoGrid.style.gap = "10px";
        pipVideoGrid.style.width = "100%";
        pipVideoGrid.style.justifyContent = "center";
        pipVideoGrid.style.alignItems = "center";
        pipVideoGrid.style.marginBottom = "15px";

        if (appState.localStream) {
            // Local Video
            const localVidBox = document.createElement('div');
            localVidBox.className = "participant-box";
            localVidBox.style.width = "140px";
            localVidBox.style.height = "100px";
            localVidBox.style.position = "relative";
            localVidBox.style.borderRadius = "8px";
            localVidBox.style.overflow = "hidden";
            
            const localVid = document.createElement('video');
            localVid.autoplay = true;
            localVid.muted = true;
            localVid.playsInline = true;
            localVid.srcObject = appState.localStream;
            localVid.style.width = "100%";
            localVid.style.height = "100%";
            localVid.style.objectFit = "cover";
            localVidBox.appendChild(localVid);
            
            const localLabel = document.createElement('div');
            localLabel.className = "participant-label";
            localLabel.innerText = "Siz";
            localLabel.style.fontSize = "0.7rem";
            localLabel.style.bottom = "5px";
            localLabel.style.left = "5px";
            localVidBox.appendChild(localLabel);
            
            pipVideoGrid.appendChild(localVidBox);
            
            // Remote Video (Simulation)
            const remoteVidBox = document.createElement('div');
            remoteVidBox.className = "participant-box";
            remoteVidBox.style.width = "140px";
            remoteVidBox.style.height = "100px";
            remoteVidBox.style.position = "relative";
            remoteVidBox.style.borderRadius = "8px";
            remoteVidBox.style.overflow = "hidden";

            const remoteVid = document.createElement('video');
            remoteVid.autoplay = true;
            remoteVid.muted = true;
            remoteVid.playsInline = true;
            remoteVid.srcObject = appState.localStream; // Simulate remote
            remoteVid.style.width = "100%";
            remoteVid.style.height = "100%";
            remoteVid.style.objectFit = "cover";
            remoteVid.style.transform = "scaleX(-1)";
            remoteVid.style.filter = "hue-rotate(180deg) brightness(0.8) contrast(1.2)";
            remoteVidBox.appendChild(remoteVid);
            
            const remoteLabel = document.createElement('div');
            remoteLabel.className = "participant-label";
            remoteLabel.innerText = "Öğrenci";
            remoteLabel.style.fontSize = "0.7rem";
            remoteLabel.style.bottom = "5px";
            remoteLabel.style.left = "5px";
            remoteVidBox.appendChild(remoteLabel);
            
            pipVideoGrid.appendChild(remoteVidBox);
        }

        pipWindow.document.body.appendChild(pipVideoGrid);

        const container = document.createElement('div');
        container.style.display = "flex";
        container.style.gap = "15px";
        
        // Mute button
        const btnMute = document.createElement('button');
        btnMute.id = "pip-btn-mute";
        btnMute.className = "live-class-btn";
        btnMute.style.position = "relative";
        btnMute.innerHTML = document.getElementById('btn-mute').innerHTML;
        btnMute.style.background = document.getElementById('btn-mute').style.background || "rgba(255,255,255,0.2)";
        btnMute.onclick = () => {
            toggleMute(); // calls main window function
        };

        // Video button
        const btnVideo = document.createElement('button');
        btnVideo.id = "pip-btn-video";
        btnVideo.className = "live-class-btn";
        btnVideo.style.position = "relative";
        btnVideo.innerHTML = document.getElementById('btn-video').innerHTML;
        btnVideo.style.background = document.getElementById('btn-video').style.background || "rgba(255,255,255,0.2)";
        btnVideo.onclick = () => {
            toggleVideo(); // calls main window function
        };

        // Stop Share button
        const btnStopShare = document.createElement('button');
        btnStopShare.className = "live-class-btn";
        btnStopShare.style.background = "#ff3b30";
        btnStopShare.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:24px;height:24px;"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`;
        btnStopShare.title = "Paylaşımı Durdur";
        btnStopShare.onclick = () => {
            stopScreenShare();
        };

        container.appendChild(btnMute);
        container.appendChild(btnVideo);
        container.appendChild(btnStopShare);

        pipWindow.document.body.appendChild(container);

        // Handle PiP close event
        pipWindow.addEventListener("pagehide", (event) => {
            appState.pipWindow = null;
        });

    } catch (e) {
        console.error('Failed to open PiP window:', e);
    }
}

async function toggleScreenShare() {
    const roomContainer = document.getElementById('live-class-room-container');
    const screenVideo = document.getElementById('screen-video');
    const btnScreen = document.getElementById('btn-screen');

    if (!appState.screenStream) {
        // Tarayıcının "Kullanıcı Etkileşimi" jetonunu kaybetmemek için PiP'yi hemen açıyoruz
        let pipOpened = false;
        if ('documentPictureInPicture' in window && !appState.pipWindow) {
            openPiPWindow(); // async, starts immediately
            pipOpened = true;
        }

        try {
            let stream;
            try {
                // Tarayıcıya 'Pencereler' sekmesini öncelikli göstermesi için ipucu veriyoruz
                stream = await navigator.mediaDevices.getDisplayMedia({ 
                    video: { displaySurface: 'window' }, 
                    selfBrowserSurface: 'exclude' 
                });
            } catch (e) {
                console.warn("selfBrowserSurface desteklenmiyor, varsayılan ayarlarla deneniyor", e);
                stream = await navigator.mediaDevices.getDisplayMedia({ 
                    video: { displaySurface: 'window' } 
                });
            }
            appState.screenStream = stream;
            
            // Ekran videolarını yerel olarak göster
            screenVideo.srcObject = stream;
            screenVideo.style.display = 'block';
            roomContainer.classList.add('screen-shared');
            
            btnScreen.style.background = '#ff3b30';

            // WebRTC ile karşı tarafa gönder
            if (typeof peerConnection !== 'undefined' && peerConnection && peerConnection.getSenders) {
                const sender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
                if (sender) {
                    sender.replaceTrack(stream.getVideoTracks()[0]);
                }
            }

            // Ekran paylaşımı tarayıcıdan durdurulursa yakalayalım
            stream.getVideoTracks()[0].onended = () => {
                stopScreenShare();
            };
        } catch (err) {
            console.error("Ekran paylaşımı reddedildi veya hata oluştu", err);
            // Kullanıcı pencere seçmekten vazgeçerse açtığımız PiP'i geri kapatalım
            if (appState.pipWindow) {
                appState.pipWindow.close();
                appState.pipWindow = null;
            }
        }
    } else {
        stopScreenShare();
    }
}

function stopScreenShare() {
    const roomContainer = document.getElementById('live-class-room-container');
    const screenVideo = document.getElementById('screen-video');
    const btnScreen = document.getElementById('btn-screen');

    if (appState.screenStream) {
        appState.screenStream.getTracks().forEach(track => track.stop());
        appState.screenStream = null;
    }
    
    screenVideo.srcObject = null;
    screenVideo.style.display = 'none';
    roomContainer.classList.remove('screen-shared');
    btnScreen.style.background = 'rgba(32,201,151,0.8)';

    // WebRTC ekran paylaşımı iptali, kameraya dön
    if (typeof peerConnection !== 'undefined' && peerConnection && peerConnection.getSenders && appState.localStream) {
        const sender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) {
            sender.replaceTrack(appState.localStream.getVideoTracks()[0]);
        }
    }

    if (appState.pipWindow) {
        appState.pipWindow.close();
        appState.pipWindow = null;
    }
}

function generateInviteLink() {
    if (!appState.activeRoomId) {
        alert("Lütfen önce canlı dersi başlatın (veya sisteme bağlanmasını bekleyin).");
        return;
    }
    const inviteLink = window.location.origin + window.location.pathname + "?liveRoom=" + appState.activeRoomId;
    
    navigator.clipboard.writeText(inviteLink).then(() => {
        const toast = document.getElementById("toast-message");
        if(toast) {
            toast.className = "toast-message show";
            setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
        }
    }).catch(err => {
        console.error('Panoya kopyalama başarısız', err);
        alert("Link kopyalanamadı: " + inviteLink);
    });
}

function toggleFullScreen() {
    const modalContent = document.getElementById('live-modal-content');
    if (modalContent) {
        modalContent.classList.toggle('maximized');
    }
}

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
                <button onclick="ejectRemoteParticipant()" style="background:#ff3b30; border:none; color:white; border-radius:4px; padding:2px 5px; cursor:pointer; font-size:0.7rem;" id="btn-remote-eject" title="Odadan At">🚪</button>
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
            ? `<span class="badge badge-success" style="margin-left: 10px; font-size: 0.75rem;">✓ Sahipsiniz</span>`
            : ``;

        const checkIconClass = isSelected ? 'fas fa-check-circle' : 'far fa-circle';

        card.style.display = "flex";
        card.style.alignItems = "center";
        card.style.padding = "15px 20px";
        card.style.cursor = "pointer";
        card.style.border = isSelected ? "2px solid #20C997" : "1px solid #eee";

        card.innerHTML = `
            <div style="margin-right: 15px; font-size: 1.5rem; color: ${isSelected ? '#20C997' : '#ccc'};">
                <i class="${checkIconClass}"></i>
            </div>
            <div style="flex: 1;">
                <h4 style="margin: 0; font-size: 1.1rem; color: #333; display: flex; align-items: center;">
                    ${pkg.title} ${statusBadge}
                </h4>
            </div>
            <div style="margin-right: 15px; font-weight: bold; color: #F39C12; font-size: 1.2rem;">
                ${pkg.price} ₺
            </div>
            <div onclick="if(${isPurchased}) { startPackage(${pkg.id}, '${pkg.title.replace(/'/g, "\\'")}'); } else { openPackageModal('offline', ${pkg.id}); } event.stopPropagation();" title="${isPurchased ? 'Derse Devam Et' : 'Paket Detayları'}" style="padding: 6px 14px; font-size: 0.85rem; font-weight: bold; background: rgba(79, 172, 254, 0.1); color: #4facfe; border: 1px solid rgba(79, 172, 254, 0.4); border-radius: 20px; cursor: pointer; transition: 0.2s; white-space: nowrap; flex-shrink: 0;" onmouseover="this.style.background='#4facfe'; this.style.color='white';" onmouseout="this.style.background='rgba(79, 172, 254, 0.1)'; this.style.color='#4facfe';">
                ${isPurchased ? '▶ Devam Et' : 'Detaylar'}
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
        let saved = progressObj[packageId] || 1;
        
        const pkgData = appState.kazanimData[packageId] || { total: 40 };
        appState.totalKazanimCount = pkgData.total;
        
        if (saved > appState.totalKazanimCount) {
            // Restarting a completed package
            saved = 1;
            if(appState.stepResults) appState.stepResults[packageId] = {};
            if (!appState.studentProgress["self"]) appState.studentProgress["self"] = {};
            if (!appState.studentProgress["self"][appState.currentUser]) appState.studentProgress["self"][appState.currentUser] = {};
            appState.studentProgress["self"][appState.currentUser][packageId] = 1;
            saveStudentData();
        }
        
        appState.currentKazanim = saved;
        
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
    
    let html = '';

    // 1. ÖZEL DERS SEÇENEĞİ (SABİT OLARAK EN ÜSTTE)
    const isCustomSelected = appState.selectedOnlinePackages.find(x => x.id === 100);
    const customCount = appState.customLessonCount || 0;
    const customPrice = customCount * 400;
    const customTopic = appState.customLessonTopic || '';

    html += `
    <div class="glass-card online-package-card ${isCustomSelected ? 'selected' : ''}" onclick="selectCustomOnlinePackage(this)" style="display:flex; align-items:center; flex-wrap: wrap; gap: 15px; margin-bottom: 20px; border-color: #F39C12;">
        <div style="margin-right: 5px; font-size: 1.5rem; color: #F39C12;">
            <i class="far ${isCustomSelected ? 'fa-check-circle' : 'fa-circle'}" id="pkg-icon-custom"></i>
        </div>
        <div class="online-package-info" style="flex:1; min-width: 250px;">
            <h4 style="color: #F39C12;">🌟 Özel Ders Talep Et</h4>
            <input type="text" id="custom-lesson-topic" placeholder="İstediğiniz konuyu yazınız" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #ccc; margin-top: 5px;" value="${customTopic}" onclick="event.stopPropagation()" oninput="updateCustomTopic(this.value)">
        </div>
        <div style="display: flex; align-items: center; gap: 10px; background: #f8f9fa; padding: 5px 10px; border-radius: 8px; border: 1px solid #eee;" onclick="event.stopPropagation()">
            <div style="font-size: 0.8rem; color: #666; text-align: right; margin-right: 5px;">Ders Sayısı</div>
            <button class="btn btn-sm" style="background: #e9ecef; border: none; font-size: 1.2rem; padding: 0 10px;" onclick="changeCustomLessonCount(-1)">-</button>
            <span id="custom-lesson-count" style="font-size: 1.2rem; font-weight: bold; width: 20px; text-align: center;">${customCount}</span>
            <button class="btn btn-sm" style="background: #e9ecef; border: none; font-size: 1.2rem; padding: 0 10px;" onclick="changeCustomLessonCount(1)">+</button>
        </div>
        <div class="online-package-price" style="min-width: 100px; text-align: right; color: #F39C12;">
            <span id="custom-lesson-price">${customPrice}</span> ₺
        </div>
    </div>
    `;

    // 2. DİĞER STANDART PAKETLER
    html += appState.onlinePackages.map(p => {
        const isSelected = appState.selectedOnlinePackages.find(x => x.id === p.id);
        
        // Bu paket daha önce alınmış mı veya devam eden bir ders var mı?
        const isPurchased = appState.purchasedPackages.includes(p.id) || 
                            appState.pendingLessons.some(l => l.package.includes(p.name)) || 
                            appState.approvedLessons.some(l => l.package.includes(p.name) && l.studentEmail === appState.currentUser);

        const disabledStyle = isPurchased ? "opacity: 0.5; pointer-events: none; filter: grayscale(1);" : "";
        const purchasedBadge = isPurchased ? `<div style="font-size:0.75rem; color:#dc3545; font-weight:bold; margin-top:5px;">Devam Eden / Satın Alınmış Ders</div>` : "";

        const checkIconClass = isSelected ? 'fas fa-check-circle' : 'far fa-circle';

        return `
        <div class="glass-card online-package-card ${isSelected ? 'selected' : ''}" onclick="${isPurchased ? '' : `selectOnlinePackage(${p.id}, this)`}" style="display:flex; align-items:center; padding: 15px 20px; cursor: pointer; border: ${isSelected ? '2px solid #20C997' : '1px solid #eee'}; ${disabledStyle}">
            <div style="margin-right: 15px; font-size: 1.5rem; color: ${isSelected ? '#20C997' : '#ccc'};">
                <i class="${checkIconClass}" id="pkg-icon-${p.id}"></i>
            </div>
            <div style="flex: 1;">
                <h4 style="margin: 0; font-size: 1.1rem; color: #333; display: flex; align-items: center;">
                    ${p.name} ${purchasedBadge}
                </h4>
            </div>
            <div style="margin-right: 15px; font-weight: bold; color: #F39C12; font-size: 1.2rem;">
                ${(p.price || 0).toLocaleString('tr-TR')} ₺
            </div>
            <div onclick="openPackageModal('online', ${p.id}); event.stopPropagation();" title="Paket Detayları" style="padding: 6px 14px; font-size: 0.85rem; font-weight: bold; background: rgba(79, 172, 254, 0.1); color: #4facfe; border: 1px solid rgba(79, 172, 254, 0.4); border-radius: 20px; cursor: pointer; transition: 0.2s; white-space: nowrap; flex-shrink: 0;" onmouseover="this.style.background='#4facfe'; this.style.color='white';" onmouseout="this.style.background='rgba(79, 172, 254, 0.1)'; this.style.color='#4facfe';">
                Detaylar
            </div>
        </div>`
    }).join('');

    listEl.innerHTML = html;
}

window.openPackageModal = function(type, id) {
    const modal = document.getElementById('package-info-modal');
    const titleEl = document.getElementById('modal-pkg-title');
    const priceEl = document.getElementById('modal-pkg-price');
    const footerEl = document.getElementById('modal-pkg-footer');
    const containerEl = document.getElementById('modal-pkg-details-container');
    
    if (!modal || !titleEl || !priceEl || !containerEl || !footerEl) return;
    
    let html = '';
    let footerHtml = `<button class="btn btn-secondary" onclick="closePackageModal()" style="width: 100%;">Kapat</button>`;
    
    if (type === 'offline') {
        const pkg = appState.packages.find(p => p.id === id);
        if (!pkg) return;
        
        const isPurchased = appState.purchasedPackages.includes(id);
        
        if (isPurchased) {
            footerHtml = `
                <button class="btn btn-secondary" onclick="closePackageModal()" style="width: 50%;">Kapat</button>
                <button class="btn btn-success" onclick="closePackageModal(); startPackage(${pkg.id}, '${pkg.title.replace(/'/g, "\\'")}');" style="width: 50%;">▶ Derse Devam Et</button>
            `;
        }
        
        titleEl.innerText = pkg.title;
        priceEl.innerText = pkg.price + ' ₺';
        
        html += `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
            <div style="background: rgba(0,0,0,0.02); padding: 15px; border-radius: 12px; border: 1px solid #f0f0f0;">
                <div style="font-weight: bold; color: #555; margin-bottom: 8px; font-size: 1.1rem;">⏳ Eğitim Süresi</div>
                <div style="color: #333; font-size: 1.05rem;">${pkg.duration} Saat</div>
            </div>
        `;
        
        if (pkg.target) {
            html += `
            <div style="background: rgba(0,0,0,0.02); padding: 15px; border-radius: 12px; border: 1px solid #f0f0f0;">
                <div style="font-weight: bold; color: #555; margin-bottom: 8px; font-size: 1.1rem;">🎯 Hedef Kazanım</div>
                <div style="color: #333; line-height: 1.5;">${pkg.target}</div>
            </div>`;
        }

        html += `
            <div style="background: rgba(0,0,0,0.02); padding: 15px; border-radius: 12px; border: 1px solid #f0f0f0; grid-column: 1 / -1;">
                <div style="font-weight: bold; color: #555; margin-bottom: 8px; font-size: 1.1rem;">📝 Açıklama</div>
                <div style="color: #333; line-height: 1.6;">${pkg.description}</div>
            </div>
        `;
        
        if (pkg.requirements && pkg.requirements.length > 0) {
            html += `
            <div style="background: rgba(0,0,0,0.02); padding: 15px; border-radius: 12px; border: 1px solid #f0f0f0; grid-column: 1 / -1;">
                <div style="font-weight: bold; color: #555; margin-bottom: 8px; font-size: 1.1rem;">✅ Gereklilikler</div>
                <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">`;
            pkg.requirements.forEach(req => {
                html += `<li>${req}</li>`;
            });
            html += `</ul></div>`;
        }
        
        html += `</div>`;
        
    } else if (type === 'online') {
        const p = appState.onlinePackages.find(x => x.id === id);
        if (!p) return;
        
        titleEl.innerText = p.name;
        priceEl.innerText = (p.price || 0).toLocaleString('tr-TR') + ' ₺';
        
        html += `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
            <div style="background: rgba(0,0,0,0.02); padding: 15px; border-radius: 12px; border: 1px solid #f0f0f0;">
                <div style="font-weight: bold; color: #555; margin-bottom: 8px; font-size: 1.1rem;">⏳ Ders Saati</div>
                <div style="color: #333; font-size: 1.05rem;">${p.hours} Saat (⏱️ 40dk)</div>
            </div>
            
            <div style="background: rgba(0,0,0,0.02); padding: 15px; border-radius: 12px; border: 1px solid #f0f0f0;">
                <div style="font-weight: bold; color: #555; margin-bottom: 8px; font-size: 1.1rem;">📚 Kullanılacak Materyal</div>
                <div style="color: #333; line-height: 1.5;">${p.material}</div>
            </div>
            
            <div style="background: rgba(0,0,0,0.02); padding: 15px; border-radius: 12px; border: 1px solid #f0f0f0; grid-column: 1 / -1;">
                <div style="font-weight: bold; color: #555; margin-bottom: 8px; font-size: 1.1rem;">📝 Açıklama</div>
                <div style="color: #333; line-height: 1.6;">${p.desc}</div>
            </div>
        </div>
        `;
    }
    
    containerEl.innerHTML = html;
    footerEl.innerHTML = footerHtml;
    modal.style.display = 'flex';
};

window.closePackageModal = function() {
    const modal = document.getElementById('package-info-modal');
    if (modal) modal.style.display = 'none';
};

window.changeCustomLessonCount = function(delta) {
    let count = appState.customLessonCount || 0;
    count += delta;
    if (count < 0) count = 0;
    appState.customLessonCount = count;
    
    document.getElementById('custom-lesson-count').innerText = count;
    document.getElementById('custom-lesson-price').innerText = count * 400;
    
    // Eğer paket seçiliyse, sepet fiyatını güncelle
    const index = appState.selectedOnlinePackages.findIndex(x => x.id === 100);
    if (index > -1) {
        if (count === 0) {
            // Sıfırlandıysa paketi seçilenlerden çıkar
            appState.selectedOnlinePackages.splice(index, 1);
            renderOnlinePackages();
        } else {
            appState.selectedOnlinePackages[index].price = count * 400;
            appState.selectedOnlinePackages[index].hours = `${count} Saat Özel Ders`;
            appState.selectedOnlinePackages[index].name = `Özel Ders: ${appState.customLessonTopic || 'Belirtilmedi'}`;
        }
    } else if (count > 0) {
        // Sıfırdan yukarı çıktıysa otomatik seç
        selectCustomOnlinePackage();
    }
    
    const liveTotalEl = document.getElementById('step1-live-total');
    if (liveTotalEl) {
        const total = appState.selectedOnlinePackages.reduce((sum, p) => sum + p.price, 0);
        liveTotalEl.innerHTML = `Ara Toplam: ${total.toLocaleString('tr-TR')} ₺`;
    }
};

window.updateCustomTopic = function(val) {
    appState.customLessonTopic = val;
    const index = appState.selectedOnlinePackages.findIndex(x => x.id === 100);
    if (index > -1) {
        appState.selectedOnlinePackages[index].name = `Özel Ders: ${val || 'Belirtilmedi'}`;
    }
};

window.selectCustomOnlinePackage = function(el) {
    let count = appState.customLessonCount || 0;
    
    const index = appState.selectedOnlinePackages.findIndex(x => x.id === 100);
    
    if (index > -1) {
        // Eğer zaten seçiliyse çıkar
        appState.selectedOnlinePackages.splice(index, 1);
        renderOnlinePackages();
    } else {
        // Seçili değilse ekle
        if (count === 0) {
            count = 1;
            appState.customLessonCount = 1;
        }
        
        const topic = appState.customLessonTopic || 'Belirtilmedi';
        appState.selectedOnlinePackages.push({
            id: 100,
            name: `Özel Ders: ${topic}`,
            price: count * 400,
            hours: `${count} Saat Özel Ders`,
            desc: "İsteğe özel birebir canlı ders",
            isCustom: true
        });
        renderOnlinePackages();
    }
    
    const liveTotalEl = document.getElementById('step1-live-total');
    if (liveTotalEl) {
        const total = appState.selectedOnlinePackages.reduce((sum, p) => sum + p.price, 0);
        liveTotalEl.innerHTML = `Ara Toplam: ${total.toLocaleString('tr-TR')} ₺`;
    }
};

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
        const customPkg = appState.selectedOnlinePackages.find(p => p.id === 100);
        if (customPkg) {
            const topic = (appState.customLessonTopic || '').trim();
            if (!topic || topic === 'Belirtilmedi') {
                showCustomAlert('Lütfen Özel Ders için hangi konuda eğitim almak istediğinizi yazınız.');
                return;
            }
        }

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
            step2.style.maxHeight = "3000px";
            
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
    if (step1) {
        if (step1.style.maxHeight === "3000px") {
            // Zaten açıksa daralt
            if (appState.selectedOnlinePackages.length > 0) {
                checkOnlineStep1(); // Seçim varsa tamamla mantığı çalışsın
            } else {
                step1.style.maxHeight = "70px";
                step1.style.opacity = "0.8";
            }
        } else {
            // Kapalıysa aç
            step1.style.maxHeight = "3000px";
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
        if (step2.style.maxHeight === "3000px") {
            // Daralt
            step2.style.maxHeight = "70px";
            step2.style.opacity = "0.8";
        } else {
            // Aç
            step2.style.maxHeight = "3000px";
            step2.style.opacity = "1";
            
            // "eğitmen kısmına basınca paketler kapansın"
            if (step1 && step1.style.maxHeight === "3000px") {
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
    let maxAllowed = 0;
    appState.selectedOnlinePackages.forEach(p => {
        if (p.id === 100) {
            maxAllowed += (appState.customLessonCount || 0);
        } else if (p.hours) {
            const match = p.hours.match(/(\d+)/);
            if (match) maxAllowed += parseInt(match[1]);
        }
    });

    if (maxAllowed > 0 && appState.selectedSlots.length !== maxAllowed) {
        showCustomAlert(`Lütfen takvimden tam olarak ${maxAllowed} ders saati seçin. (Şu an ${appState.selectedSlots.length} seçili)`);
        return;
    }

    if (appState.selectedSlots.length > 0) {
        const step2 = document.getElementById('online-step-2');
        const step3 = document.getElementById('online-step-3');
        if (step2 && step3) {
            step2.style.maxHeight = "70px"; 
            step2.style.opacity = "0.8";

            step3.style.opacity = "1";
            step3.style.pointerEvents = "auto";
            step3.style.maxHeight = "3000px";
        }
    } else {
        alert("Lütfen takvimden yeşil renkli en az bir ders saati seçin.");
    }
}

function editOnlineStep3() {
    const step2 = document.getElementById('online-step-2');
    const step3 = document.getElementById('online-step-3');
    if (step3) {
        if (step3.style.maxHeight === "3000px") {
            // Daralt
            step3.style.maxHeight = "70px";
            step3.style.opacity = "0.8";
        } else {
            // Aç
            if (appState.selectedSlots.length === 0) {
                alert("Lütfen önce takvimden saat seçimi yapınız.");
                return;
            }
            step3.style.maxHeight = "3000px";
            step3.style.opacity = "1";
            if(step2) {
                step2.style.maxHeight = "70px";
                step2.style.opacity = "0.8";
            }
        }
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
        renderWeekNavigation();
        renderCalendar(); 
    }
}

function generate3MonthWeeks() {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const startMonth = today.getMonth();
    const startYear = today.getFullYear();
    const firstOfMonth = new Date(startYear, startMonth, 1);
    
    const currentDay = firstOfMonth.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const startMonday = new Date(firstOfMonth);
    startMonday.setDate(firstOfMonth.getDate() + distanceToMonday);
    
    const weeks = [];
    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    
    const todayDay = today.getDay();
    const todayDist = todayDay === 0 ? -6 : 1 - todayDay;
    const currentWeekMonday = new Date(today);
    currentWeekMonday.setDate(today.getDate() + todayDist);
    currentWeekMonday.setHours(0,0,0,0);

    const targetMonth = (startMonth + 4) % 12;
    const targetYear = startYear + Math.floor((startMonth + 4) / 12);

    let i = 0;
    while(true) {
        let monday = new Date(startMonday);
        monday.setDate(startMonday.getDate() + (i * 7));
        
        let thursday = new Date(monday);
        thursday.setDate(monday.getDate() + 3);
        
        if (thursday.getFullYear() > targetYear || (thursday.getFullYear() === targetYear && thursday.getMonth() >= targetMonth)) {
            break;
        }
        
        let monthName = monthNames[thursday.getMonth()];
        let year = thursday.getFullYear();
        
        const days = [];
        const dayNames = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
        for(let d=0; d<7; d++) {
            let curDay = new Date(monday);
            curDay.setDate(monday.getDate() + d);
            days.push({
                dateObj: curDay,
                dateString: `${curDay.getDate()} ${monthNames[curDay.getMonth()].substring(0,3)}`,
                fullDateString: `${curDay.getDate()} ${monthNames[curDay.getMonth()]} ${curDay.getFullYear()} ${dayNames[d]}`,
                dayName: dayNames[d]
            });
        }
        
        let isPast = monday < currentWeekMonday;
        let isCurrent = monday.getTime() === currentWeekMonday.getTime();
        
        weeks.push({
            monthName,
            year,
            days,
            isPast,
            isCurrent
        });
        
        i++;
        if (i > 30) break; 
    }
    
    appState.calendarWeeks = weeks;
    appState.selectedWeekIndex = weeks.findIndex(w => w.isCurrent) !== -1 ? weeks.findIndex(w => w.isCurrent) : 0;
}

window.expandMonth = function(monthName) {
    appState.expandedMonth = monthName;
    renderWeekNavigation();
};

function renderWeekNavigation() {
    const navContainer = document.getElementById('calendar-week-nav');
    if (!navContainer) return;
    
    if (!appState.calendarWeeks || appState.calendarWeeks.length === 0) {
        generate3MonthWeeks();
    }
    
    const monthsMap = [];
    appState.calendarWeeks.forEach((week, index) => {
        let lastMonth = monthsMap[monthsMap.length - 1];
        if (!lastMonth || lastMonth.name !== week.monthName) {
            monthsMap.push({
                name: week.monthName,
                weeks: [{ index, isPast: week.isPast, isCurrent: week.isCurrent }]
            });
        } else {
            lastMonth.weeks.push({ index, isPast: week.isPast, isCurrent: week.isCurrent });
        }
    });

    // Varsayılan olarak seçili haftanın ayını açık tut
    if (!appState.expandedMonth) {
        const activeWeek = appState.calendarWeeks[appState.selectedWeekIndex];
        appState.expandedMonth = activeWeek ? activeWeek.monthName : monthsMap[0].name;
    }

    let html = `<div style="display: flex; justify-content: flex-start; gap: 15px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 15px; user-select: none; scrollbar-width: thin;">`;
    
    monthsMap.forEach(m => {
        const isMonthActive = m.weeks.some(w => w.index === appState.selectedWeekIndex);
        const isExpanded = appState.expandedMonth === m.name;
        
        const monthColor = isMonthActive ? '#F39C12' : '#1f5f99';
        const monthScale = isMonthActive ? 'scale(1.1)' : 'scale(1)';
        const fontWeight = isExpanded ? '900' : 'bold';
        const opacity = isExpanded ? '1' : '0.6';
        
        html += `<div style="display: flex; flex-direction: column; align-items: center; min-width: max-content; cursor: pointer; opacity: ${opacity}; transition: 0.3s;" onclick="expandMonth('${m.name}')">
            <div style="font-weight: ${fontWeight}; color: ${monthColor}; margin-bottom: 8px; font-size: 1rem; transform: ${monthScale}; transition: 0.2s;">
                ${m.name} ${isExpanded ? '▾' : '▸'}
            </div>`;
            
        if (isExpanded) {
            html += `<div style="display: flex; gap: 6px; animation: fadeIn 0.3s ease;">`;
            m.weeks.forEach(w => {
                const isSelected = appState.selectedWeekIndex === w.index;
                let bgColor = w.isPast ? '#e0e0e0' : (isSelected ? '#F39C12' : '#4facfe');
                let cursor = w.isPast ? 'not-allowed' : 'pointer';
                let weekOpacity = w.isPast ? '0.5' : (isSelected ? '1' : '0.8');
                let clickAttr = w.isPast ? '' : `onclick="event.stopPropagation(); selectCalendarWeek(${w.index})"`;
                let transform = isSelected ? 'scale(1.15)' : 'scale(1)';
                
                html += `<div style="width: 35px; height: 8px; border-radius: 4px; background: ${bgColor}; cursor: ${cursor}; opacity: ${weekOpacity}; transform: ${transform}; transition: 0.2s; margin: 4px 0;" ${clickAttr} title="${w.isPast ? 'Geçmiş Hafta' : 'Haftayı Seç'}"></div>`;
            });
            html += `</div>`;
        } else {
            // Açık değilken sadece ince bir çizgi göster veya tamamen gizle
            html += `<div style="width: 20px; height: 4px; border-radius: 2px; background: #ccc; margin: 6px 0;"></div>`;
        }
        
        html += `</div>`;
    });
    
    html += `</div>`;
    navContainer.innerHTML = html;
}

window.selectCalendarWeek = function(index) {
    if (appState.calendarWeeks[index].isPast) return;
    appState.selectedWeekIndex = index;
    renderWeekNavigation();
    renderCalendar();
};

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
    
    if (!appState.calendarWeeks || appState.calendarWeeks.length === 0) {
        generate3MonthWeeks();
    }
    
    const currentWeek = appState.calendarWeeks[appState.selectedWeekIndex];
    
    // We map the teacher's generic schedule (Pazartesi-Pazar) to the actual dates of the selected week
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

    cal.innerHTML = `
        <div style="display: flex; overflow-x: auto; gap: 15px; padding-bottom: 15px; margin-top: 15px;">
            ${groups.map(group => {
                const today = new Date();
                today.setHours(0,0,0,0);
                const isPastDay = group.dateObj < today;

                const slotsHtml = group.slots.map(s => {
                    const slotFullString = `${group.fullDateString} ${s.time}`;
                    let durumStr = group.data && group.data[s.time] ? group.data[s.time] : "musait";
                    
                    if (selectedTeacherId && selectedTeacherId !== "any") {
                        const bookedLesson = (appState.approvedLessons || []).find(l => l.teacherId === selectedTeacherId && l.slots.includes(slotFullString));
                        if (bookedLesson) durumStr = "Dolu";
                    }
                    
                    const isDolu = durumStr !== "musait" || isPastDay;
                    const isSelected = appState.selectedSlots.includes(slotFullString);
                    
                    const click = (s.isBreak || isDolu) ? "" : `onclick="selectSlot('${group.fullDateString}', '${s.time}', this)"`;
                    
                    let cName = s.isBreak ? "break" : (isPastDay ? "dolu" : (isDolu ? "dolu" : "musait"));
                    if (isSelected && !isPastDay) cName += " selected";
                    
                    let icon = s.isBreak ? "☕" : (isPastDay ? "⏳" : (isDolu ? "❌" : ""));
                    if (isSelected && !isPastDay) icon = "✅";
                    
                    const opacity = isPastDay ? '0.5' : '1';
                    return `<div class="slot ${cName}" style="margin-bottom: 8px; opacity: ${opacity};" ${click}>${icon} ${s.time}</div>`;
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
}

function selectSlot(day, time, el) {
    if (appState.selectedOnlinePackages.length === 0) return;
    const slotStr = `${day} ${time}`;
    if(appState.selectedSlots.includes(slotStr)) {
        appState.selectedSlots = appState.selectedSlots.filter(s => s !== slotStr);
        el.classList.remove('selected');
    } else {
        // Calculate max limit across all selected packages
        let maxAllowed = 0;
        appState.selectedOnlinePackages.forEach(p => {
            if (p.id === 100) {
                maxAllowed += (appState.customLessonCount || 0);
            } else if (p.hours) {
                const match = p.hours.match(/(\d+)/);
                if (match) maxAllowed += parseInt(match[1]);
            }
        });
        
        if (maxAllowed > 0 && appState.selectedSlots.length >= maxAllowed) {
            showCustomAlert(`Seçtiğiniz ders sayısına (${maxAllowed} ders) ulaştınız. Her ders ⏱️ 40dk sürmektedir.`);
            return;
        }
        
        appState.selectedSlots.push(slotStr);
        el.classList.add('selected');
    }
    updateSummary();
}

window.selectSummaryWeek = function(index) {
    appState.summarySelectedWeekIndex = index;
    updateSummary();
    const reusableEl = document.getElementById('reusable-slots-table-container');
    if (reusableEl) {
        reusableEl.innerHTML = getCheckoutSlotsHtml();
    }
};

function getCheckoutSlotsHtml() {
    if (!appState.selectedSlots || appState.selectedSlots.length === 0) return "";

    const activeWeekIndices = new Set();
    const slotData = [];

    appState.selectedSlots.forEach(slot => {
        let parts = slot.split(' ');
        let datePart = parts.slice(0, 4).join(' ');
        let timePart = parts.slice(4).join(' ');
        
        let foundWeekIndex = -1;
        let foundDay = null;
        for (let i = 0; i < appState.calendarWeeks.length; i++) {
            const w = appState.calendarWeeks[i];
            const d = w.days.find(day => day.fullDateString === datePart);
            if (d) {
                foundWeekIndex = i;
                foundDay = d;
                break;
            }
        }
        
        if (foundWeekIndex !== -1) {
            activeWeekIndices.add(foundWeekIndex);
            slotData.push({
                weekIndex: foundWeekIndex,
                dateString: foundDay.dateString,
                dayName: foundDay.dayName,
                time: timePart
            });
        }
    });

    const activeWeeksArray = Array.from(activeWeekIndices).sort((a,b) => a-b);
    
    if (appState.summarySelectedWeekIndex === undefined || !activeWeeksArray.includes(appState.summarySelectedWeekIndex)) {
        appState.summarySelectedWeekIndex = activeWeeksArray[0];
    }

    const monthsMap = [];
    activeWeeksArray.forEach(weekIndex => {
        const week = appState.calendarWeeks[weekIndex];
        let lastMonth = monthsMap[monthsMap.length - 1];
        if (!lastMonth || lastMonth.name !== week.monthName) {
            monthsMap.push({
                name: week.monthName,
                weeks: [weekIndex]
            });
        } else {
            lastMonth.weeks.push(weekIndex);
        }
    });

    let navHtml = `<div style="display: flex; justify-content: space-between; gap: 15px; overflow-x: auto; padding-bottom: 5px; margin-bottom: 10px; user-select: none;">`;
    monthsMap.forEach(m => {
        const isMonthActive = m.weeks.some(wIdx => wIdx === appState.summarySelectedWeekIndex);
        const monthColor = isMonthActive ? '#20C997' : '#1f5f99';
        const monthScale = isMonthActive ? 'scale(1.1)' : 'scale(1)';
        
        navHtml += `<div style="display: flex; flex: 1; flex-direction: column; align-items: center; min-width: 80px;">
            <div style="font-weight: bold; color: ${monthColor}; margin-bottom: 5px; font-size: 0.85rem; transform: ${monthScale}; transition: 0.2s;">${m.name}</div>
            <div style="display: flex; gap: 5px;">`;
        m.weeks.forEach(wIdx => {
            const isSelected = appState.summarySelectedWeekIndex === wIdx;
            let bgColor = isSelected ? '#20C997' : '#e0e0e0';
            let opacity = isSelected ? '1' : '0.7';
            let transform = isSelected ? 'scale(1.15)' : 'scale(1)';
            navHtml += `<div style="width: 30px; height: 7px; border-radius: 4px; background: ${bgColor}; cursor: pointer; opacity: ${opacity}; transform: ${transform}; transition: 0.2s; margin: 3px 0;" onclick="selectSummaryWeek(${wIdx})" title="Haftayı Görüntüle"></div>`;
        });
        navHtml += `</div></div>`;
    });
    navHtml += `</div>`;

    const currentWeek = appState.calendarWeeks[appState.summarySelectedWeekIndex];
    let tableHtml = `<div style="overflow-x: auto; margin-bottom: 15px;">
        <table style="width: 100%; min-width: 600px; text-align: center; border-collapse: collapse; font-size: 0.85rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <tr>`;
    
    currentWeek.days.forEach(d => {
        tableHtml += `<th style="border: 1px solid #e0e0e0; padding: 6px; background: #f8f9fa; color: #333; font-weight: 600; font-size: 0.8rem;">
            ${d.dateString}<br><span style="font-size:0.7rem; font-weight:normal;">${d.dayName}</span>
        </th>`;
    });
    tableHtml += `</tr>`;

    const slotsByDay = {};
    currentWeek.days.forEach(d => slotsByDay[d.dateString] = []);
    
    slotData.filter(s => s.weekIndex === appState.summarySelectedWeekIndex).forEach(s => {
        slotsByDay[s.dateString].push(s.time);
        slotsByDay[s.dateString].sort();
    });

    let maxSlots = Math.max(0, ...Object.values(slotsByDay).map(arr => arr.length));
    
    if (maxSlots === 0) {
        tableHtml += `<tr><td colspan="7" style="border: 1px solid #e0e0e0; padding: 15px; color: #999; font-style: italic;">Bu hafta için saat seçilmedi.</td></tr>`;
    } else {
        for (let i = 0; i < maxSlots; i++) {
            tableHtml += `<tr>`;
            currentWeek.days.forEach(d => {
                let time = slotsByDay[d.dateString][i];
                let cellContent = time ? `<span style="background: #e6f7ff; color: #0050b3; padding: 2px 6px; border-radius: 4px; display: inline-block;">${time}</span>` : "";
                tableHtml += `<td style="border: 1px solid #e0e0e0; padding: 6px; vertical-align: top;">${cellContent}</td>`;
            });
            tableHtml += `</tr>`;
        }
    }
    tableHtml += `</table></div>`;

    return `
        <div style="margin-top: 15px;">
            <p style="margin-bottom: 10px;"><strong>Seçilen Ders Programı:</strong></p>
            ${activeWeeksArray.length > 1 ? navHtml : ''}
            ${tableHtml}
        </div>
    `;
}

function updateSummary() {
    const summaryEl = document.getElementById('selected-summary');
    if(!summaryEl) return;
    
    if (appState.selectedOnlinePackages.length === 0 && (!appState.selectedSlots || appState.selectedSlots.length === 0)) {
        summaryEl.innerHTML = "Henüz seçim yapılmadı";
        return;
    }
    
    const pkgsStr = appState.selectedOnlinePackages.map(p => `<span class="highlight">${p.name}</span>`).join(', ') || "Seçilmedi";
    const totalPrice = appState.selectedOnlinePackages.reduce((sum, p) => sum + p.price, 0);

    if (!appState.selectedSlots || appState.selectedSlots.length === 0) {
        summaryEl.innerHTML = `
            <p style="margin-bottom: 10px;"><strong>Paketler:</strong> ${pkgsStr}</p>
            <p style="margin-bottom: 10px; color:#777;">Hiçbir ders saati seçilmedi.</p>
            <strong style="color:#20C997;">Toplam Tutar: ${totalPrice.toLocaleString('tr-TR')} ₺</strong>
        `;
        return;
    }

    summaryEl.innerHTML = `
        <p style="margin-bottom: 10px;"><strong>Paketler:</strong> ${pkgsStr}</p>
        ${getCheckoutSlotsHtml()}
        <strong style="color:#20C997; display: block; margin-top: 10px;">Toplam Tutar: ${totalPrice.toLocaleString('tr-TR')} ₺</strong>
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
            <div id="reusable-slots-table-container">
                ${getCheckoutSlotsHtml()}
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
        pkgs.forEach(p => {
            total += typeof p.price === 'number' ? p.price : parseInt(p.price.replace(/[^0-9]/g, ''));
        });
        
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
            studentName: appState.currentUserName || "Öğrenci",
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

        showCustomAlert(alertMessage);
        
        changeView('dashboard-section');
        return;
    }
    if (appState.paymentType === 'offline_multiple') {
        appState.selectedOfflinePackages.forEach(id => {
            if (!appState.purchasedPackages.includes(id)) {
                appState.purchasedPackages.push(id);
            }
        });
        saveStudentData();
        showCustomAlert("Satın alma işleminiz onaylandı! Seçtiğiniz tüm eğitimlere artık erişebilirsiniz.");
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
        showCustomAlert(`Ödeme onaylandı! "${pkg.title}" hesabınıza tanımlandı.`);
        appState.viewHistory.pop();
        startPackage(pkg.id, pkg.title);
    }
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
            db.collection('users').doc(appState.currentUser).set({
                purchasedPackages: appState.purchasedPackages,
                progress: appState.studentProgress["self"] ? appState.studentProgress["self"][appState.currentUser] : {}
            }, { merge: true }).catch(err => console.error("Öğrenci verisi kaydedilemedi:", err));
        }
    }
}
/* ==========================================
   8. DERS İÇERİK VE QUIZ
   ========================================== */
function renderKazanimTimeline() {
    const container = document.getElementById('kazanim-timeline-render');
    if(!container) return;
    container.innerHTML = '';
    let results = appState.stepResults || {};
    let pkgResults = results[appState.currentPackageId] || {};
    
    for(let i = 1; i <= appState.totalKazanimCount; i++) {
        const node = document.createElement('div');
        node.className = 'kazanim-node';
        node.innerText = i;
        if(i < appState.currentKazanim) {
            let status = pkgResults[i];
            if (status === 'correct') {
                node.style.background = '#20C997';
                node.style.color = 'white';
                node.style.borderColor = '#20C997';
            } else if (status === 'incorrect') {
                node.style.background = '#e74c3c';
                node.style.color = 'white';
                node.style.borderColor = '#e74c3c';
            } else {
                node.classList.add('completed');
            }
        } else if(i === appState.currentKazanim) {
            node.classList.add('active');
        }
        container.appendChild(node);
    }
}

function loadKazanimData() {
    const t = document.getElementById('topic-text');
    const qArea = document.getElementById('student-question-area');
    const pkgId = appState.currentPackageId;
    const stepNum = appState.currentKazanim;
    
    let contentHtml = `<div style="color:#999; font-style:italic;">Bu adım için konu anlatımı eklenmemiş.</div>`;
    let stepData = null;
    
    if (appState.kazanimData[pkgId] && appState.kazanimData[pkgId].steps && appState.kazanimData[pkgId].steps[stepNum]) {
        stepData = appState.kazanimData[pkgId].steps[stepNum];
        
        if (stepData.text && (!stepData.contentBlocks || stepData.contentBlocks.length === 0)) {
            stepData.contentBlocks = [{type: 'text', content: stepData.text}];
        }
        
        if (stepData.contentBlocks && stepData.contentBlocks.length > 0) {
            contentHtml = stepData.contentBlocks.map(b => {
                if (b.type === 'text') return `<div style="margin-bottom:15px; line-height:1.6; font-size:1.05rem; color:#333;">${(b.content||'').replace(/\n/g, '<br>')}</div>`;
                if (b.type === 'image' && b.url) return `<div style="text-align:center; margin-bottom:15px;"><img src="${b.url}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1);"></div>`;
                return '';
            }).join('');
        }
    }
    
    if(t) t.innerHTML = contentHtml;
    
    if(qArea) {
        if (!stepData || !stepData.question || stepData.question.type === 'none') {
            qArea.style.display = 'none';
        } else {
            qArea.style.display = 'block';
            let q = stepData.question;
            if (typeof q === 'string') {
                q = { type: 'multiple_choice', text: q, options: [], correctOptionIndex: 0 };
            }
            
            let qHtml = `<h4 style="color: #ff6b6b; margin-top:0;">Ölçme ve Değerlendirme Modülü</h4>`;
            qHtml += `<div style="font-size: 1.1rem; margin-bottom: 25px; font-weight:bold;">${q.text || ''}</div>`;
            
            if (q.type === 'multiple_choice') {
                qHtml += `<div style="display:flex; flex-direction:column; gap:10px;">`;
                (q.options || []).forEach((opt, idx) => {
                    let isCorrect = (q.correctOptionIndex === idx);
                    let idAttr = isCorrect ? `id="correct-option-btn"` : '';
                    qHtml += `<button class="mc-option-btn" ${idAttr} style="text-align:left; padding:12px 15px; border:1px solid #cbd5e1; border-radius:8px; background:white; cursor:pointer; font-size:0.95rem; transition:0.2s;" onmouseover="if(!this.classList.contains('selected')) this.style.background='#f1f5f9'" onmouseout="if(!this.classList.contains('selected')) this.style.background='white'" onclick="selectOption(this, ${isCorrect})"><span style="font-weight:bold; margin-right:10px; color:#4facfe;">${['A','B','C','D','E'][idx]}</span> ${opt}</button>`;
                });
                qHtml += `</div>`;
            } else if (q.type === 'true_false') {
                qHtml += `
                    <div style="display:flex; gap:15px;">
                        <button class="tf-option-btn" data-base-color="#20C997" ${q.isTrue === true ? 'id="correct-option-btn"' : ''} style="flex:1; padding:15px; background:white; border:2px solid #20C997; color:#20C997; border-radius:8px; font-weight:bold; font-size:1.1rem; cursor:pointer; transition:0.2s;" onmouseover="if(!this.classList.contains('selected')){this.style.background='#20C997'; this.style.color='white'}" onmouseout="if(!this.classList.contains('selected')){this.style.background='white'; this.style.color='#20C997'}" onclick="selectOption(this, ${q.isTrue === true})">Doğru</button>
                        <button class="tf-option-btn" data-base-color="#e74c3c" ${q.isTrue === false ? 'id="correct-option-btn"' : ''} style="flex:1; padding:15px; background:white; border:2px solid #e74c3c; color:#e74c3c; border-radius:8px; font-weight:bold; font-size:1.1rem; cursor:pointer; transition:0.2s;" onmouseover="if(!this.classList.contains('selected')){this.style.background='#e74c3c'; this.style.color='white'}" onmouseout="if(!this.classList.contains('selected')){this.style.background='white'; this.style.color='#e74c3c'}" onclick="selectOption(this, ${q.isTrue === false})">Yanlış</button>
                    </div>
                `;
            } else if (q.type === 'matching') {
                qHtml += `<div style="display:flex; justify-content:space-between; gap:20px;">`;
                let leftHtml = `<div style="flex:1; display:flex; flex-direction:column; gap:10px;">`;
                let rightHtml = `<div style="flex:1; display:flex; flex-direction:column; gap:10px;">`;
                
                let rights = (q.pairs || []).map((p, i) => ({text: p.right, correctIdx: i})).sort(() => Math.random() - 0.5);
                
                window.cmsMatchState = { total: q.pairs.length, correct: 0, wrong: 0 };
                
                (q.pairs || []).forEach((p, idx) => {
                    leftHtml += `<div class="match-left-item" data-idx="${idx}" data-original-text="${p.left}" style="padding:10px; background:white; border:1px solid #ccc; border-radius:6px; text-align:center; font-size:0.9rem; min-height:40px; display:flex; align-items:center; justify-content:center; transition:background 0.3s;">${p.left}</div>`;
                });
                rights.forEach((r, idx) => {
                    rightHtml += `<div class="match-right-item" data-idx="${r.correctIdx}" style="padding:10px; background:#eef2f5; border:1px dashed #999; border-radius:6px; text-align:center; cursor:grab; font-size:0.9rem; touch-action:none; user-select:none; -webkit-user-select:none;">${r.text}</div>`;
                });
                leftHtml += `</div>`;
                rightHtml += `</div>`;
                qHtml += leftHtml + rightHtml + `</div>`;
                qHtml += `<div style="margin-top:15px; font-size:0.85rem; color:#888; text-align:center;">Sağdaki kutuları parmağınızla (veya farenizle) tutup soldaki eşleşmesinin üzerine bırakınız. Tümünü yerleştirdikten sonra Onayla butonuna basınız.</div>`;
            }
            
            qHtml += `<div style="margin-top: 20px; display:flex; justify-content:flex-end;">
                        <button id="confirm-answer-btn" class="btn btn-success" disabled onclick="confirmAnswer()" style="padding: 10px 30px; font-size: 1.05rem; opacity: 0.5; transition: opacity 0.3s;">Onayla</button>
                      </div>`;
            
            qArea.innerHTML = qHtml;
            if (q && q.type === 'matching') {
                setTimeout(initPointerDragAndDrop, 100);
            }
        }
    }
}

window.initPointerDragAndDrop = function() {
    let draggables = document.querySelectorAll('.match-right-item');
    
    draggables.forEach(dragEl => {
        let startX = 0, startY = 0;
        let isDragging = false;
        
        dragEl.addEventListener('pointerdown', function(e) {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            dragEl.setPointerCapture(e.pointerId);
            
            dragEl.style.position = 'relative';
            dragEl.style.zIndex = '1000';
            dragEl.style.opacity = '0.9';
            dragEl.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
        });

        dragEl.addEventListener('pointermove', function(e) {
            if (!isDragging) return;
            e.preventDefault(); 
            let dx = e.clientX - startX;
            let dy = e.clientY - startY;
            dragEl.style.transform = `translate(${dx}px, ${dy}px)`;
        });

        dragEl.addEventListener('pointerup', function(e) {
            if (!isDragging) return;
            isDragging = false;
            dragEl.releasePointerCapture(e.pointerId);
            
            dragEl.style.zIndex = '1';
            dragEl.style.opacity = '1';
            dragEl.style.boxShadow = 'none';
            
            dragEl.style.visibility = 'hidden'; 
            let elemBelow = document.elementFromPoint(e.clientX, e.clientY);
            dragEl.style.visibility = 'visible';
            
            let dropzone = elemBelow ? elemBelow.closest('.match-left-item') : null;
            
            if (dropzone) {
                let targetIdx = parseInt(dropzone.getAttribute('data-idx'));
                let draggedIdx = parseInt(dragEl.getAttribute('data-idx'));
                window.processMatchAttempt(draggedIdx, targetIdx, dragEl, dropzone);
            } else {
                dragEl.style.transform = `translate(0px, 0px)`;
                dragEl.style.transition = 'transform 0.3s';
                setTimeout(() => dragEl.style.transition = '', 300);
            }
        });
        
        dragEl.addEventListener('pointercancel', function(e) {
            if (!isDragging) return;
            isDragging = false;
            dragEl.releasePointerCapture(e.pointerId);
            dragEl.style.zIndex = '1';
            dragEl.style.opacity = '1';
            dragEl.style.boxShadow = 'none';
            dragEl.style.transform = `translate(0px, 0px)`;
        });
    });
};

window.processMatchAttempt = function(draggedIdx, targetIdx, dragEl, targetEl) {
    if (draggedIdx === targetIdx) {
        targetEl.style.background = '#20C997';
        targetEl.style.color = 'white';
        targetEl.style.borderColor = '#20C997';
        targetEl.innerText = targetEl.getAttribute('data-original-text') + ' = ' + dragEl.innerText;
        dragEl.style.visibility = 'hidden';
        window.cmsMatchState.correct++;
    } else {
        targetEl.style.background = '#e74c3c';
        targetEl.style.color = 'white';
        window.cmsMatchState.wrong++;
        setTimeout(() => {
            targetEl.style.background = 'white';
            targetEl.style.color = 'initial';
        }, 500);
        dragEl.style.transform = `translate(0px, 0px)`; 
        dragEl.style.transition = 'transform 0.3s';
        setTimeout(() => dragEl.style.transition = '', 300);
    }
    
    if (window.cmsMatchState.correct === window.cmsMatchState.total) {
        let isOverallCorrect = (window.cmsMatchState.wrong === 0);
        window.selectedIsCorrect = isOverallCorrect;
        window.selectedBtn = null;
        let confirmBtn = document.getElementById('confirm-answer-btn');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.style.opacity = '1';
        }
    }
}

window.selectOption = function(btn, isCorrect) {
    let container = btn.parentElement;
    let buttons = container.querySelectorAll('.mc-option-btn, .tf-option-btn');
    buttons.forEach(b => {
        b.classList.remove('selected');
        if (b.classList.contains('mc-option-btn')) {
            b.style.background = 'white';
            b.style.borderColor = '#cbd5e1';
        } else {
            b.style.background = 'white';
            b.style.color = b.getAttribute('data-base-color');
        }
    });
    
    btn.classList.add('selected');
    if (btn.classList.contains('mc-option-btn')) {
        btn.style.background = '#e0f2fe';
        btn.style.borderColor = '#4facfe';
    } else {
        btn.style.background = btn.getAttribute('data-base-color');
        btn.style.color = 'white';
    }
    
    window.selectedIsCorrect = isCorrect;
    window.selectedBtn = btn;
    
    let confirmBtn = document.getElementById('confirm-answer-btn');
    if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.style.opacity = '1';
    }
}

window.confirmAnswer = function() {
    let confirmBtn = document.getElementById('confirm-answer-btn');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = '0.5';
    }
    simulateAnswer(window.selectedIsCorrect, window.selectedBtn);
}

function simulateAnswer(isCorrect, btn) {
    let qArea = document.getElementById('student-question-area');
    if (qArea) {
        let buttons = qArea.querySelectorAll('button');
        buttons.forEach(b => {
            b.disabled = true;
            b.style.pointerEvents = 'none';
        });
    }

    if (btn) {
        btn.removeAttribute('onmouseover');
        btn.removeAttribute('onmouseout');
        if (isCorrect) {
            btn.style.background = '#20C997';
            btn.style.color = 'white';
            btn.style.borderColor = '#20C997';
        } else {
            btn.style.background = '#e74c3c';
            btn.style.color = 'white';
            btn.style.borderColor = '#e74c3c';
            
            let correctBtn = document.getElementById('correct-option-btn');
            if (correctBtn) {
                correctBtn.removeAttribute('onmouseover');
                correctBtn.removeAttribute('onmouseout');
                correctBtn.style.background = '#20C997';
                correctBtn.style.color = 'white';
                correctBtn.style.borderColor = '#20C997';
            }
        }
    }

    if (!appState.stepResults) appState.stepResults = {};
    if (!appState.stepResults[appState.currentPackageId]) appState.stepResults[appState.currentPackageId] = {};
    appState.stepResults[appState.currentPackageId][appState.currentKazanim] = isCorrect ? 'correct' : 'incorrect';

    setTimeout(() => {
        if(appState.currentKazanim < appState.totalKazanimCount) {
            appState.currentKazanim++;
            
            if (!appState.studentProgress["self"]) appState.studentProgress["self"] = {};
            if (!appState.studentProgress["self"][appState.currentUser]) appState.studentProgress["self"][appState.currentUser] = {};
            appState.studentProgress["self"][appState.currentUser][appState.currentPackageId] = appState.currentKazanim;
            saveStudentData();

            renderKazanimTimeline();
            loadKazanimData();
        } else {
            // Tamamlandı, profil kısmında %100 görünmesi için kazanimCount'u aştığını belirtiyoruz
            appState.currentKazanim++;
            if (!appState.studentProgress["self"]) appState.studentProgress["self"] = {};
            if (!appState.studentProgress["self"][appState.currentUser]) appState.studentProgress["self"][appState.currentUser] = {};
            appState.studentProgress["self"][appState.currentUser][appState.currentPackageId] = appState.currentKazanim;
            saveStudentData();
            
            showCustomAlert("TEBRİKLER! Tüm kazanımları başarıyla bitirdiniz.");
            goBack();
        }
    }, 1500);
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
            
            <details class="admin-details" name="admin-accordion" id="admin-package-accordion">
                <summary class="admin-summary" onclick="renderAdminPackageManagement()">Müfredat & Paket Yönetimi</summary>
                <div style="margin-top: 15px;">
                    <div style="display: flex; border-bottom: 2px solid #ddd; margin-bottom: 0;">
                        <button id="tab-btn-offline" class="tab-btn active-tab" onclick="switchAdminPackageTab('offline')" style="flex:1; padding:12px; background:#20C997; color:white; border:none; border-radius: 8px 8px 0 0; font-weight:bold; cursor:pointer;">Çevrimdışı Paketler</button>
                        <button id="tab-btn-online" class="tab-btn" onclick="switchAdminPackageTab('online')" style="flex:1; padding:12px; background:#f1f5f9; color:#555; border:none; border-radius: 8px 8px 0 0; font-weight:bold; cursor:pointer;">Özel Ders Paketleri (Canlı)</button>
                    </div>
                    
                    <!-- SOL: PAKETLER (Çevrimdışı) -->
                    <div id="tab-content-offline" style="background: #fcfcfc; border: 1px solid #ddd; border-top: none; padding: 15px; border-radius: 0 0 8px 8px; display: block;">
                        
                        <div id="admin-offline-packages" style="max-height: 250px; overflow-y: auto; margin-bottom: 15px;"></div>
                        
                        <details class="admin-details" style="background: #fff; border: 1px solid #e2e8f0;">
                            <summary class="admin-summary" style="padding: 8px 12px; color: #20C997; font-weight: bold; font-size: 0.85rem;">+ Yeni Çevrimdışı Paket Ekle</summary>
                            <div class="dark-box" style="margin: 10px; border:none; box-shadow:none;">
                                <div class="form-group"><label>Başlık</label><input type="text" id="new-offline-title" placeholder="Örn: Okuma Paketi"></div>
                                <div class="form-group"><label>Açıklama</label><input type="text" id="new-offline-desc" placeholder="Örn: Kural dışı fiillerin..."></div>
                                <div style="display:flex; gap:15px; flex-wrap:wrap;">
                                    <div class="form-group" style="flex:1; min-width: 100px;"><label>Süre (Sayı)</label><input type="number" id="new-offline-duration" placeholder="Örn: 12"></div>
                                    <div class="form-group" style="flex:1; min-width: 100px;"><label>Fiyat (Sayı)</label><input type="number" id="new-offline-price" placeholder="Örn: 450"></div>
                                </div>
                                <div class="form-group"><label>Gereklilikler (Virgülle Ayırın)</label><input type="text" id="new-offline-reqs" placeholder="Örn: A1 seviyesi"></div>
                                <div class="form-group"><label>Hedef Kazanım</label><input type="text" id="new-offline-target" placeholder="Örn: Hızlı okumayı sağlamak"></div>
                                <button class="btn btn-primary" style="width: 100%;" onclick="addOfflinePackage()">Paketi Ekle</button>
                            </div>
                        </details>
                    </div>
                    
                    <!-- SAĞ: ÖZEL DERS PAKETLERİ (Canlı) -->
                    <div id="tab-content-online" style="background: #fcfcfc; border: 1px solid #ddd; border-top: none; padding: 15px; border-radius: 0 0 8px 8px; display: none;">
                        
                        <div id="admin-online-packages" style="max-height: 250px; overflow-y: auto; margin-bottom: 15px;"></div>
                        
                        <details class="admin-details" style="background: #fff; border: 1px solid #e2e8f0;">
                            <summary class="admin-summary" style="padding: 8px 12px; color: #4facfe; font-weight: bold; font-size: 0.85rem;">+ Yeni Canlı Ders Paketi Ekle</summary>
                            <div class="dark-box" style="margin: 10px; border:none; box-shadow:none;">
                                <div class="form-group"><label>Paket Adı</label><input type="text" id="new-online-name" placeholder="Örn: YDS/YÖKDİL Metin Çözümleme"></div>
                                <div class="form-group"><label>Açıklama</label><input type="text" id="new-online-desc" placeholder="Örn: İleri seviye Arapça metin okuma"></div>
                                <div style="display:flex; gap:15px; flex-wrap:wrap;">
                                    <div class="form-group" style="flex:1; min-width: 100px;"><label>Fiyat (Sayı)</label><input type="number" id="new-online-price" placeholder="Örn: 2500"></div>
                                    <div class="form-group" style="flex:1; min-width: 100px;"><label>Saat (Sayı)</label><input type="number" id="new-online-hours" placeholder="Örn: 16"></div>
                                </div>
                                <div class="form-group"><label>Materyal</label><input type="text" id="new-online-material" placeholder="Örn: Çıkmış Sorular"></div>
                                <button class="btn btn-primary" style="width: 100%; background: #4facfe; border-color: #4facfe;" onclick="addOnlinePackage()">Canlı Ders Ekle</button>
                            </div>
                        </details>
                    </div>
                </div>
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
                <summary class="admin-summary">Öğretmen Yönetimi</summary>
                <div style="margin-top: 15px;">
                    <div id="admin-teacher-list" style="margin-bottom: 20px; overflow-x: auto;"></div>
                    
                    <details class="admin-details" name="teacher-edit-accordion" style="background: #fff; border: 1px solid #e2e8f0; box-shadow: none;">
                        <summary class="admin-summary" style="padding: 8px 12px; color: #4facfe; font-weight: bold; font-size: 0.85rem;">+ Yeni Öğretmen Ekle</summary>
                        <div class="dark-box" style="margin: 10px; border:none; box-shadow:none;">
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
                            <button class="btn btn-primary" onclick="addTeacher()" style="width: 100%; background: #4facfe; border-color: #4facfe;">Ekle ve Kaydet</button>
                        </div>
                    </details>
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
    const listContainer = document.getElementById('admin-teacher-list');
    if (!listContainer) return;
    if (appState.teachers.length === 0) {
        listContainer.innerHTML = "<p>Öğretmen bulunmuyor.</p>"; return;
    }
    
    let html = '';
    appState.teachers.forEach((t) => {
        let cvInfo = (t.cv || t.documentName) ? `<div style="margin-top: 15px;"><strong>Yüklenen Belge/CV:</strong> ${t.documentName || 'Var'}</div>` : '';
        html += `
        <details class="admin-details" name="teacher-edit-accordion" style="background:#fff; border:1px solid #e2e8f0; margin-bottom:8px; box-shadow:none;">
            <summary class="admin-summary" style="padding:10px 15px; font-weight:bold; color:#1f5f99; font-size:1rem;">
                👨‍🏫 ${t.name}
            </summary>
            <div style="padding:15px; border-top:1px solid #eee; background: #fdfdfd;">
                <div class="form-group">
                    <label>Kullanıcı ID</label>
                    <input type="text" id="edit-teacher-id-${t.id}" value="${t.id}">
                </div>
                <div class="form-group">
                    <label>Adı Soyadı</label>
                    <input type="text" id="edit-teacher-name-${t.id}" value="${t.name}">
                </div>
                <div class="form-group">
                    <label>Telefon</label>
                    <input type="text" id="edit-teacher-phone-${t.id}" value="${t.phone}">
                </div>
                <div class="form-group">
                    <label>E-posta</label>
                    <input type="email" id="edit-teacher-email-${t.id}" value="${t.email || ''}">
                </div>
                <div class="form-group">
                    <label>Şifre</label>
                    <input type="text" id="edit-teacher-password-${t.id}" value="${t.password || ''}">
                </div>
                ${cvInfo}
                <div style="display:flex; justify-content:space-between; margin-top:20px;">
                    <button class="btn btn-success" onclick="saveSingleTeacher('${t.id}')">Değişiklikleri Kaydet</button>
                    <button class="btn btn-danger" onclick="removeTeacher('${t.id}')">Öğretmeni Sil</button>
                </div>
            </div>
        </details>
        `;
    });
    
    listContainer.innerHTML = html;
}

window.saveSingleTeacher = function(oldId) {
    const tIndex = appState.teachers.findIndex(t => t.id === oldId);
    if (tIndex === -1) return;
    
    const newId = document.getElementById(`edit-teacher-id-${oldId}`).value.trim();
    const newName = document.getElementById(`edit-teacher-name-${oldId}`).value.trim();
    const newPhone = document.getElementById(`edit-teacher-phone-${oldId}`).value.trim();
    const newEmail = document.getElementById(`edit-teacher-email-${oldId}`).value.trim();
    const newPassword = document.getElementById(`edit-teacher-password-${oldId}`).value.trim();

    if (!newId || !newName) return alert("Kullanıcı ID ve Adı Soyadı boş bırakılamaz.");

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
    
    appState.teachers[tIndex].id = newId || oldId;
    appState.teachers[tIndex].name = newName;
    appState.teachers[tIndex].phone = newPhone;
    appState.teachers[tIndex].email = newEmail;
    appState.teachers[tIndex].password = newPassword;
    
    saveTeachers();
    
    // Select seçeneklerini güncelle
    const adminSelect = document.getElementById('admin-teacher-edit-select');
    if (adminSelect) {
        const currentVal = adminSelect.value;
        adminSelect.innerHTML = appState.teachers.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
        if(appState.teachers.find(t => t.id === currentVal)) adminSelect.value = currentVal;
    }
    
    renderAdminTeacherList();
    alert("Öğretmen bilgileri başarıyla güncellendi.");
};

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
    teacherSchedules[id] = getDefaultSchedule();
    
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
    
    let html = `<div style="display:flex; flex-direction:column; gap:10px;">`;
    appState.packages.forEach((pkg, index) => {
        const reqs = pkg.requirements ? pkg.requirements.join(', ') : '';
        html += `
        <details name="admin-offline-packages" class="admin-details" style="background: #fff; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <summary class="admin-summary" style="padding: 10px; display: flex; justify-content: space-between; align-items: center; border-radius:8px;">
                <strong id="offline-summary-title-${index}" style="color:#16A085; font-size: 0.9rem;">${pkg.title}</strong>
                <button class="btn btn-danger btn-sm" style="padding: 2px 6px; font-size: 0.7rem;" onclick="removeOfflinePackage(${pkg.id})">Sil</button>
            </summary>
            
            <div style="padding: 10px; border-top: 1px solid #eee;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.75rem; color: #555;">
                    <tr>
                        <td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0; width: 100px;"><strong>Başlık:</strong></td>
                        <td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><span contenteditable="true" onblur="updateOfflinePackageData(${index}, 'title', this.innerText)" style="background:#fff8e1; outline:none; padding:2px 4px; display:block;">${pkg.title}</span></td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><strong>Açıklama:</strong></td>
                        <td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><span contenteditable="true" onblur="updateOfflinePackageData(${index}, 'description', this.innerText)" style="background:#fff8e1; outline:none; padding:2px 4px; display:block;">${pkg.description}</span></td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><strong>Süre:</strong></td>
                        <td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;">
                            <div style="display:flex; align-items:center; gap:5px;">
                                <input type="number" onblur="updateOfflinePackageData(${index}, 'duration', this.value)" value="${parseInt(pkg.duration) || ''}" style="width:60px; background:#fff8e1; border:none; outline:none; padding:2px 4px; border-bottom:1px dashed #ccc;">
                                <span>Saat</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><strong>Fiyat:</strong></td>
                        <td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;">
                            <div style="display:flex; align-items:center; gap:5px;">
                                <input type="number" onblur="updateOfflinePackageData(${index}, 'price', this.value)" value="${parseInt(pkg.price) || ''}" style="width:80px; background:#fff8e1; border:none; outline:none; padding:2px 4px; border-bottom:1px dashed #ccc;">
                                <span>₺</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><strong>Gereklilikler:</strong></td>
                        <td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><span contenteditable="true" onblur="updateOfflinePackageData(${index}, 'requirements', this.innerText)" style="background:#fff8e1; outline:none; padding:2px 4px; display:block;">${reqs}</span></td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><strong>Hedef:</strong></td>
                        <td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><span contenteditable="true" onblur="updateOfflinePackageData(${index}, 'target', this.innerText)" style="background:#fff8e1; outline:none; padding:2px 4px; display:block;">${pkg.target || ''}</span></td>
                    </tr>
                </table>
                ${renderKazanimStepsHTML(pkg.id, pkg.title)}
            </div>
        </details>`;
    });
    html += `</div><p style="font-size: 0.75rem; color: #888; margin-top: 10px;">* Sarı alanlara tıklayıp yazarak anında güncelleyebilirsiniz.</p>`;
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
        
        if (field === 'title') {
            const sumEl = document.getElementById(`offline-summary-title-${index}`);
            if (sumEl) sumEl.innerText = value.trim();
        }
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
    
    let html = `<div style="display:flex; flex-direction:column; gap:10px;">`;
    appState.onlinePackages.forEach((pkg, index) => {
        html += `
        <details name="admin-online-packages" class="admin-details" style="background: #fff; border: 1px solid #cbd5e1; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <summary class="admin-summary" style="padding: 10px; display: flex; justify-content: space-between; align-items: center; border-radius:8px;">
                <strong id="online-summary-title-${index}" style="color:#2980b9; font-size: 0.9rem;">${pkg.name}</strong>
                <button class="btn btn-danger btn-sm" style="padding: 2px 6px; font-size: 0.7rem;" onclick="removeOnlinePackage(${pkg.id})">Sil</button>
            </summary>
            
            <div style="padding: 10px; border-top: 1px solid #eee;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.75rem; color: #555;">
                    <tr>
                        <td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0; width: 100px;"><strong>Paket Adı:</strong></td>
                        <td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><span contenteditable="true" onblur="updateOnlinePackageData(${index}, 'name', this.innerText)" style="background:#fff8e1; outline:none; padding:2px 4px; display:block;">${pkg.name}</span></td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><strong>Açıklama:</strong></td>
                        <td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><span contenteditable="true" onblur="updateOnlinePackageData(${index}, 'desc', this.innerText)" style="background:#fff8e1; outline:none; padding:2px 4px; display:block;">${pkg.desc}</span></td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><strong>Saat:</strong></td>
                        <td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;">
                            <div style="display:flex; align-items:center; gap:5px;">
                                <input type="number" onblur="updateOnlinePackageData(${index}, 'hours', this.value)" value="${parseInt(pkg.hours) || ''}" style="width:60px; background:#fff8e1; border:none; outline:none; padding:2px 4px; border-bottom:1px dashed #ccc;">
                                <span>Saat / Ay</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><strong>Fiyat:</strong></td>
                        <td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;">
                            <div style="display:flex; align-items:center; gap:5px;">
                                <input type="number" onblur="updateOnlinePackageData(${index}, 'price', this.value)" value="${parseInt(pkg.price) || ''}" style="width:80px; background:#fff8e1; border:none; outline:none; padding:2px 4px; border-bottom:1px dashed #ccc;">
                                <span>₺</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><strong>Materyal:</strong></td>
                        <td style="padding: 6px 4px; border-bottom: 1px solid #f0f0f0;"><span contenteditable="true" onblur="updateOnlinePackageData(${index}, 'material', this.innerText)" style="background:#fff8e1; outline:none; padding:2px 4px; display:block;">${pkg.material || ''}</span></td>
                    </tr>
                </table>
                ${renderKazanimStepsHTML(pkg.id, pkg.name)}
            </div>
        </details>`;
    });
    html += `</div><p style="font-size: 0.75rem; color: #888; margin-top: 10px;">* Sarı alanlara tıklayıp yazarak anında güncelleyebilirsiniz.</p>`;
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
        
        if (field === 'name') {
            const sumEl = document.getElementById(`online-summary-title-${index}`);
            if (sumEl) sumEl.innerText = value.trim();
        }
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
        alert(`Ders başarıyla onaylandı!\nÖğrencinizin seçtiği ${updatedCount} saat dilimi sisteminize işlendi.`);
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

    editor.innerHTML = getTeacherCalendarEditorHtml(teacherId, false);
}

function toggleSlotStatus(teacherId, groupName, time, element, isStudentBooked = false) {
    if (isStudentBooked) {
        alert("Bu saat spesifik olarak bir öğrenci randevusuna ayrılmıştır.\n\nEğer bu saati açmak istiyorsanız, öncelikle 'Tüm Randevu Talepleri' (veya Derslerim) bölümünden öğrencinin randevusunu iptal etmelisiniz.");
        return;
    }

    const group = teacherSchedules[teacherId].find(g => g.name === groupName);
    if (!group) return;
    const currentStatus = group.data[time] || "musait";
    
    if (currentStatus !== "musait") {
        const studentName = currentStatus === "dolu" ? "Bu" : `"${currentStatus}" isimli öğrencinin`;
        if (!confirm(`Emin misiniz? ${studentName} dersini iptal edip bu saati müsaite çevirmek üzeresiniz.`)) {
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

window.deleteStudent = function(email) {
    if (!confirm(`Emin misiniz? '${email}' adresli öğrencinin tüm bilgileri ve hesabı silinecek!`)) return;
    
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

/* ==========================================
   WEBRTC GERÇEK ZAMANLI VİDEO BAĞLANTISI
   ========================================== */
let peerConnection = null;
const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        {
            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        }
    ]
};

async function initWebRTCRoom(roomId, isHost) {
    if (!isFirebaseReady) {
        console.warn("Firebase hazır değil, WebRTC kullanılamıyor.");
        return;
    }
    
    appState.isRoomHost = isHost;
    const roomRef = db.collection('rooms').doc(roomId);
    peerConnection = new RTCPeerConnection(configuration);

    // Sohbet Dinleyicisi (Gerçek Zamanlı)
    appState.unsubscribeChat = roomRef.collection('messages').orderBy('timestamp').onSnapshot(snapshot => {
        const chatContainer = document.getElementById('chat-messages');
        const myName = appState.isInviteMode ? "Öğrenci/Misafir" : (appState.currentUserName && appState.currentUserName !== "Belirtilmedi" ? appState.currentUserName : "Öğretmen");
        
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                const data = change.doc.data();
                const msgDiv = document.createElement('div');
                msgDiv.className = 'chat-message';
                const isSiz = data.sender === myName;
                const displaySender = isSiz ? "Siz" : data.sender;
                
                // Avoid duplicating local fallback messages if any, simple approach: just render all from DB
                msgDiv.innerHTML = `<div class="sender">${displaySender}</div><div style="font-size: 0.9rem;">${data.text}</div>`;
                chatContainer.appendChild(msgDiv);
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        });
    });

    // Oda durumu ve Öğretmen/Yönetici kopması
    appState.unsubscribeStatus = roomRef.onSnapshot(snapshot => {
        const data = snapshot.data();
        if (data && data.status === 'closed' && !appState.isRoomHost) {
            // Eğer odayı kuran kişi çıkmışsa ve biz misafir/öğrenciysek
            alert("Dersi başlatan kişi (Öğretmen/Yönetici) dersten ayrıldı. Ders sonlandırılıyor.");
            closeLiveClassRoom();
        }
    });

    // Tarayıcı kapatılınca tetiklenecek olay
    window.addEventListener('beforeunload', () => {
        if (appState.activeRoomId && appState.isRoomHost) {
            db.collection('rooms').doc(appState.activeRoomId).update({ status: 'closed' });
        }
    });

    // Kameraları (local) ekle
    if (appState.localStream) {
        appState.localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, appState.localStream);
        });
    }

    // Karşı tarafın görüntüsü geldiğinde ekranda göster
    peerConnection.ontrack = event => {
        const stream = event.streams[0];
        const participantName = appState.isInviteMode ? "Öğretmen" : "Öğrenci";
        
        let container = document.getElementById('participants-video-container');
        if (container.innerHTML.includes('Bekleniyor')) {
            container.innerHTML = ''; // Temizle
        }

        if (!document.getElementById('remote-video')) {
            container.innerHTML += `
                <div class="participant-video">
                    <video id="remote-video" autoplay playsinline></video>
                    <div class="participant-name">${participantName}</div>
                </div>
            `;
        }
        document.getElementById('remote-video').srcObject = stream;
        
        if (appState.pipWindow) {
            const pipGrid = appState.pipWindow.document.getElementById('pip-participants-grid');
            if (pipGrid && !appState.pipWindow.document.getElementById('pip-remote-video')) {
                const div = appState.pipWindow.document.createElement('div');
                div.className = 'pip-participant-video';
                div.innerHTML = `<video id="pip-remote-video" autoplay playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>`;
                pipGrid.appendChild(div);
                appState.pipWindow.document.getElementById('pip-remote-video').srcObject = stream;
            }
        }
    };

    // Bağlantı kopması durumu
    peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === 'disconnected' || peerConnection.connectionState === 'failed') {
            const container = document.getElementById('participants-video-container');
            if (container) {
                container.innerHTML = `<div style="padding:20px; color:#aaa;">Karşı tarafın bağlantısı koptu...</div>`;
            }
        }
    };

    if (isHost) {
        const callerCandidatesCollection = roomRef.collection('callerCandidates');
        
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                callerCandidatesCollection.add(event.candidate.toJSON());
            }
        };

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        const roomWithOffer = {
            offer: { type: offer.type, sdp: offer.sdp },
            createdAt: new Date(),
            status: 'active'
        };
        await roomRef.set(roomWithOffer);

        appState.unsubscribeAnswer = roomRef.onSnapshot(async snapshot => {
            const data = snapshot.data();
            if (!peerConnection.currentRemoteDescription && data && data.answer) {
                const rtcSessionDescription = new RTCSessionDescription(data.answer);
                await peerConnection.setRemoteDescription(rtcSessionDescription);
            }
        });

        appState.unsubscribeIce = roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(async change => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    await peerConnection.addIceCandidate(new RTCIceCandidate(data));
                }
            });
        });
        
    } else {
        const calleeCandidatesCollection = roomRef.collection('calleeCandidates');
        
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                calleeCandidatesCollection.add(event.candidate.toJSON());
            }
        };

        const roomSnapshot = await roomRef.get();
        if (roomSnapshot.exists && roomSnapshot.data().status !== 'closed') {
            const offer = roomSnapshot.data().offer;
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            
            await roomRef.update({
                answer: { type: answer.type, sdp: answer.sdp }
            });

            appState.unsubscribeIce = roomRef.collection('callerCandidates').onSnapshot(snapshot => {
                snapshot.docChanges().forEach(async change => {
                    if (change.type === 'added') {
                        const data = change.doc.data();
                        await peerConnection.addIceCandidate(new RTCIceCandidate(data));
                    }
                });
            });
        } else {
            alert("Bu ders şu anda aktif değil veya sonlandırılmış.");
            closeLiveClassRoom();
        }
    }
}

