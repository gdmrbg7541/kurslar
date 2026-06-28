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
            card.onclick = () => openPackageModal('offline', pkg.id); 
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
            ${pkg.fasikulPdf ? `
            <div style="margin-right: 15px; width: 60px; height: 80px; border: 1px solid #eee; border-radius: 4px; overflow: hidden; background: #fff; flex-shrink: 0;">
                <img src="${pkg.fasikulPdf}" style="width: 100%; height: 100%; object-fit: cover;" alt="Fasikül Kapak">
            </div>` : ''}
            <div style="flex: 1;">
                <h4 style="margin: 0; font-size: 1.1rem; color: #333; display: flex; align-items: center;">
                    ${pkg.title} ${statusBadge}
                </h4>
            </div>
            <div style="margin-right: 15px; font-weight: bold; color: #F39C12; font-size: 1.2rem;">
                ${pkg.price} ₺
            </div>
            <div onclick="openPackageModal('offline', ${pkg.id}); event.stopPropagation();" title="Paket Detayları" style="padding: 6px 14px; font-size: 0.85rem; font-weight: bold; background: rgba(79, 172, 254, 0.1); color: #4facfe; border: 1px solid rgba(79, 172, 254, 0.4); border-radius: 20px; cursor: pointer; transition: 0.2s; white-space: nowrap; flex-shrink: 0;" onmouseover="this.style.background='#4facfe'; this.style.color='white';" onmouseout="this.style.background='rgba(79, 172, 254, 0.1)'; this.style.color='#4facfe';">
                Detaylar
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
                let priceNum = typeof pkg.price === 'number' ? pkg.price : parseInt(pkg.price.replace(/[^0-9]/g, ''));
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
        
        // Kaldığı yerden devam etme mantığı
        let savedStep = 1;
        if (appState.studentProgress["self"] && 
            appState.studentProgress["self"][appState.currentUser] && 
            appState.studentProgress["self"][appState.currentUser][packageId]) {
            savedStep = appState.studentProgress["self"][appState.currentUser][packageId];
        }
        
        appState.currentKazanim = savedStep;
        appState.totalKazanimCount = (appState.kazanimData[packageId] && appState.kazanimData[packageId].total) ? appState.kazanimData[packageId].total : 40;
        document.getElementById('current-package-title').innerText = packageName;
        renderKazanimTimeline();
        changeView('active-package');
        
        // GÖRÜNTÜYÜ OLUŞTURAN FONKSİYONU ÇAĞIRIYORUZ
        if (typeof loadKazanimData === 'function') {
            loadKazanimData();
        }
    }
}

function openPackageModal(type, id) {
    const modal = document.getElementById('package-info-modal');
    const titleEl = document.getElementById('modal-pkg-title');
    const priceEl = document.getElementById('modal-pkg-price');
    const detailsContainer = document.getElementById('modal-pkg-details-container');
    
    if (!modal) return;
    
    let html = '';
    
    if (type === 'offline') {
        const pkg = appState.packages.find(x => x.id === id);
        if (!pkg) return;
        
        titleEl.innerText = pkg.title;
        priceEl.innerText = pkg.price;
        
        html += `<div style="display: grid; grid-template-columns: 1fr; gap: 15px; margin-top: 10px;">`;
        
        html += `
            <div style="background: rgba(0,0,0,0.02); padding: 15px; border-radius: 12px; border: 1px solid #f0f0f0;">
                <div style="font-weight: bold; color: #555; margin-bottom: 8px; font-size: 1.1rem;">📝 Açıklama</div>
                <div style="color: #333; line-height: 1.5;">${pkg.description}</div>
            </div>
            
            <div style="background: rgba(0,0,0,0.02); padding: 15px; border-radius: 12px; border: 1px solid #f0f0f0;">
                <div style="font-weight: bold; color: #555; margin-bottom: 8px; font-size: 1.1rem;">⏱ Süre</div>
                <div style="color: #333; line-height: 1.5;">${pkg.duration}</div>
            </div>
        `;
        
        if (pkg.target) {
            html += `
            <div style="background: rgba(0,0,0,0.02); padding: 15px; border-radius: 12px; border: 1px solid #f0f0f0;">
                <div style="font-weight: bold; color: #555; margin-bottom: 8px; font-size: 1.1rem;">🎯 Hedef Kazanım</div>
                <div style="color: #333; line-height: 1.5;">${pkg.target}</div>
            </div>`;
        }

        if (pkg.fasikulPdf) {
            html += `
            <div style="grid-column: 1 / -1; margin-top: 10px;">
                <div style="font-weight: bold; color: #555; margin-bottom: 8px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#20C997" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> Ders Fasikülü Önizleme</div>
                <div style="max-width: 150px; margin: 0 auto; border: 1px solid #ccc; border-radius: 8px; overflow: hidden; background: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    <img src="${pkg.fasikulPdf}" style="width: 100%; display: block;" alt="Ders Fasikülü">
                </div>
                <div style="text-align: center; margin-top: 8px; font-size: 0.85rem; color: #888;">
                    * Bu sadece önizleme kapağıdır. İçeriğin tamamı eğitim esnasında etkileşimli (flipbook) olarak sunulacaktır.
                </div>
            </div>`;
        }


        
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
        let p;
        if (id === 100) {
            p = {
                name: "Özel Ders Talep Et",
                price: appState.customLessonCount ? appState.customLessonCount * 400 : 400,
                hours: appState.customLessonCount ? appState.customLessonCount + " Saat" : "Belirtilmedi",
                material: "Öğrenci Talebine Göre Özel Kaynaklar",
                desc: "İhtiyacınıza yönelik birebir özel canlı ders imkanı. Sınavlara hazırlık, mülakat pratiği veya eksik konularınız üzerine yoğunlaştırılmış program. (1 Ders = 40 Dakika)"
            };
        } else {
            p = appState.onlinePackages.find(x => x.id === id);
        }
        if (!p) return;
        
        titleEl.innerText = p.name;
        priceEl.innerText = (p.price || 0).toLocaleString('tr-TR') + ' ₺';
        
        html += `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
            <div style="background: rgba(0,0,0,0.02); padding: 15px; border-radius: 12px; border: 1px solid #f0f0f0;">
                <div style="font-weight: bold; color: #555; margin-bottom: 8px; font-size: 1.1rem;">⏳ Ders Saati</div>
                <div style="color: #333; font-size: 1.05rem;">${p.hours} Saat (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F39C12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 4px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>40dk)</div>
            </div>
            
            <div style="background: rgba(0,0,0,0.02); padding: 15px; border-radius: 12px; border: 1px solid #f0f0f0;">
                <div style="font-weight: bold; color: #555; margin-bottom: 8px; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4facfe" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> Kullanılacak Materyal</div>
                <div style="color: #333; line-height: 1.5;">${p.material}</div>
            </div>
            
            <div style="background: rgba(0,0,0,0.02); padding: 15px; border-radius: 12px; border: 1px solid #f0f0f0; grid-column: 1 / -1;">
                <div style="font-weight: bold; color: #555; margin-bottom: 8px; font-size: 1.1rem;">📝 Açıklama</div>
                <div style="color: #333; line-height: 1.6;">${p.desc}</div>
            </div>
        </div>
        `;
        

    }
    
    detailsContainer.innerHTML = html;
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
        showCustomAlert("Lütfen devam etmek için en az bir paket seçin.");
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
        showCustomAlert("Lütfen takvimden yeşil renkli en az bir ders saati seçin.");
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
                showCustomAlert("Lütfen önce takvimden saat seçimi yapınız.");
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
        teacherSelect.innerHTML = ''; 
        appState.teachers.forEach(teacher => {
            // Sadece ana hocayı (hoca1) veya tüm listeyi ekle. İsteğe göre filtrelenebilir.
            // Ama tek hoca kalacağı için hepsini eklesek de 1 tane olacak.
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
                        const allLessons = [...(appState.approvedLessons || []), ...(appState.pendingLessons || [])];
                        const bookedLesson = allLessons.find(l => String(l.requestedTeacherId) === String(selectedTeacherId) && l.slots && l.slots.includes(slotFullString));
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
            showCustomAlert(`Seçtiğiniz ders sayısına (${maxAllowed} ders) ulaştınız. Her ders <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F39C12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin: 0 4px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>40dk sürmektedir.`);
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
    if (appState.selectedOnlinePackages.length === 0) { showCustomAlert("Lütfen en az bir konuşma paketi seçin."); return; }
    if (!appState.selectedSlots || appState.selectedSlots.length === 0) { showCustomAlert("Lütfen takvimden yeşil renkli en az bir ders saati seçin."); return; }
    
    // Çoklu paketler için özel tip yolluyoruz
    openCheckoutFlow('online_multiple', null);
}


