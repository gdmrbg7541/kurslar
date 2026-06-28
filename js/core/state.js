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
    profileScrollPos: 0,
    profileDetailsOpen: false,
    
    // Yeni Eklenenler (Randevu Takibi ve Öğretmen Araçları)
    pendingLessons: [],
    approvedLessons: [],
    teacherAlarms: {},
    studentProgress: {},
    kazanimData: {},
    
    teachers: window.DATA_OGRETMENLER || [],
    packages: window.DATA_PAKETLER || [],
    onlinePackages: window.DATA_CANLI_PAKETLER || []
};

let teacherSchedules = window.DATA_TEACHER_SCHEDULES || {};




// Otomatik Kazanım Data Dönüşümü
// paketler.js içindeki 'kazanimlar' alanını tek pencereli (flattened) yapıya dönüştürüyoruz.
if (appState.packages && appState.packages.length > 0) {
    appState.packages.forEach(pkg => {
        if (pkg.kazanimlar && pkg.kazanimlar.length > 0) {
            let stepsObj = {};
            let globalStepNum = 1;
            
            pkg.kazanimlar.forEach(kazanim => {
                // Parça 1: Eğitim Materyali (Video veya Konu Anlatımı)
                if (kazanim.videoUrl || kazanim.konuAnlatimi) {
                    stepsObj[globalStepNum] = {
                        title: kazanim.baslik,
                        text: kazanim.konuAnlatimi,
                        videoUrl: kazanim.videoUrl,
                        question: { type: 'none' },
                        pdfLink: pkg.pdfLink // Video adımında PDF de görünebilsin
                    };
                    globalStepNum++;
                }
                
                // Parça 2..N: Sorular (Her soru ayrı bir adım olur)
                if (kazanim.sorular && kazanim.sorular.length > 0) {
                    kazanim.sorular.forEach((s, idx) => {
                        let qData = { type: 'none' };
                        if (s.tip === 'coktan_secmeli') {
                            let correctIdx = s.secenekler.indexOf(s.dogruCevap);
                            qData = { type: 'multiple_choice', text: s.soru, options: s.secenekler, correctOptionIndex: correctIdx };
                        } else if (s.tip === 'eslestirme') {
                            let pairsArr = [];
                            if (s.ciftler) {
                                for (let key in s.ciftler) {
                                    pairsArr.push({ left: key, right: s.ciftler[key] });
                                }
                            }
                            qData = { type: 'matching', text: s.soru, pairs: pairsArr };
                        } else if (s.tip === 'bosluk_doldurma') {
                            qData = { type: 'multiple_choice', text: s.soru, options: [s.dogruCevap, "Yanlış Seçenek"], correctOptionIndex: 0 };
                        }
                        
                        stepsObj[globalStepNum] = {
                            title: kazanim.baslik + (kazanim.sorular.length > 1 ? ` - Soru ${idx+1}` : " - Soru"),
                            text: "",
                            videoUrl: "",
                            question: qData
                        };
                        globalStepNum++;
                    });
                }
            });
            
            let totalSteps = globalStepNum - 1;
            appState.kazanimData[pkg.id] = {
                total: totalSteps,
                steps: stepsObj
            };
        }
    });
}

