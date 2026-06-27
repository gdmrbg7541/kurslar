const fs = require('fs');
const content = fs.readFileSync('index.js', 'utf8');

const helperStr = `
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
            monthsMap.push({ name: week.monthName, weeks: [week] });
        } else {
            lastMonth.weeks.push(week);
        }
    });

    let navHtml = \`<div style="display: flex; justify-content: space-between; gap: 15px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 15px; user-select: none;">\`;
    monthsMap.forEach(m => {
        const isMonthActive = m.weeks.some(w => w.index === appState.selectedWeekIndex);
        const monthColor = isMonthActive ? '#F39C12' : '#1f5f99';
        const monthScale = isMonthActive ? 'scale(1.1)' : 'scale(1)';
        
        navHtml += \`<div style="display: flex; flex: 1; flex-direction: column; align-items: center; min-width: 100px;">
            <div style="font-weight: bold; color: \${monthColor}; margin-bottom: 8px; font-size: 0.95rem; transform: \${monthScale}; transition: 0.2s;">\${m.name}</div>
            <div style="display: flex; gap: 6px;">\`;
            
        m.weeks.forEach(w => {
            const isSelected = appState.selectedWeekIndex === w.index;
            let bgColor = w.isPast ? '#e0e0e0' : (isSelected ? '#F39C12' : '#4facfe');
            let cursor = w.isPast ? 'not-allowed' : 'pointer';
            let opacity = w.isPast ? '0.5' : (isSelected ? '1' : '0.8');
            let clickAttr = w.isPast ? '' : \`onclick="selectTeacherEditorWeek(\${w.index}, \${isAdmin})"\`;
            let transform = isSelected ? 'scale(1.15)' : 'scale(1)';
            
            navHtml += \`<div style="width: 35px; height: 8px; border-radius: 4px; background: \${bgColor}; cursor: \${cursor}; opacity: \${opacity}; transform: \${transform}; transition: 0.2s; margin: 4px 0;" \${clickAttr} title="\${w.isPast ? 'Geçmiş Hafta' : 'Haftayı Seç'}"></div>\`;
        });
        
        navHtml += \`</div></div>\`;
    });
    navHtml += \`</div>\`;

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

    let html = '<p>Saatlerin üzerine tıklayarak <strong>Müsait</strong> veya <strong>Dolu</strong> olarak değiştirebilirsiniz. <br><small style="color:#777;">(Not: Yapacağınız değişiklikler öğretmenin o güne ait haftalık şablonunu günceller.)</small></p>';
    html += navHtml;
    html += \`
        <div style="display: flex; overflow-x: auto; gap: 15px; padding-bottom: 15px; margin-top: 15px;">
            \${groups.map(group => {
                const today = new Date();
                today.setHours(0,0,0,0);
                const isPastDay = group.dateObj < today;

                const slotsHtml = group.slots.map(s => {
                    const durumStr = group.data && group.data[s.time] ? group.data[s.time] : "musait";
                    if (s.isBreak) return \`<div class="slot break" style="margin-bottom: 8px;">☕ \${s.time}</div>\`;
                    
                    const isDolu = durumStr !== "musait" || isPastDay;
                    const cName = isPastDay ? "dolu" : (isDolu ? "dolu" : "musait");
                    const label = isPastDay ? "Geçmiş" : (isDolu ? (durumStr === "dolu" ? "Dolu" : \`Dolu (\${durumStr})\`) : "Müsait");
                    const icon = isPastDay ? "⏳" : (isDolu ? "❌" : "✅");
                    
                    const clickAttr = isPastDay ? '' : \`onclick="toggleSlotStatus('\${teacherId}', '\${group.name}', '\${s.time}', this, \${isAdmin})"\`;
                    const cursor = isPastDay ? 'not-allowed' : 'pointer';
                    const opacity = isPastDay ? '0.5' : '1';
                    
                    return \`<div class="slot \${cName}" \${clickAttr} style="cursor: \${cursor}; margin-bottom: 8px; opacity: \${opacity};">\${icon} \${s.time}<br><small style="font-size:0.7rem;">\${label}</small></div>\`;
                }).join('');

                return \`
                <div style="min-width: 140px; flex: 1; display: flex; flex-direction: column;">
                    <div class="day-title" style="text-align: center; margin-bottom: 10px; padding: 10px; background: #e3f2fd; border-radius: 8px; font-weight: bold; color: #1f5f99; border: 1px solid rgba(31, 95, 153, 0.1);">
                        \${group.dateString} <br>
                        <span style="font-size: 0.85rem; font-weight: normal;">\${group.name}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 5px;">
                        \${slotsHtml}
                    </div>
                </div>
                \`;
            }).join('')}
        </div>
    \`;
    
    return html;
}
`;

const renderAdminSearch = /function renderAdminTeacherScheduleEditor\(\) \{[\s\S]*?editor\.innerHTML = html;\s*\}/;
const renderAdminReplace = `function renderAdminTeacherScheduleEditor() {
    const editor = document.getElementById('admin-teacher-schedule-editor');
    if (!editor) return;
    const teacherId = document.getElementById('admin-teacher-edit-select').value;
    if (!teacherId) return editor.innerHTML = "<p>Lütfen seçin.</p>";
    
    editor.innerHTML = getTeacherCalendarEditorHtml(teacherId, true);
}`;

const renderTeacherSearch = /function renderTeacherScheduleEditor\(\) \{[\s\S]*?editor\.innerHTML = html;\s*\}/;
const renderTeacherReplace = `function renderTeacherScheduleEditor() {
    const editor = document.getElementById('teacher-schedule-editor');
    if (!editor) return;

    const activeTeacher = appState.teachers.find(t => t.email === appState.currentUser);
    if (!activeTeacher) return;
    const teacherId = activeTeacher.id;

    editor.innerHTML = getTeacherCalendarEditorHtml(teacherId, false);
}`;

let newContent = content.replace(renderAdminSearch, renderAdminReplace);
newContent = newContent.replace(renderTeacherSearch, renderTeacherReplace);

// We'll append the helper functions right before renderAdminTeacherScheduleEditor
newContent = newContent.replace('function renderAdminTeacherScheduleEditor() {', helperStr + '\nfunction renderAdminTeacherScheduleEditor() {');

fs.writeFileSync('index.js', newContent);
console.log('done');
