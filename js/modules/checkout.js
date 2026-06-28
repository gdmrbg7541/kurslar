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
        showCustomAlert("IBAN panoya kopyalandı!");
    });
}

function confirmPurchase() {
    if (appState.currentUser === "Misafir Öğrenci") {
        showCustomAlert("Lütfen önce giriş yapın veya kayıt olun.");
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

        // WhatsApp Mesajı Oluşturma
        const studentName = appState.currentUserName || "Öğrenci";
        
        let groupedSlots = {};
        appState.selectedSlots.forEach(slot => {
            let parts = slot.trim().split(' ');
            let time = parts.pop();
            let dateStr = parts.join(' ');
            if (!groupedSlots[dateStr]) groupedSlots[dateStr] = [];
            groupedSlots[dateStr].push(time);
        });

        let slotsText = Object.keys(groupedSlots).map(dateStr => {
            return `👉 ${dateStr}: ${groupedSlots[dateStr].join(', ')}`;
        }).join('\n');

        let wpMessage = `Merhaba, ben ${studentName}.\nSitenizden Canlı Ders Paketi satın aldım ve ödemesini gerçekleştirdim.\n\n📚 Aldığım Paketler: ${pkgsNames}\n\n🗓️ Seçtiğim Ders Gün ve Saatleri:\n${slotsText}\n\nOnayınızı bekliyorum, teşekkürler.`;
        let wpUrl = `https://wa.me/905386482614?text=${encodeURIComponent(wpMessage)}`;

        // Kullanıcıyı WhatsApp'a yönlendir (Sessiz gönderim olmadığı için manuel açılır)
        window.open(wpUrl, '_blank');

        let alertMessage = "Ödemeniz sistemimize işlendi ve WhatsApp'a yönlendirildiniz. ";
        if (selectedTeacherId === "any" || !selectedTeacherId) {
            alertMessage += "Randevu talebiniz sistemdeki ortak havuza başarıyla iletildi.";
        } else {
            const selectedTeacher = appState.teachers.find(t => t.id === selectedTeacherId);
            const teacherFirstName = selectedTeacher.name.split(' ')[1] || selectedTeacher.name; 
            alertMessage += `Randevu talebiniz doğrudan ${teacherFirstName} Hocaya sistem üzerinden iletildi.`;
        }

        showCustomAlert(alertMessage);
        
        changeView('dashboard-section');
        appState.selectedOnlinePackages = [];
        appState.selectedSlots = [];
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
