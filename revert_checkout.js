const fs = require('fs');
const content = `/* ==========================================
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
        
        checkoutInfo.innerHTML = \`
            <h3>Seçilen Paketler (Canlı Ders)</h3>
            <div class="checkout-pkg-card">
                \${pkgs.map(p => \`<div style="margin-bottom: 10px;"><strong>\${p.name}</strong><br><span style="font-size:0.9rem; color:#555;">\${p.price.toLocaleString('tr-TR')} ₺</span></div>\`).join('')}
                <hr style="border-color:rgba(0,0,0,0.1); margin: 15px 0;">
                <div class="checkout-price" style="color:#20C997;">Toplam: \${total.toLocaleString('tr-TR')} ₺</div>
            </div>
            <div id="reusable-slots-table-container">
                \${getCheckoutSlotsHtml()}
            </div>
            <div class="iban-box glass-card mt-20">
                <h4>Banka Havalesi / EFT</h4>
                <p>Aşağıdaki IBAN numarasına ödemeyi gerçekleştirdikten sonra işlemi onaylayın.</p>
                <div class="iban-number">TR00 0000 0000 0000 0000 0000 00</div>
                <button class="btn btn-secondary mt-10" onclick="copyIban()">IBAN Kopyala</button>
            </div>
        \`;
    } else if (type === 'offline_multiple') {
        appState.selectedPackageForPayment = null; 
        const pkgs = appState.selectedOfflinePackages.map(id => appState.packages.find(p => p.id === id)).filter(Boolean);
        let total = 0;
        pkgs.forEach(p => {
            total += typeof p.price === 'number' ? p.price : parseInt(p.price.replace(/[^0-9]/g, ''));
        });
        
        checkoutInfo.innerHTML = \`
            <h3>Seçilen Paketler (Özel Eğitim)</h3>
            <div class="checkout-pkg-card">
                \${pkgs.map(p => \`<div style="margin-bottom: 10px;"><strong>\${p.title}</strong><br><span style="font-size:0.9rem; color:#555;">\${p.price}</span></div>\`).join('')}
                <hr style="border-color:rgba(0,0,0,0.1); margin: 15px 0;">
                <div class="checkout-price" style="color:#20C997;">Toplam: \${total.toLocaleString('tr-TR')} ₺</div>
            </div>
            <div class="iban-box glass-card mt-20">
                <h4>Banka Havalesi / EFT</h4>
                <p>Aşağıdaki IBAN numarasına ödemeyi gerçekleştirdikten sonra işlemi onaylayın.</p>
                <div class="iban-number">TR00 0000 0000 0000 0000 0000 00</div>
                <button class="btn btn-secondary mt-10" onclick="copyIban()">IBAN Kopyala</button>
            </div>
        \`;
    } else {
        let pkg;
        if (type === 'offline') {
            pkg = appState.packages.find(p => p.id === packageId);
        } else {
            pkg = appState.onlinePackages.find(p => p.id === packageId);
        }

        if(!pkg) return;
        appState.selectedPackageForPayment = pkg;
        
        checkoutInfo.innerHTML = \`
            <h3>Seçilen Paket</h3>
            <div class="checkout-pkg-card">
                <h4>\${pkg.title || pkg.name}</h4>
                <p>\${pkg.description || pkg.desc || ''}</p>
                <div class="checkout-price">\${typeof pkg.price === 'number' ? pkg.price.toLocaleString('tr-TR') + ' ₺' : pkg.price}</div>
            </div>
            <div class="iban-box glass-card mt-20">
                <h4>Banka Havalesi / EFT</h4>
                <p>Aşağıdaki IBAN numarasına ödemeyi gerçekleştirdikten sonra işlemi onaylayın.</p>
                <div class="iban-number">TR00 0000 0000 0000 0000 0000 00</div>
                <button class="btn btn-secondary mt-10" onclick="copyIban()">IBAN Kopyala</button>
            </div>
        \`;
    }

    // Sol Taraf (Auth veya Giriş Yapıldı bilgisi)
    renderCheckoutAuthView();
    prefillEmail();
    changeView('checkout-section');
}
`;

const file = fs.readFileSync('/Users/gylndmrbg/Documents/📚 Arapça/ka.com/Kurslar-Dersler/js/modules/checkout.js', 'utf8');
const restOfFile = file.substring(file.indexOf('function renderCheckoutAuthView()'));
fs.writeFileSync('/Users/gylndmrbg/Documents/📚 Arapça/ka.com/Kurslar-Dersler/js/modules/checkout.js', content + '\n' + restOfFile, 'utf8');
