const fs = require('fs');
let content = fs.readFileSync('/Users/gylndmrbg/Documents/📚 Arapça/ka.com/Kurslar-Dersler/js/modules/live-lesson.js', 'utf8');

// Replace checkOnlineStep1() inside selectCustomOnlinePackage with updateCustomLessonTotal()
content = content.replace(/checkOnlineStep1\(\);/g, 'updateCustomLessonTotal();');

// Add updateCustomLessonTotal function
const addFunc = `
window.updateCustomLessonTotal = function() {
    const liveTotalEl = document.getElementById('step1-live-total');
    if (liveTotalEl) {
        const total = appState.selectedOnlinePackages.reduce((sum, p) => sum + p.price, 0);
        liveTotalEl.innerHTML = \`Ara Toplam: \${total.toLocaleString('tr-TR')} ₺\`;
    }
};
`;
content += addFunc;

// Ensure changeCustomLessonCount also calls updateCustomLessonTotal
content = content.replace(/appState\.selectedOnlinePackages\[index\]\.name = \`Özel Ders: \$\{appState\.customLessonTopic \|\| 'Belirtilmedi'\}\`;\n        \}/, 
`appState.selectedOnlinePackages[index].name = \`Özel Ders: \${appState.customLessonTopic || 'Belirtilmedi'}\`;
        }
    }
    updateCustomLessonTotal();
    // remove the old closing bracket that was matched in the replace or just do it safer`);

fs.writeFileSync('/Users/gylndmrbg/Documents/📚 Arapça/ka.com/Kurslar-Dersler/js/modules/live-lesson.js', content, 'utf8');
