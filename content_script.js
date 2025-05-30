
// === QuickSave Extension Panel - content_script.js ===
// Verzió: 2025-05-29 (JAVÍTOTT DRIVE CSERE!)
(function() {
    if (document.getElementById('opera-quicksave-panel')) return;
    const LABELS = {
        hu: {
            title: "QuickSave mentőpanel",
            drive: "Mentési gyökérkönyvtár:",
            selectDrive: "Meghajtó kiválasztása",
            savePage: "Lap mentése",
            saveScreen: "Teljes oldal mentése",
            savePict: "Kép mentése",
            savePicts: "Több kép mentése",
            saveVid: "Videó mentése",
            saveVids: "Több videó mentése",
            savePDF: "Oldal PDF-ként",
            runAll: "Mentés indítása",
            cancel: "Mégse / Kijelölés törlése",
            close: "Panel bezárása",
            toastSaved: "Mentés sikeres!",
            toastError: "Hiba a mentés során!",
            toastSetDrive: "Mentési hely beállítva.",
            selectRootTitle: "Válassz gyökérkönyvtárat",
            browse: "Tallózás...",
            folderSample: "pl. F:/Netsave/",
            history: "Mentési előzmények",
            openFolder: "Mappa megnyitása"
        },
        en: {
            title: "QuickSave Panel",
            drive: "Save root folder:",
            selectDrive: "Select drive",
            savePage: "Save Page",
            saveScreen: "Save Screen",
            savePict: "Save Picture",
            savePicts: "Save Pictures",
            saveVid: "Save Video",
            saveVids: "Save Videos",
            savePDF: "Save as PDF",
            runAll: "Run all",
            cancel: "Cancel / Deselect",
            close: "Close panel",
            toastSaved: "Saved successfully!",
            toastError: "Save error!",
            toastSetDrive: "Save path set.",
            selectRootTitle: "Select root folder",
            browse: "Browse...",
            folderSample: "e.g. F:/Netsave/",
            history: "Save history",
            openFolder: "Open folder"
        }
    };
    const LANG = navigator.language.startsWith("hu") ? "hu" : "en";
    const t = (key) => LABELS[LANG][key] || LABELS['en'][key] || key;
    const panel = document.createElement("div");
    panel.id = "opera-quicksave-panel";
    panel.style = `
        position:fixed;right:32px;bottom:32px;z-index:999999;
        background:#fffbe7;border:2px solid #d2c55b;border-radius:14px;
        box-shadow:0 4px 32px #0002;padding:22px 18px 18px 18px;
        font-size:18px;color:#222;min-width:310px;max-width:370px;
        font-family:sans-serif;transition:box-shadow .2s;user-select:none;
    `;
    panel.innerHTML = `
    <div style="font-size:21px;font-weight:bold;margin-bottom:7px;">${t('title')}</div>
    <div style="margin-bottom:10px;">
      <span style="font-size:14px;color:#888;">${t('drive')}</span>
      <input type="text" id="qs-drive" style="width:72%;margin-left:2px;border:1px solid #ccc;padding:2px 8px;border-radius:5px;" readonly placeholder="${t('folderSample')}" />
      <button id="qs-change-drive" style="margin-left:2px;">${t('selectDrive')}</button>
    </div>
    <div style="margin-bottom:4px;">
      <button id="qs-save-page" style="width:48%">${t('savePage')}</button>
      <button id="qs-save-screen" style="width:48%">${t('saveScreen')}</button>
    </div>
    <div style="margin-bottom:4px;">
      <button id="qs-save-pict" style="width:48%">${t('savePict')}</button>
      <button id="qs-save-picts" style="width:48%">${t('savePicts')}</button>
    </div>
    <div style="margin-bottom:4px;">
      <button id="qs-save-vid" style="width:48%">${t('saveVid')}</button>
      <button id="qs-save-vids" style="width:48%">${t('saveVids')}</button>
    </div>
    <div style="margin-bottom:4px;">
      <button id="qs-save-pdf" style="width:48%">${t('savePDF')}</button>
      <button id="qs-run-all" style="width:48%">${t('runAll')}</button>
    </div>
    <div style="margin-bottom:4px;">
      <button id="qs-cancel" style="width:48%">${t('cancel')}</button>
      <button id="qs-close" style="width:48%">${t('close')}</button>
    </div>
    <div style="margin-top:8px;display:flex;gap:6px;">
      <button id="qs-history" style="font-size:14px">${t('history')}</button>
      <button id="qs-open-folder" style="font-size:14px">${t('openFolder')}</button>
    </div>
    <div id="qs-toast" style="display:none;position:fixed;right:48px;bottom:120px;z-index:1000000;background:#e8f3ce;color:#235e13;padding:13px 34px;font-size:18px;border-radius:9px;box-shadow:0 2px 16px #0003;">${t('toastSaved')}</div>
    `;
    document.body.appendChild(panel);
    function showToast(msg, ok = true) {
        const toast = document.getElementById("qs-toast");
        toast.innerText = msg;
        toast.style.background = ok ? "#e8f3ce" : "#fbd5d5";
        toast.style.color = ok ? "#235e13" : "#900";
        toast.style.display = "block";
        setTimeout(() => { toast.style.display = "none"; }, 2200);
    }
    // JAVÍTOTT: meghajtó beállító dialógus
    function selectDriveDialog() {
        const root = prompt(t('selectRootTitle') + "\n" + t('folderSample'), "F:/Netsave/");
        if (root && root.match(/^[a-zA-Z]:[\\/]/)) {
            document.getElementById('qs-drive').value = root.replace(/\\/g,'/');
            localStorage.setItem('qs_drive', root.replace(/\\/g,'/'));
            showToast(t('toastSetDrive'));
        } else if (root) {
            showToast("Hibás könyvtár!", false);
        }
    }
    panel.querySelector("#qs-change-drive").onclick = selectDriveDialog;
    panel.querySelector("#qs-close").onclick = () => panel.remove();
    panel.querySelector("#qs-cancel").onclick = () => showToast("Kijelölés törölve / megszakítva", true);
    panel.querySelector("#qs-save-page").onclick = () => { quicksaveAction('savePage'); };
    panel.querySelector("#qs-save-screen").onclick = () => { quicksaveAction('saveScreen'); };
    panel.querySelector("#qs-save-pict").onclick = () => { quicksaveAction('savePict'); };
    panel.querySelector("#qs-save-picts").onclick = () => { quicksaveAction('savePicts'); };
    panel.querySelector("#qs-save-vid").onclick = () => { quicksaveAction('saveVid'); };
    panel.querySelector("#qs-save-vids").onclick = () => { quicksaveAction('saveVids'); };
    panel.querySelector("#qs-save-pdf").onclick = () => { quicksaveAction('savePDF'); };
    panel.querySelector("#qs-run-all").onclick = () => { quicksaveAction('runAll'); };
    panel.querySelector("#qs-history").onclick = () => { quicksaveAction('history'); };
    panel.querySelector("#qs-open-folder").onclick = () => { quicksaveAction('openFolder'); };
    window.addEventListener('DOMContentLoaded', () => {
        let saved = localStorage.getItem('qs_drive');
        if (saved) document.getElementById('qs-drive').value = saved;
    });
    let saved = localStorage.getItem('qs_drive');
    if (saved) document.getElementById('qs-drive').value = saved;
    function quicksaveAction(action) {
        let root = localStorage.getItem('qs_drive') || '';
        if (!root) {
            showToast("Nincs mentési könyvtár beállítva!", false);
            return;
        }
        let now = new Date();
        let yyyy = now.getFullYear();
        let mm = String(now.getMonth() + 1).padStart(2, '0');
        let dd = String(now.getDate()).padStart(2, '0');
        let sub = '';
        switch(action) {
            case 'savePage': sub = 'Lapok'; break;
            case 'saveScreen': sub = 'Screens'; break;
            case 'savePict':
            case 'savePicts': sub = 'Pict'; break;
            case 'saveVid':
            case 'saveVids': sub = 'Videók'; break;
            case 'savePDF': sub = 'PDF'; break;
            case 'history': sub = 'History'; break;
        }
        let targetFolder = `${root}/${yyyy}/${mm}/${dd}${sub ? '/' + sub : ''}`;
        showToast(`${action} → ${targetFolder}`);
    }
    let drag = false, x = 0, y = 0;
    panel.onmousedown = function(e) {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
        drag = true;
        x = e.clientX - panel.offsetLeft;
        y = e.clientY - panel.offsetTop;
        document.body.style.userSelect = "none";
    };
    document.onmouseup = function() { drag = false; document.body.style.userSelect = ""; };
    document.onmousemove = function(e) {
        if (!drag) return;
        panel.style.right = "auto";
        panel.style.bottom = "auto";
        panel.style.left = (e.clientX - x) + "px";
        panel.style.top = (e.clientY - y) + "px";
    };
    let resizer = document.createElement('div');
    resizer.style = "position:absolute;left:0;bottom:0;width:12px;height:12px;cursor:nwse-resize;background:#bbb7;z-index:1;border-radius:0 0 0 8px;";
    resizer.onmousedown = function(e) {
        e.stopPropagation();
        let startX = e.clientX, startW = panel.offsetWidth, startY = e.clientY, startH = panel.offsetHeight;
        function resizeMove(ev) {
            panel.style.width = Math.max(210, startW + (ev.clientX - startX)) + "px";
            panel.style.height = Math.max(180, startH + (ev.clientY - startY)) + "px";
        }
        function stopResize() {
            window.removeEventListener('mousemove', resizeMove);
            window.removeEventListener('mouseup', stopResize);
        }
        window.addEventListener('mousemove', resizeMove);
        window.addEventListener('mouseup', stopResize);
    };
    panel.appendChild(resizer);
})();
