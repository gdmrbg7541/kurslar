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
        
        // Geçmiş kazanımlara (veya aktif olana) tıklayarak geri dönebilme
        if (i <= appState.currentKazanim) {
            node.style.cursor = 'pointer';
            node.onclick = () => {
                appState.currentKazanim = i;
                renderKazanimTimeline();
                if(typeof loadKazanimData === 'function') loadKazanimData();
            };
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
        
        if (stepData.videoUrl) {
            stepData.contentBlocks = [
                {type: 'video', url: stepData.videoUrl},
                {type: 'text', content: stepData.text}
            ];
        } else if (stepData.text) {
            stepData.contentBlocks = [{type: 'text', content: stepData.text}];
        } else {
            stepData.contentBlocks = [];
        }
        
        if (stepData.contentBlocks && stepData.contentBlocks.length > 0) {
            contentHtml = stepData.contentBlocks.map(b => {
                if (b.type === 'text') return `<div style="margin-bottom:15px; line-height:1.6; font-size:1.05rem; color:#333;">${(b.content||'').replace(/\n/g, '<br>')}</div>`;
                if (b.type === 'image' && b.url) return `<div style="text-align:center; margin-bottom:15px;"><img src="${b.url}" style="max-height: 50vh; width:auto; max-width:100%; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1);"></div>`;
                if (b.type === 'video' && b.url) {
                    let finalUrl = b.url;
                    try {
                        if (finalUrl.includes('youtube.com/watch')) {
                            let urlObj = new URL(finalUrl);
                            let videoId = urlObj.searchParams.get('v');
                            let list = urlObj.searchParams.get('list');
                            finalUrl = `https://www.youtube.com/embed/${videoId}`;
                            if(list) finalUrl += `?list=${list}`;
                        } else if (finalUrl.includes('youtu.be/')) {
                            let videoId = finalUrl.split('youtu.be/')[1].split('?')[0];
                            finalUrl = `https://www.youtube.com/embed/${videoId}`;
                        }
                    } catch(e) {}
                    return `<div style="text-align:center; margin-bottom:15px; display:flex; justify-content:center; align-items:center; width:100%;"><iframe src="${finalUrl}" style="width:100%; max-width:950px; aspect-ratio:4/3; max-height:65vh; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1);" frameborder="0" allowfullscreen></iframe></div>`;
                }
                return '';
            }).join('');
        }
    }
    
    if(t) t.innerHTML = contentHtml;
    
    // Yalnızca dolu olan container'ı göster
    let matContainer = document.getElementById('lesson-material-container');
    if (matContainer) {
        if (!stepData || (!stepData.text && !stepData.videoUrl)) {
            matContainer.style.display = 'none';
        } else {
            matContainer.style.display = 'block';
        }
    }
    
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
                    qHtml += `<button class="mc-option-btn" ${idAttr} style="text-align:left; padding:20px 25px; border:1px solid #cbd5e1; border-radius:12px; background:white; cursor:pointer; font-family: inherit; font-size:1.8rem; transition:0.2s;" onmouseover="if(!this.classList.contains('selected')) this.style.background='#f1f5f9'" onmouseout="if(!this.classList.contains('selected')) this.style.background='white'" onclick="selectOption(this, ${isCorrect})"><span style="font-weight:bold; margin-right:15px; color:#4facfe; font-family: sans-serif;">${['A','B','C','D','E'][idx]}</span> ${opt}</button>`;
                });
                qHtml += `</div>`;
            } else if (q.type === 'true_false') {
                qHtml += `
                    <div style="display:flex; gap:20px;">
                        <button class="tf-option-btn" data-base-color="#20C997" ${q.isTrue === true ? 'id="correct-option-btn"' : ''} style="flex:1; padding:25px; background:white; border:2px solid #20C997; color:#20C997; border-radius:12px; font-weight:bold; font-size:1.8rem; font-family: inherit; cursor:pointer; transition:0.2s;" onmouseover="if(!this.classList.contains('selected')){this.style.background='#20C997'; this.style.color='white'}" onmouseout="if(!this.classList.contains('selected')){this.style.background='white'; this.style.color='#20C997'}" onclick="selectOption(this, ${q.isTrue === true})">Doğru</button>
                        <button class="tf-option-btn" data-base-color="#e74c3c" ${q.isTrue === false ? 'id="correct-option-btn"' : ''} style="flex:1; padding:25px; background:white; border:2px solid #e74c3c; color:#e74c3c; border-radius:12px; font-weight:bold; font-size:1.8rem; font-family: inherit; cursor:pointer; transition:0.2s;" onmouseover="if(!this.classList.contains('selected')){this.style.background='#e74c3c'; this.style.color='white'}" onmouseout="if(!this.classList.contains('selected')){this.style.background='white'; this.style.color='#e74c3c'}" onclick="selectOption(this, ${q.isTrue === false})">Yanlış</button>
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
            
            // Eğer soru varsa, Next butonunu başlangıçta devre dışı bırak
            let nextBtn = document.getElementById('next-step-btn');
            if (nextBtn) {
                nextBtn.disabled = true;
                nextBtn.style.opacity = '0.5';
            }
        }
    }
    
    // Geri/İleri butonlarının görünürlüğünü/aktifliğini ayarla
    let prevBtn = document.getElementById('prev-step-btn');
    if (prevBtn) {
        if (appState.currentKazanim <= 1) {
            prevBtn.style.visibility = 'hidden';
        } else {
            prevBtn.style.visibility = 'visible';
        }
    }
    
    let nextBtn = document.getElementById('next-step-btn');
    if (nextBtn) {
        if (appState.currentKazanim > appState.totalKazanimCount) {
            nextBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'inline-block';
            if (appState.currentKazanim === appState.totalKazanimCount) {
                nextBtn.innerText = "Dersi Tamamla";
            } else {
                nextBtn.innerText = "Sonraki Adım >";
            }
            
            // Eğer daha önceden doğru cevaplandıysa butonu aç
            let results = appState.stepResults || {};
            let pkgResults = results[appState.currentPackageId] || {};
            if (pkgResults[appState.currentKazanim] === 'correct' || (!stepData || !stepData.question || stepData.question.type === 'none')) {
                nextBtn.disabled = false;
                nextBtn.style.opacity = '1';
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
    
    renderKazanimTimeline(); // Rengini güncelle
    
    let nextBtn = document.getElementById('next-step-btn');
    if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
        if (isCorrect) {
            nextBtn.classList.add('pulse-animation'); // Sadece doğruysa animasyon ekle
        }
    }
}

window.prevKazanim = function() {
    if (appState.currentKazanim > 1) {
        appState.currentKazanim--;
        renderKazanimTimeline();
        loadKazanimData();
    }
};

window.nextKazanim = function() {
    let nextBtn = document.getElementById('next-step-btn');
    if (nextBtn && nextBtn.disabled) return;
    
    if(appState.currentKazanim < appState.totalKazanimCount) {
        appState.currentKazanim++;
        
        if (!appState.studentProgress["self"]) appState.studentProgress["self"] = {};
        if (!appState.studentProgress["self"][appState.currentUser]) appState.studentProgress["self"][appState.currentUser] = {};
        appState.studentProgress["self"][appState.currentUser][appState.currentPackageId] = appState.currentKazanim;
        saveStudentData();

        renderKazanimTimeline();
        loadKazanimData();
    } else {
        // Tamamlandı
        appState.currentKazanim++;
        if (!appState.studentProgress["self"]) appState.studentProgress["self"] = {};
        if (!appState.studentProgress["self"][appState.currentUser]) appState.studentProgress["self"][appState.currentUser] = {};
        appState.studentProgress["self"][appState.currentUser][appState.currentPackageId] = appState.currentKazanim;
        saveStudentData();
        
        showCustomAlert("TEBRİKLER! Tüm kazanımları başarıyla bitirdiniz.");
        goBack();
    }
}

function joinLesson() {
    if (appState.userRole === "teacher") {
        document.getElementById('join-lesson-container').style.display = 'none';
        document.getElementById('lesson-video-container').style.display = 'block';
        showCustomAlert("Derse başarıyla bağlandınız. Kameranız yayına açıldı.");
        return;
    }

    // Öğrenci için panel görünüyorsa zaten ders saati gelmiş demektir.
    document.getElementById('join-lesson-container').style.display = 'none';
    document.getElementById('lesson-video-container').style.display = 'block';
    showCustomAlert("Derse başarıyla bağlandınız. Eğitmeninizin yayını bekleniyor...");
}

function leaveLesson() {
    document.getElementById('lesson-video-container').style.display = 'none';
    document.getElementById('join-lesson-container').style.display = 'block';
}

