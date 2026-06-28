function renderOnlinePackagesGrid() {
    const listEl = document.getElementById('online-package-list-area');
    if (!listEl) return;
    
    // Temizle
    listEl.innerHTML = '';
    
    appState.onlinePackages.forEach(pkg => {
        const isPurchased = appState.purchasedPackages.includes(pkg.id);
        const isSelected = appState.selectedOnlinePackages.find(p => p.id === pkg.id);
        
        const card = document.createElement('div');
        card.className = `glass-card package-card ${isSelected ? 'selected' : ''}`;
        if (isPurchased) {
            card.style.opacity = "0.7";
            card.style.pointerEvents = "none";
        }

        let checkIconClass = isSelected ? 'fas fa-check-circle' : 'far fa-circle';
        if (isPurchased) checkIconClass = 'fas fa-lock';

        card.style.display = "flex";
        card.style.alignItems = "center";
        card.style.padding = "15px 20px";
        card.style.cursor = "pointer";
        card.style.border = isSelected ? "2px solid #20C997" : "1px solid #eee";

        const statusBadge = isPurchased 
            ? `<span class="badge badge-success" style="margin-left: 10px; font-size: 0.75rem;">✓ Sahipsiniz</span>`
            : ``;

        let html = `
            <div style="margin-right: 15px; font-size: 1.5rem; color: ${isSelected ? '#20C997' : '#ccc'};">
                <i class="${checkIconClass}"></i>
            </div>
            ${pkg.fasikulPdf ? `
            <div style="margin-right: 15px; width: 60px; height: 80px; border: 1px solid #eee; border-radius: 4px; overflow: hidden; background: #fff; flex-shrink: 0;">
                <img src="${pkg.fasikulPdf}" style="width: 100%; height: 100%; object-fit: cover;" alt="Paket Görseli">
            </div>` : ''}
            <div style="flex: 1;">
                <h4 style="margin: 0; font-size: 1.1rem; color: #333; display: flex; align-items: center;">
                    ${pkg.name} ${statusBadge}
                </h4>
            </div>
            <div style="margin-right: 15px; font-weight: bold; color: #F39C12; font-size: 1.2rem;">
                ${pkg.price} ₺
            </div>
            <div onclick="openOnlinePackageModal(${pkg.id}); event.stopPropagation();" title="Paket Detayları" style="padding: 6px 14px; font-size: 0.85rem; font-weight: bold; background: rgba(79, 172, 254, 0.1); color: #4facfe; border: 1px solid rgba(79, 172, 254, 0.4); border-radius: 20px; cursor: pointer; transition: 0.2s; white-space: nowrap; flex-shrink: 0;" onmouseover="this.style.background='#4facfe'; this.style.color='white';" onmouseout="this.style.background='rgba(79, 172, 254, 0.1)'; this.style.color='#4facfe';">
                Detaylar
            </div>
        `;
        
        card.innerHTML = html;
        if (!isPurchased) {
            card.onclick = () => selectOnlinePackage(pkg.id, card);
        }
        
        listEl.appendChild(card);
    });
}

function selectOnlinePackage(id, el) {
    if (appState.purchasedPackages.includes(id)) return;
    
    const pkg = appState.onlinePackages.find(x => x.id === id);
    if (!pkg) return;
    
    const index = appState.selectedOnlinePackages.findIndex(x => x.id === id);
    if (index > -1) {
        appState.selectedOnlinePackages.splice(index, 1);
        if(el) el.classList.remove('selected');
    } else {
        appState.selectedOnlinePackages.push(pkg);
        if(el) el.classList.add('selected');
    }
    
    updateOnlineSummary();
    renderOnlinePackagesGrid(); // Re-render to update UI check icons
}

function updateOnlineSummary() {
    const summaryDiv = document.getElementById('online-checkout-summary');
    const totalText = document.getElementById('online-total-text');
    if (!summaryDiv || !totalText) return;
    
    if (appState.selectedOnlinePackages.length > 0) {
        let total = 0;
        appState.selectedOnlinePackages.forEach(pkg => {
            let priceNum = typeof pkg.price === 'number' ? pkg.price : parseInt(pkg.price.toString().replace(/[^0-9]/g, ''));
            total += priceNum;
        });
        totalText.innerText = `Toplam: ${total.toLocaleString('tr-TR')} ₺`;
        summaryDiv.style.display = 'flex';
    } else {
        summaryDiv.style.display = 'none';
    }
}

function openOnlinePackageModal(id) {
    const pkg = appState.onlinePackages.find(p => p.id === id);
    if (!pkg) return;
    
    document.getElementById('modal-pkg-title').innerText = pkg.name;
    document.getElementById('modal-pkg-price').innerText = pkg.price + ' ₺';
    
    let html = `
        <p style="font-size: 1.1rem; line-height: 1.6; color: #555; margin-bottom: 20px;">${pkg.desc}</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #4facfe;">
                <div style="font-size: 0.85rem; color: #888; margin-bottom: 5px;">Süre/Periyot</div>
                <div style="font-weight: bold; color: #333;">${pkg.hours}</div>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #F39C12;">
                <div style="font-size: 0.85rem; color: #888; margin-bottom: 5px;">Materyal</div>
                <div style="font-weight: bold; color: #333;">${pkg.material}</div>
            </div>
        </div>
    `;

    if (pkg.fasikulPdf) {
        html += `
        <div style="grid-column: 1 / -1; margin-top: 10px;">
            <div style="font-weight: bold; color: #555; margin-bottom: 8px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#20C997" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> Paket İçeriği</div>
            <div style="max-width: 150px; margin: 0 auto; border: 1px solid #ccc; border-radius: 8px; overflow: hidden; background: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <img src="${pkg.fasikulPdf}" style="width: 100%; display: block;" alt="Paket Görseli">
            </div>
        </div>`;
    }

    document.getElementById('modal-pkg-details-container').innerHTML = html;
    
    const isPurchased = appState.purchasedPackages.includes(id);
    const isSelected = appState.selectedOnlinePackages.find(p => p.id === id);
    let footerHtml = `<button class="btn btn-secondary" onclick="closePackageModal()" style="flex:1;">Kapat</button>`;
    
    if (!isPurchased) {
        if (isSelected) {
            footerHtml += `<button class="btn btn-danger" onclick="selectOnlinePackage(${id}, null); closePackageModal();" style="flex:1;">Paketi Çıkar</button>`;
        } else {
            footerHtml += `<button class="btn btn-success" onclick="selectOnlinePackage(${id}, null); closePackageModal();" style="flex:1;">Paketi Seç</button>`;
        }
    }
    
    document.getElementById('modal-pkg-footer').innerHTML = footerHtml;
    document.getElementById('package-info-modal').style.display = 'flex';
}

window.bookOnlinePackages = function() {
    if (appState.selectedOnlinePackages.length === 0) {
        showCustomAlert("Lütfen en az bir paket seçin.");
        return;
    }
    
    // Takvim seçimi için "Ders Talep Et" (booking-section) ekranına yönlendiriyoruz
    changeView('booking-section');
    
    // Step 1'i (Paket oluşturma) kapat
    const step1 = document.getElementById('online-step-1');
    if (step1) {
        step1.style.maxHeight = "70px";
        step1.style.opacity = "0.5";
        step1.style.pointerEvents = "none";
    }

    // Step 2'yi (Takvim) aç
    const step2 = document.getElementById('online-step-2');
    if (step2) {
        step2.style.maxHeight = "3000px";
        step2.style.opacity = "1";
        step2.style.pointerEvents = "auto";
        setTimeout(() => {
            step2.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
    
    // Eğitmen listesini (gizli olsa da) ve takvimi yenile
    if (typeof refreshTeacherSelect === "function") {
        refreshTeacherSelect();
    }
    
    showCustomAlert("Paketiniz seçildi! Lütfen takvimden ders saatlerinizi işaretleyin.");
}
