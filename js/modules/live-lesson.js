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
            showCustomAlert("Dersi başlatan kişi (Öğretmen/Yönetici) dersten ayrıldı. Ders sonlandırılıyor.");
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
            showCustomAlert("Bu ders şu anda aktif değil veya sonlandırılmış.");
            closeLiveClassRoom();
        }
    }
}


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
            <h4 style="color: #F39C12; display: flex; align-items: center; gap: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F39C12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                Özel Ders Talep Et
            </h4>
            <input type="text" id="custom-lesson-topic" placeholder="İstediğiniz konuyu yazınız (Örn: YDS Soru Çözümü)" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #ccc; margin-top: 5px;" value="${customTopic}" onclick="event.stopPropagation()" oninput="appState.customLessonTopic = this.value">
        </div>
        <div style="display: flex; align-items: center; gap: 10px; background: #f8f9fa; padding: 5px 10px; border-radius: 8px; border: 1px solid #eee;" onclick="event.stopPropagation()">
            <div style="font-size: 0.8rem; color: #666; text-align: right;">Ders Sayısı<br><small>(Saat)</small></div>
            <button class="btn btn-sm" style="background: #e9ecef; border: none; font-size: 1.2rem; padding: 0 10px;" onclick="changeCustomLessonCount(-1)">-</button>
            <span id="custom-lesson-count" style="font-size: 1.2rem; font-weight: bold; width: 20px; text-align: center;">${customCount}</span>
            <button class="btn btn-sm" style="background: #e9ecef; border: none; font-size: 1.2rem; padding: 0 10px;" onclick="changeCustomLessonCount(1)">+</button>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; justify-content:center; gap:10px; margin-left:15px;">
            <div class="online-package-price" style="min-width: 100px; text-align: right; color: #F39C12;">
                <span id="custom-lesson-price">${customPrice}</span> ₺
            </div>
            <div onclick="openPackageModal('online', 100); event.stopPropagation();" style="padding: 4px 10px; font-size: 0.8rem; font-weight: bold; background: rgba(243, 156, 18, 0.1); color: #F39C12; border: 1px solid rgba(243, 156, 18, 0.4); border-radius: 20px; cursor: pointer; transition: 0.2s; white-space: nowrap; text-align:center;" onmouseover="this.style.background='#F39C12'; this.style.color='white';" onmouseout="this.style.background='rgba(243, 156, 18, 0.1)'; this.style.color='#F39C12';">Detaylar</div>
        </div>
    </div>
    `;

    listEl.innerHTML = html;
}

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
    
    updateCustomLessonTotal();
};

window.updateCustomLessonTotal = function() {
    const liveTotalEl = document.getElementById('step1-live-total');
    if (liveTotalEl) {
        const total = appState.selectedOnlinePackages.reduce((sum, p) => sum + p.price, 0);
        liveTotalEl.innerHTML = `Ara Toplam: ${total.toLocaleString('tr-TR')} ₺`;
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
    
    updateCustomLessonTotal();
};



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
                const svgVideoOff = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:24px;height:24px;"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

                if(btnMute) { btnMute.innerHTML = svgMicOff; btnMute.style.background = '#ff3b30'; }
                if(btnVideo) { btnVideo.innerHTML = svgVideoOff; btnVideo.style.background = '#ff3b30'; }
            }
            
            const localVideo = document.getElementById('local-video');
            if(localVideo) {
                localVideo.srcObject = stream;
            }
        } catch (err) {
            console.error("Kamera/Mikrofon açılamadı:", err);
            showCustomAlert("Kamera ve mikrofonunuza erişilemiyor. Lütfen tarayıcı izinlerinizi kontrol edin.");
        }

        // Simüle edilmiş bağlanma süresi
        setTimeout(() => {
            const msg = document.getElementById('live-wait-msg');
            if(msg) msg.style.display = 'none';
        }, 3000);
    }
}

function closeLiveClassRoom() {
    const modal = document.getElementById('live-class-modal');
    if(modal) modal.style.display = 'none';
    
    if(appState.localStream) {
        appState.localStream.getTracks().forEach(track => track.stop());
        appState.localStream = null;
    }
    if(appState.screenStream) {
        appState.screenStream.getTracks().forEach(track => track.stop());
        appState.screenStream = null;
    }
}

function toggleMute() {
    const btn = document.getElementById('btn-mute');
    if(appState.localStream) {
        const audioTrack = appState.localStream.getAudioTracks()[0];
        if(audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            const svgMicOn = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:24px;height:24px;"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`;
            const svgMicOff = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:24px;height:24px;"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`;
            btn.innerHTML = audioTrack.enabled ? svgMicOn : svgMicOff;
            btn.style.background = audioTrack.enabled ? 'rgba(255,255,255,0.2)' : '#ff3b30';
        }
    }
}

function toggleVideo() {
    const btn = document.getElementById('btn-video');
    if(appState.localStream) {
        const videoTrack = appState.localStream.getVideoTracks()[0];
        if(videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            const svgVideoOn = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:24px;height:24px;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`;
            const svgVideoOff = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:24px;height:24px;"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
            btn.innerHTML = videoTrack.enabled ? svgVideoOn : svgVideoOff;
            btn.style.background = videoTrack.enabled ? 'rgba(255,255,255,0.2)' : '#ff3b30';
        }
    }
}

async function toggleScreenShare() {
    const btn = document.getElementById('btn-screen');
    const screenVideo = document.getElementById('screen-video');
    
    if (appState.screenStream) {
        stopScreenShare();
        return;
    }
    
    try {
        appState.screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenVideo.srcObject = appState.screenStream;
        screenVideo.style.display = 'block';
        btn.style.background = '#ff3b30'; // red when active
        
        appState.screenStream.getVideoTracks()[0].onended = () => {
            stopScreenShare();
        };
    } catch (err) {
        console.log("Ekran paylaşımı iptal edildi veya hata oluştu.");
    }
}

function stopScreenShare() {
    const btn = document.getElementById('btn-screen');
    const screenVideo = document.getElementById('screen-video');
    if (appState.screenStream) {
        appState.screenStream.getTracks().forEach(t => t.stop());
        appState.screenStream = null;
    }
    if (screenVideo) {
        screenVideo.srcObject = null;
        screenVideo.style.display = 'none';
    }
    if (btn) btn.style.background = 'rgba(32,201,151,0.8)';
}

function generateInviteLink() {
    const roomName = "KidefArapca_DersOdasi_" + Math.random().toString(36).substring(7);
    const link = window.location.origin + window.location.pathname + "?invite=" + roomName;
    navigator.clipboard.writeText(link).then(() => {
        showCustomAlert("Davet linki panoya kopyalandı:\n" + link);
    }).catch(() => {
        showCustomAlert("Link kopyalanamadı. Lütfen manuel paylaşın: " + link);
    });
}

function toggleFullScreen() {
    const modalContent = document.getElementById('live-modal-content');
    if (modalContent) {
        modalContent.classList.toggle('maximized');
    }
}

function toggleSidebar(tabId) {
    const sidebar = document.getElementById('live-sidebar');
    if (sidebar) {
        if (sidebar.style.display === 'flex' || sidebar.style.display === 'block') {
            sidebar.style.display = 'none';
        } else {
            sidebar.style.display = 'flex';
            switchSidebarTab(tabId);
        }
    }
}

function switchSidebarTab(tabId) {
    const tabParticipants = document.getElementById('sidebar-content-participants');
    const tabChat = document.getElementById('sidebar-content-chat');
    const btnParticipants = document.getElementById('tab-btn-participants');
    const btnChat = document.getElementById('tab-btn-chat');
    
    if (tabId === 'participants') {
        tabParticipants.style.display = 'block';
        tabChat.style.display = 'none';
        btnParticipants.classList.add('active');
        btnChat.classList.remove('active');
        populateParticipants();
    } else {
        tabParticipants.style.display = 'none';
        tabChat.style.display = 'flex';
        btnParticipants.classList.remove('active');
        btnChat.classList.add('active');
    }
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;
    
    const chatBox = document.getElementById('chat-messages');
    chatBox.innerHTML += `<div style="background: rgba(79,172,254,0.2); padding: 8px 12px; border-radius: 8px; margin-left: 20px; text-align: right;">
        <strong style="color: #4facfe; font-size: 0.8rem; display:block;">Siz</strong>
        ${msg}
    </div>`;
    
    input.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;
}

function populateParticipants() {
    const list = document.getElementById('participants-list');
    if (!list) return;
    
    list.innerHTML = `
        <li style="padding: 10px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center;">
            <div style="display:flex; align-items:center; gap: 10px;">
                <div style="width: 30px; height: 30px; border-radius: 50%; background: #4facfe; display: flex; align-items: center; justify-content: center; font-weight: bold;">S</div>
                <span>Siz (Öğrenci)</span>
            </div>
            <div style="color: #20C997; font-size: 0.8rem;">Moderatör</div>
        </li>
    `;
}

