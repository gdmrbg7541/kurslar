/* ==========================================
   EĞİTİM PAKETLERİ, KAZANIMLAR VE SORULAR
   ========================================== */

// 1. ÇEVRİMDIŞI (VİDEO/ÖZEL) EĞİTİM PAKETLERİ
window.DATA_PAKETLER = [
    {
        id: 1,
        title: "Sarfa Giriş", 
        description: "6 kalıp üzerinden animasyonlu bir şekilde kök-vezin mantığını video eşliğinde öğreneceksiniz.", 
        duration: "1 Ders",
        price: 400,
        requirements: ["Arapçaya sıfırdan başlayanlar içindir."],
        target: "Animasyonlu anlatımla 6 kalıbı ve kök-vezin mantığını kalıcı bir şekilde kavramak.",
        fasikulPdf: "sarf.png",
        pdfLink: "sarfbilgisi.pdf",
        // Paketin içeriği: Kazanımlar (Müfredat)
        kazanimlar: [
            {
                adim: 1,
                baslik: "Kök ve Vezin Mantığı",
                konuAnlatimi: "Bu derste Arapça kelimelerin yapısını oluşturan 6 temel kalıbı (vezni) inceleyeceğiz. Vezinlerdeki kırmızı zaid harfleri köklere ekleyerek yeni kelimeler elde edeceğiz.",
                videoUrl: "https://www.youtube.com/watch?v=R2wFGPbU3r4",
                sorular: [
                    {
                        tip: "coktan_secmeli",
                        soru: "Aşağıdaki kelimelerden hangisi مفعول kalıbından türetilmiştir?",
                        secenekler: ["فَاتِح", "مَكْتُوب", "مَجْلِس", "تَرْتِيب"],
                        dogruCevap: "مَكْتُوب"
                    },
                    {
                        tip: "eslestirme",
                        soru: "Kelimeleri uygun oldukları kalıplarla (vezinlerle) eşleştiriniz.",
                        ciftler: {
                            "كَاتِب, عَالِم": "فاعل",
                            "مَوْقِع, مَسْجِد": "مفعل",
                            "جَلَّاد, قَهَّار": "فعّال",
                            "تَسْبِيح, تَرْجِيح": "تفعيل"
                        }
                    },
                    {
                        tip: "coktan_secmeli",
                        soru: "يَفْتَحُ, يَجْعَلُ, يَلْعَبُ kelimeleri تفعيل kalıbındadır. Bu ifade doğru mudur?",
                        secenekler: ["Doğru", "Yanlış (يفعل kalıbındadır)"],
                        dogruCevap: "Yanlış (يفعل kalıbındadır)"
                    }
                ]
            }
        ]
    },
    {
        id: 2,
        title: "Temel Sarf ve Nahiv (A2 Giriş)", 
        description: "İsim ve Fiil cümleleri, kelime çekim mantığı ve kural dışı fiiller.",
        duration: "20 Saat",
        price: 750,
        requirements: ["Harfleri ve harekeleri akıcı okuyabilmek"],
        target: "Cümle kurulumundaki temel mantığı kavramak ve fiil çekimlerindeki ezber zorluğunu algoritmik bir yöntemle çözmek.",
        fasikulPdf: "fasikul.jpg",
        kazanimlar: []
    },
    {
        id: 3,
        title: "Kapsamlı Cümle Analizi (B1 Orta)", 
        description: "Harekesiz metinleri doğru okuyabilmek için uygulamalı dilbilgisi ve İrab.",
        duration: "30 Saat",
        price: 1150,
        requirements: ["A2 seviyesi gramer ve kelime bilgisi"],
        target: "Cümle içindeki ögelerin (fail, meful, muzafun ileyh vb.) harekesini doğru tahmin edememe ve irabını yapamama sorununu gidermek.",
        fasikulPdf: "fasikul.jpg",
        kazanimlar: []
    },
    {
        id: 4,
        title: "Haber ve Modern Metin Çevirisi (B2 İleri Orta)", 
        description: "Modern standart Arapça (Fusha) ile güncel medya ve haber metinleri çevirisi.",
        duration: "40 Saat",
        price: 1600,
        requirements: ["B1 seviyesi metinleri rahat okuyabilmek", "Sözlük kullanım becerisi"],
        target: "Güncel, siyasi ve sosyal metinlerdeki kalıp ifadeleri tanımak ve Türkçeye anadil doğallığında çevirebilme yeteneği kazanmak.",
        fasikulPdf: "fasikul.jpg",
        kazanimlar: []
    },
    {
        id: 5,
        title: "Klasik ve Akademik Metinler (C1 İleri)", 
        description: "YDS/YÖKDİL sınavlarına hazırlık ve klasik eserlerde (Tefsir, Hadis vb.) anlam çözümleri.",
        duration: "50 Saat",
        price: 2200,
        requirements: ["İleri seviye nahiv bilgisi", "Geniş kelime dağarcığı"],
        target: "Akademik sınavlardaki ve edebi/klasik metinlerdeki karmaşık, uzun ve iç içe geçmiş cümle yapılarını kolayca analiz edebilmek.",
        fasikulPdf: "fasikul.jpg",
        kazanimlar: []
    },
    {
        id: 6,
        title: "Belağat ve İfade Sanatı (C2 Uzman)", 
        description: "Arapçanın edebi derinliği; Meâni, Beyân ve Bedi ilimlerine giriş.",
        duration: "45 Saat",
        price: 2500,
        requirements: ["C1 seviyesi yetkinliği", "Arapça ile tam bir hakimiyet"],
        target: "Metinlerdeki mecazları, teşbihleri ve edebi sanatları fark ederek edebi ve Kur'ani metinlerin asıl ruhunu kavrayabilmek.",
        fasikulPdf: "fasikul.jpg",
        kazanimlar: []
    }
];

// 2. CANLI (ONLINE) DERS PAKETLERİ
window.DATA_CANLI_PAKETLER = [
    { id: 101, name: "A1-A2 Pratik Konuşma (Muhadese)", price: 1500, fasikulPdf: "fasikul.jpg", desc: "Cümle kurarken duraksamaları ve özgüven eksikliğini gidermek için yoğun günlük diyalog pratiği.", hours: "10 Saat / Ay", material: "PDF Diyaloglar & Ses Kayıtları" },
    { id: 102, name: "B1-B2 Aktif Kelime Hafızası", price: 1800, fasikulPdf: "fasikul.jpg", desc: "Öğrenilen fakat konuşma anında hatırlanamayan kelime ve fiilleri zihinde aktif hale getirme çalışmaları.", hours: "12 Saat / Ay", material: "Kelime Kartları & Anlık Çeviri Testleri" },
    { id: 103, name: "YDS/YÖKDİL Taktikleri", price: 2500, fasikulPdf: "fasikul.jpg", desc: "Sınavda zaman kaybettiren paragraf soruları ve boşluk doldurma mantığı üzerine birebir eğitmen analizi.", hours: "16 Saat / Ay", material: "Çıkmış Sorular & Özel Taktik Notları" },
    { id: 104, name: "C1-C2 İleri Seviye Konuşma Kulübü", price: 3000, fasikulPdf: "fasikul.jpg", desc: "Tamamen Arapça yürütülen, siyaset, edebiyat ve güncel meselelerin tartışıldığı ileri düzey oturumlar.", hours: "20 Saat / Ay", material: "Makaleler & Medya Analizleri" }
];
