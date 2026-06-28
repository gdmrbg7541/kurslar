/* ==========================================
   ÖĞRETMEN (EĞİTMEN) BİLGİLERİ VE TAKVİMLERİ
   ========================================== */

function createDefaultSchedule() {
    const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
    return days.map(day => ({
        name: day,
        slots: null,  // Dinamik slotlar eklenebilir
        data: {},     // '09:00': 'musait' veya 'dolu' şeklinde veriler tutar
        startH: 9,    // Mesai başlangıcı
        endH: 17      // Mesai bitişi
    }));
}

// Tüm öğretmenlerin tanımlandığı ana liste
window.DATA_OGRETMENLER = [
    { 
        id: "hoca1", 
        name: "Eğitmen Geylani", 
        phone: "+905386482614", 
        email: "hoca1@mail.com", 
        password: "123" 
    },
    {
        id: "hoca2",
        name: "Geylani",
        phone: "Belirtilmedi",
        email: "gylndmrbg@gmail.com",
        password: "VTX29SLh"
    }
];

// Öğretmenlerin haftalık takvimleri
window.DATA_TEACHER_SCHEDULES = {
    "hoca1": createDefaultSchedule(),
    "hoca2": createDefaultSchedule()
};
