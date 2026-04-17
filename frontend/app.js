/* ── TRINETRA APP CORE (v2.0.2) ── */
console.log('TRINETRA_APP: Initializing v2.0.2 ...');

/* ── STORAGE ── */
const S = {
    get: (k) => { try { const v = localStorage.getItem('gs_' + k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem('gs_' + k, JSON.stringify(v)); } catch (e) { } },
    del: (k) => { try { localStorage.removeItem('gs_' + k); } catch (e) { } }
};

/* ── USER STATE ── */
let user = S.get('user');
let currentPlan = S.get('plan') || { name: 'No Plan', price: '₹—', payout: '₹—' };
let settings = S.get('settings') || {
    notifs: true,
    biometrics: false,
    lowData: false,
    incognito: false,
    darkMode: true
};
let isDemo = false;
let aiKey = S.get('aikey') || '';
let aiHistory = [];

/* ── CURSOR ── */
const cd = document.getElementById('cd'), cr = document.getElementById('cr');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; if (cd) { cd.style.left = mx + 'px'; cd.style.top = my + 'px'; } });
(function l() {
    rx += (mx - rx) * .12; ry += (my - ry) * .12;
    if (cr) { cr.style.left = rx + 'px'; cr.style.top = ry + 'px'; }
    requestAnimationFrame(l);
})();

/* ── PARTICLES ── */
function initParticles() {
    const C = document.getElementById('pcv');
    if (!C) return;
    const ctx = C.getContext('2d');
    let W, H, pts = [];
    function resize() { W = C.width = window.innerWidth; H = C.height = window.innerHeight; }
    resize(); window.addEventListener('resize', resize);
    class P {
        constructor() { this.reset(); }
        reset() { this.x = Math.random() * W; this.y = Math.random() * H; this.vx = (Math.random() - .5) * .2; this.vy = (Math.random() - .5) * .2; this.life = Math.random(); this.ml = .005 + Math.random() * .003; this.sz = Math.random() * 1.3 + .3; this.op = Math.random() * .35 + .1; }
        update() { this.x += this.vx; this.y += this.vy; this.life += this.ml; if (this.x < 0 || this.x > W || this.y < 0 || this.y > H || this.life > 1) this.reset(); }
        draw() { const a = Math.sin(this.life * Math.PI) * this.op; ctx.beginPath(); ctx.arc(this.x, this.y, this.sz, 0, Math.PI * 2); ctx.fillStyle = `rgba(34,197,94,${a})`; ctx.fill(); }
    }
    for (let i = 0; i < 70; i++) pts.push(new P());
    function frame() {
        ctx.clearRect(0, 0, W, H); pts.forEach(p => { p.update(); p.draw(); });
        for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.sqrt(dx * dx + dy * dy);
            if (d < 110) { const a = (1 - d / 110) * .05; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.strokeStyle = `rgba(34,197,94,${a})`; ctx.lineWidth = .5; ctx.stroke(); }
        }
        requestAnimationFrame(frame);
    }
    frame();
}

function initCursorInteractions() {
    document.querySelectorAll('button,.gbi,.ni,.tier,.gc,.sc,.ob-s,.wt,.ref-code,.acc-head').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cx'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cx'));
    });
}

/* ── TOAST ── */
function showToast(msg, type = 'success', dur = 3500) {
    const w = document.getElementById('toast-wrap');
    if (!w) return;
    const el = document.createElement('div');
    el.className = 'toast t-' + type;
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warn: '⚠️' };
    el.innerHTML = `<span>${icons[type] || '📢'}</span><span>${msg}</span>`;
    w.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, dur);
}

/* ── MOBILE SIDEBAR ── */
let _sbOriginalParent = null;

function toggleMobSidebar() {
    const sb = document.querySelector('.sb');
    const backdrop = document.getElementById('mob-backdrop');
    if (!sb || !backdrop) return;
    const isOpen = sb.classList.contains('mob-open');
    if (!isOpen) {
        _sbOriginalParent = sb.parentNode;
        document.body.appendChild(sb);
        sb.getBoundingClientRect();
        sb.classList.add('mob-open');
        backdrop.classList.add('show');
        document.body.style.overflow = 'hidden';
    } else {
        closeMobSidebar();
    }
}

function closeMobSidebar() {
    const sb = document.querySelector('.sb');
    const backdrop = document.getElementById('mob-backdrop');
    if (!sb) return;
    sb.classList.remove('mob-open');
    if (backdrop) backdrop.classList.remove('show');
    document.body.style.overflow = '';
    setTimeout(() => {
        if (_sbOriginalParent && sb.parentNode === document.body) {
            _sbOriginalParent.insertBefore(sb, _sbOriginalParent.firstChild);
        }
    }, 320);
}

/* ── LOGIN / SIGNUP ── */
function openLogin(tab = 'login') { document.getElementById('login-panel').classList.add('open'); switchTab(tab); }
function closeLogin() { document.getElementById('login-panel').classList.remove('open'); }
function switchTab(t) {
    document.querySelectorAll('.lp-tab').forEach(e => e.classList.remove('active'));
    document.querySelectorAll('.lp-tc').forEach(e => e.classList.remove('active'));
    const tabEl = document.getElementById('tab-' + t);
    const tcEl = document.getElementById('tc-' + t);
    if (tabEl) tabEl.classList.add('active');
    if (tcEl) tcEl.classList.add('active');
}

/* ── CITY → ZONE MAPPING ── */
const cityZones = {
    Mumbai: ['Dharavi, Mumbai', 'Kurla, Mumbai', 'Andheri, Mumbai', 'Bandra, Mumbai', 'Thane, Mumbai', 'Govandi, Mumbai', 'Malad, Mumbai'],
    Delhi: ['Connaught Place, Delhi', 'Chandni Chowk, Delhi', 'Lajpat Nagar, Delhi', 'Dwarka, Delhi', 'Rohini, Delhi', 'Saket, Delhi'],
    Bengaluru: ['Koramangala, Bengaluru', 'Whitefield, Bengaluru', 'HSR Layout, Bengaluru', 'Indiranagar, Bengaluru', 'Electronic City, Bengaluru'],
    Hyderabad: ['Banjara Hills, Hyderabad', 'Hitech City, Hyderabad', 'Secunderabad', 'Kukatpally, Hyderabad', 'Ameerpet, Hyderabad'],
    Chennai: ['T. Nagar, Chennai', 'Anna Nagar, Chennai', 'Velachery, Chennai', 'Adyar, Chennai', 'Tambaram, Chennai'],
    Pune: ['Kothrud, Pune', 'Baner, Pune', 'Hinjewadi, Pune', 'Shivajinagar, Pune', 'Hadapsar, Pune'],
    Kolkata: ['Salt Lake, Kolkata', 'Park Street, Kolkata', 'Howrah, Kolkata', 'Dum Dum, Kolkata', 'Tollygunge, Kolkata'],
    Ahmedabad: ['Navrangpura, Ahmedabad', 'Maninagar, Ahmedabad', 'Bopal, Ahmedabad', 'Vastrapur, Ahmedabad'],
    Jaipur: ['Malviya Nagar, Jaipur', 'Mansarovar, Jaipur', 'Vaishali Nagar, Jaipur', 'C-Scheme, Jaipur'],
    Lucknow: ['Hazratganj, Lucknow', 'Gomti Nagar, Lucknow', 'Alambagh, Lucknow', 'Aliganj, Lucknow'],
    Kochi: ['Fort Kochi, Kochi', 'Marine Drive, Kochi', 'Kakkanad, Kochi', 'Edappally, Kochi'],
    Surat: ['Athwa, Surat', 'Adajan, Surat', 'Varachha, Surat', 'Piplod, Surat'],
    Indore: ['Vijay Nagar, Indore', 'Rajwada, Indore', 'Bhawarkua, Indore'],
    Guwahati: ['Dispur, Guwahati', 'Paltan Bazaar, Guwahati', 'Maligaon, Guwahati'],
    Patna: ['Boring Road, Patna', 'Kankarbagh, Patna', 'Patliputra, Patna'],
    Chandigarh: ['Sector 17, Chandigarh', 'Sector 22, Chandigarh', 'Sector 35, Chandigarh'],
    Bhopal: ['Arera Colony, Bhopal', 'MP Nagar, Bhopal', 'Bairagarh, Bhopal'],
    Nagpur: ['Sitabuldi, Nagpur', 'Dharampeth, Nagpur', 'Wardhaman Nagar, Nagpur'],
    Thiruvananthapuram: ['Pattom, Thiruvananthapuram', 'Statue, Thiruvananthapuram', 'Technopark, Thiruvananthapuram']
};

const allCities = [
    "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune",
    "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna",
    "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot",
    "Varanasi", "Srinagar", "Aurangabad", "Amritsar", "Navi Mumbai", "Allahabad", "Ranchi",
    "Howrah", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota",
    "Guwahati", "Chandigarh", "Solapur", "Bareilly", "Moradabad", "Mysore", "Gurgaon",
    "Aligarh", "Jalandhar", "Tiruchirappalli", "Bhubaneswar", "Salem", "Warangal", "Guntur",
    "Saharanpur", "Gorakhpur", "Bikaner", "Amravati", "Noida", "Jamshedpur", "Bhilai",
    "Cuttack", "Kochi", "Bhavnagar", "Dehradun", "Durgapur", "Asansol", "Nanded", "Kolhapur",
    "Ajmer", "Jamnagar", "Ujjain", "Siliguri", "Jhansi", "Nellore", "Jammu", "Sangli",
    "Belgaum", "Mangalore", "Tirunelveli", "Gaya", "Jalgaon", "Udaipur", "Davanagere",
    "Kozhikode", "Akola", "Kurnool", "Rajahmundry", "Bellary", "Patiala", "Agartala",
    "Bhagalpur", "Muzaffarnagar", "Latur", "Dhule", "Rohtak", "Bhilwara", "Muzaffarpur",
    "Ahmednagar", "Mathura", "Kollam", "Kadapa", "Sambalpur", "Bilaspur", "Shahjahanpur",
    "Satara", "Kakinada", "Rampur", "Shimoga", "Chandrapur", "Junagadh", "Thrissur",
    "Alwar", "Bardhaman", "Nizamabad", "Parbhani", "Tumkur", "Khammam", "Bihar Sharif",
    "Panipat", "Darbhanga", "Tirupati", "Karnal", "Bathinda", "Jalna", "Eluru", "Barasat",
    "Purnia", "Satna", "Mau", "Sonipat", "Farrukhabad", "Sagar", "Rourkela", "Durg",
    "Imphal", "Ratlam", "Hapur", "Anantapur", "Arrah", "Karimnagar", "Ramagundam",
    "Etawah", "Bharatpur", "Begusarai", "New Delhi", "Tiruppur", "Puducherry",
    "Thoothukudi", "Rewa", "Mirzapur", "Raichur", "Pali", "Haridwar", "Nagercoil",
    "Sri Ganganagar", "Karur", "Nandyal", "Haldwani", "Bulandshahr", "Hospet",
    "Sambhal", "Amroha", "Hardoi", "Fatehpur", "Raebareli", "Orai", "Sitapur",
    "Bahraich", "Unnao", "Jaunpur", "Adoni", "Madanapalle", "Chittoor"
];

function showCities(inputId, listId, zoneId) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    if (!input || !list) return;
    const val = input.value.trim().toLowerCase();
    if (!val) { list.classList.remove('show'); return; }
    const matches = allCities.filter(c => c.toLowerCase().includes(val)).slice(0, 8);
    if (matches.length === 0) { list.classList.remove('show'); return; }
    list.innerHTML = matches.map(c => `<div class="ac-item" onclick="selectCity('${inputId}','${listId}','${zoneId}','${c}')">${c}</div>`).join('');
    list.classList.add('show');
}

function selectCity(inputId, listId, zoneId, city) {
    const inp = document.getElementById(inputId);
    const list = document.getElementById(listId);
    if (inp) inp.value = city;
    if (list) list.classList.remove('show');
    updateZonesFromCity(city, zoneId);
}

function updateZonesFromCity(city, zoneId) {
    const zoneEl = document.getElementById(zoneId);
    if (!zoneEl) return;
    const zones = cityZones[city] || [city + ' Central', city + ' North', city + ' South'];
    zoneEl.innerHTML = zones.map(z => `<option>${z}</option>`).join('');
}

function renderRiskMap(city, userZone) {
    const mapContainer = document.getElementById('risk-map');
    if (!mapContainer) return;
    mapContainer.querySelectorAll('.mz, .mw').forEach(z => z.remove());
    const zones = cityZones[city] || [userZone];
    const zoneStatus = ['mz-r', 'mz-o', 'mz-g'];
    const displayZones = zones.slice(0, 4);
    const positions = [
        { top: '14px', left: '20px', size: '84px' },
        { top: '30px', left: '96px', size: '66px' },
        { top: '68px', right: '36px', size: '72px' },
        { bottom: '14px', left: '162px', size: '58px' }
    ];
    displayZones.forEach((z, i) => {
        const zName = z.split(',')[0].toUpperCase();
        const status = (z === userZone) ? 'mz-r' : zoneStatus[Math.floor(Math.random() * zoneStatus.length)];
        const pos = positions[i] || { top: '50px', left: '50px', size: '60px' };
        const div = document.createElement('div');
        div.className = `mz ${status}`;
        div.style.width = pos.size; div.style.height = pos.size;
        if (pos.top) div.style.top = pos.top;
        if (pos.left) div.style.left = pos.left;
        if (pos.right) div.style.right = pos.right;
        if (pos.bottom) div.style.bottom = pos.bottom;
        div.innerHTML = zName + (status === 'mz-r' ? '<br>RED' : '');
        mapContainer.appendChild(div);
        if (z === userZone) {
            const mw = document.createElement('div'); mw.className = 'mw';
            mw.style.top = (parseInt(pos.top || '0') + 32) + 'px';
            mw.style.left = (parseInt(pos.left || '0') + 36) + 'px';
            mapContainer.appendChild(mw);
        }
    });
}

function updateUserCityUI(city, zone) {
    document.querySelectorAll('.user-city').forEach(el => el.textContent = city);
    document.querySelectorAll('.user-zone').forEach(el => el.textContent = zone);
    renderRiskMap(city, zone);
}

function updateZones(cityId, zoneId) {
    const cityEl = document.getElementById(cityId);
    const city = cityEl ? cityEl.value : null;
    const zoneEl = document.getElementById(zoneId);
    if (!city || !zoneEl) return;
    const zones = cityZones[city] || [city + ' Central'];
    zoneEl.innerHTML = zones.map(z => `<option>${z}</option>`).join('');
}

function selWT(el) {
    document.querySelectorAll('.wt').forEach(w => w.classList.remove('sel'));
    el.classList.add('sel');
}

/* ── AUTH ── */
let _otpTimer = null;
async function requestOTP() {
    const ph = document.getElementById('login-phone').value.trim();
    if (!ph) { showToast('Enter phone number first', 'warn'); return; }

    const btn = document.getElementById('btn-request-otp');
    btn.disabled = true; btn.textContent = 'Sending...';

    try {
        const res = await fetch('/api/auth/request-otp', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: ph })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

        showToast('🛡️ SMS Sent via Secure Gateway', 'success');

        // Show Dev OTP
        const devDisplay = document.getElementById('dev-otp-display');
        const devCode = document.getElementById('dev-otp-code');
        if (devDisplay && devCode) {
            devDisplay.style.display = 'block';
            devCode.textContent = data.devOTP || '123456';
        }

        // UI Transition
        document.getElementById('login-otp-wrap').style.display = 'block';
        document.getElementById('btn-request-otp').style.display = 'none';
        document.getElementById('btn-verify-otp').style.display = 'block';

        // Start Timer
        const timerEl = document.getElementById('otp-timer');
        const secEl = document.getElementById('otp-sec');
        timerEl.style.display = 'block';
        let sec = 30;
        secEl.textContent = sec;
        if (_otpTimer) clearInterval(_otpTimer);
        _otpTimer = setInterval(() => {
            sec--;
            secEl.textContent = sec;
            if (sec <= 0) {
                clearInterval(_otpTimer);
                document.getElementById('btn-request-otp').style.display = 'block';
                document.getElementById('btn-request-otp').textContent = 'Resend OTP';
                document.getElementById('btn-request-otp').disabled = false;
                timerEl.style.display = 'none';
            }
        }, 1000);

    } catch (e) {
        showToast(e.message, 'error');
        btn.disabled = false; btn.textContent = 'Send OTP to Phone';
    }
}

async function doLogin() {
    const ph = document.getElementById('login-phone').value.trim();
    const otp = document.getElementById('login-otp').value.trim();
    if (!ph) { showToast('Enter phone number', 'warn'); return; }
    if (!otp) { showToast('Enter the 6-digit OTP', 'warn'); return; }

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: ph, otp: otp })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        if (document.getElementById('remember-me')?.checked) { S.set('rememberMe', true); } else { S.del('rememberMe'); }
        S.set('savedPhone', ph);
        isDemo = false;
        launchApp(data.user);
    } catch (e) { showToast(e.message, 'error'); }
}

async function doSignup() {
    const name = document.getElementById('su-name').value.trim();
    const phone = document.getElementById('su-phone').value.trim();
    if (!name || !phone) { showToast('Please fill in required fields', 'warn'); return; }
    const platform = document.querySelector('.wt.sel')?.dataset.platform || 'Zomato';
    try {
        const res = await fetch('/api/auth/signup', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name, phone, platform,
                zone: document.getElementById('su-zone') ? document.getElementById('su-zone').value : 'Mumbai Central',
                upi: phone + '@upi',
                pid: 'ACT-' + Math.floor(1000 + Math.random() * 9000)
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Signup failed');
        S.set('savedPhone', phone);

        showToast('Account created! Requesting OTP...', 'success');
        // Transition to login tab and pre-fill phone
        switchTab('login');
        document.getElementById('login-phone').value = phone;
        isDemo = false;
        requestOTP();
    } catch (e) { showToast(e.message, 'error'); }
}

function resetStatsForNewUser() {
    const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setEl('stat-protected', '₹0');
    setEl('stat-premium', '₹—');
    setEl('dash-payout', '₹—');
    setEl('dash-tier', 'No Active Plan');
    setEl('dash-prem', '₹—');
    setEl('ib-stat-protected', '₹0');
    setEl('ib-stat-trust', '—');
    setEl('stat-trust', '—');
    setEl('dash-risk-score', '0.00');
    setEl('dash-risk-label', 'Initializing...');
    const cpb = document.getElementById('cpb'); if (cpb) cpb.style.width = '0%';
    const ab = document.getElementById('dash-ab'); if (ab) ab.style.display = 'none';

    // Toggle CTA for unprotected users
    const cta = document.getElementById('dash-get-covered');
    const pol = document.getElementById('dash-active-policy');
    if (cta) cta.style.display = 'block';
    if (pol) pol.style.display = 'none';
}

async function loadDemo(type) {
    const demos = {
        zomato: { name: 'Rajan Mehta', phone: '9876543210', platform: 'Zomato', zone: 'Dharavi, Mumbai', upi: '9876543210@upi', pid: 'ZMT-3821', plan: 'Standard Shield', premium: 59, payout: 1200, trust: 92 },
        swiggy: { name: 'Priya Sharma', phone: '9123456780', platform: 'Swiggy', zone: 'Koramangala, Bengaluru', upi: '9123456780@upi', pid: 'SWG-7734', plan: 'Premium Shield', premium: 99, payout: 2500, trust: 87 },
        blinkit: { name: 'Amit Kumar', phone: '9988776655', platform: 'Blinkit', zone: 'Hitech City, Hyderabad', upi: '9988776655@upi', pid: 'BLK-5512', plan: 'Basic Shield', premium: 29, payout: 600, trust: 78 }
    };
    isDemo = true;
    const demo = demos[type] || demos.zomato;
    const demoUser = { name: demo.name, phone: demo.phone, platform: demo.platform, zone: demo.zone, upi: demo.upi, pid: demo.pid };
    showToast(`Loading ${demo.platform} demo...`, 'info', 2000);
    setTimeout(() => {
        launchApp(demoUser);
        currentPlan = { name: demo.plan, price: '₹' + demo.premium, payout: '₹' + demo.payout };
        S.set('plan', currentPlan);
        const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

        // Populate Demo specific stats
        setEl('stat-protected', '₹' + (demo.payout * 3).toLocaleString('en-IN'));
        setEl('ib-stat-protected', '₹' + (demo.payout * 3).toLocaleString('en-IN'));
        setEl('stat-payout-count', '↑ 3 payouts');
        setEl('stat-premium', '₹' + demo.premium);
        setEl('stat-premium-desc', 'Auto-debit · Friday');
        setEl('stat-trust', demo.trust);
        setEl('ib-stat-trust', demo.trust);
        setEl('stat-trust-desc', 'Trust Badge ✓');
        setEl('dash-payout', '₹' + demo.payout.toLocaleString('en-IN'));
        setEl('dash-tier', demo.plan);
        setEl('dash-prem', '₹' + demo.premium);
        setEl('dash-risk-score', '0.42');
        setEl('dash-risk-label', 'Moderate Risk');
        const rl = document.getElementById('dash-risk-label'); if (rl) rl.style.color = '#f59e0b';
    }, 500);
}

async function loadAdmin() {
    const adminUser = { name: 'Admin User', phone: '0000000000', platform: 'Trinetra HQ', zone: 'Connaught Place, Delhi', upi: 'admin@trinetra', pid: 'ADMIN-001' };
    showToast('Entering Admin Mode...', 'warn', 2000);
    setTimeout(() => {
        launchApp(adminUser);
        goPage('analytics');
    }, 500);
}

function launchApp(u) {
    user = u || user; if (u) S.set('user', u);

    // Toggle Role-based Visibility
    const isAdmin = (user && user.phone === '0000000000');
    const adminGroup = document.getElementById('admin-group');
    const userEnrollment = document.getElementById('user-enrollment');
    const userTools = document.getElementById('user-tools');
    const userMain = document.getElementById('user-main');

    if (adminGroup) adminGroup.style.display = isAdmin ? 'block' : 'none';
    if (userEnrollment) userEnrollment.style.display = isAdmin ? 'none' : 'block';
    if (userTools) userTools.style.display = isAdmin ? 'none' : 'block';
    if (userMain) userMain.style.display = isAdmin ? 'none' : 'block';

    const sbAiBtn = document.getElementById('sb-ai-btn');
    if (sbAiBtn) sbAiBtn.style.display = isAdmin ? 'none' : 'flex';

    let city = user.zone && user.zone.includes(',') ? user.zone.split(',').pop().trim() : (user.zone || 'Mumbai').split(' ')[0].trim();
    updateUserCityUI(city, user.zone || 'Mumbai');
    closeLogin();
    const landing = document.getElementById('landing');
    if (landing) landing.classList.add('exit');

    setTimeout(() => {
        if (landing) landing.style.display = 'none';
        document.getElementById('app').classList.add('open');

        const fab = document.getElementById('ai-fab');
        if (fab) fab.style.display = isAdmin ? 'none' : 'flex';

        const eb = document.getElementById('emergency-claim-btn');
        if (eb) eb.style.display = isAdmin ? 'none' : 'flex';

        updateUIFromUser();

        // Logical Routing for Admin vs New vs Existing users
        if (isAdmin) {
            goPage('analytics');
        } else if (!user.platform || !user.zone || user.name === 'New User') {
            goPage('onboard');
            showToast('Welcome to Trinetra! Let\'s secure your income.', 'info', 4000);
        } else {
            goPage('dashboard');
        }

        if (!isAdmin) {
            loadUserPolicy();
            loadUserClaims();
        }
        fetchLiveWeather();
    }, 700);
}

function exitApp() {
    document.getElementById('app').classList.remove('open');
    const fab = document.getElementById('ai-fab'); if (fab) fab.classList.remove('show');
    const landing = document.getElementById('landing');
    if (landing) { landing.style.display = 'flex'; landing.classList.remove('exit'); }
}

function doLogout() { S.del('user'); S.del('rememberMe'); exitApp(); showToast('Logged out successfully', 'info'); }

function updateUIFromUser() {
    if (!user) return;
    const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setEl('sb-wname', user.name);
    setEl('sb-wplat', (user.platform || 'Gig Worker') + ' · Active');
    setEl('dash-name', (user.name || '').split(' ')[0]);
    setEl('prof-name', user.name); setEl('prof-phone', user.phone);
    setEl('prof-platform', user.platform || '—'); setEl('prof-zone', user.zone || '—');
    setEl('prof-upi', user.upi || '—'); setEl('prof-pid', user.pid || '—');
    // Apply settings toggles
    Object.keys(settings).forEach(k => {
        const el = document.getElementById('set-' + k);
        if (el) el.classList.toggle('on', !!settings[k]);
    });
}

function goPage(page) {
    closeMobSidebar();
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.ni').forEach(n => n.classList.remove('active'));
    const pg = document.getElementById('pg-' + page); if (pg) pg.classList.add('active');
    const nav = document.getElementById('nav-' + page); if (nav) nav.classList.add('active');
    const mainC = document.querySelector('.main-c');
    if (mainC) mainC.scrollTo({ top: 0, behavior: 'smooth' });
    const hTitle = document.getElementById('mob-header-title');
    if (hTitle) hTitle.textContent = '🛡️ ' + page.charAt(0).toUpperCase() + page.slice(1);

    if (page === 'dashboard') fetchRecentTriggers();
    if (page === 'betterment') loadBetterment();
    if (page === 'fraud') updateCityFraudScore();
}

/* ── SETTINGS ── */
function openSettings() { const p = document.getElementById('settings-panel'); if (p) p.classList.add('open'); }
function closeSettings() { const p = document.getElementById('settings-panel'); if (p) p.classList.remove('open'); }
function toggleSet(key) {
    settings[key] = !settings[key]; S.set('settings', settings);
    const el = document.getElementById('set-' + key);
    if (el) el.classList.toggle('on', settings[key]);
    showToast(key + ' ' + (settings[key] ? 'enabled' : 'disabled'), 'info', 2000);
}

/* ── ONBOARDING / POLICY ── */
/* ── ONBOARDING / POLICY / PAYMENT ── */
let selectedPlan = null;

function selectTier(name, price, payout) {
    document.querySelectorAll('.tier').forEach(t => t.classList.remove('sel'));
    event.currentTarget.classList.add('sel');
    selectedPlan = { name, price, payout };

    // Trigger Razorpay directly
    initiateRazorpayCheckout();
}

async function initiateRazorpayCheckout() {
    showToast('Initializing secure checkout...', 'info');
    try {
        const amountStr = selectedPlan.price.replace(/[^0-9]/g, '');
        const amountObj = parseInt(amountStr, 10);

        // 1. Create order on backend
        const res = await fetch('/api/payment/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: amountObj })
        });
        const order = await res.json();
        if (order.error) throw new Error(order.error);

        // 2. Initialize Razorpay Checkout
        var options = {
            "key": "rzp_test_SdPDZn6VBlU3gR",
            "amount": order.amount,
            "currency": "INR",
            "name": "Trinetra",
            "description": selectedPlan.name + " Plan",
            "order_id": order.id,
            "handler": async function (response) {
                showToast('Verifying payment...', 'info');
                const verifyRes = await fetch('/api/payment/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    })
                });
                const verification = await verifyRes.json();

                if (verification.success) {
                    currentPlan = selectedPlan;
                    S.set('plan', currentPlan);
                    showToast(`Payment Successful! ${currentPlan.name} is now active.`, 'success', 3000);

                    // Proceed to save onboard since payment is done
                    setTimeout(() => {
                        saveOnboard();
                    }, 1000);
                } else {
                    showToast('Payment Verification Failed!', 'error');
                }
            },
            "prefill": {
                "name": typeof user !== 'undefined' && user ? user.name : "User",
                "contact": typeof user !== 'undefined' && user ? user.phone : "9999999999"
            },
            "theme": {
                "color": "#22c55e"
            }
        };
        var rzp1 = new Razorpay(options);
        rzp1.on('payment.failed', function (response) {
            showToast(response.error.description, 'error');
        });
        rzp1.open();
    } catch (e) {
        showToast(e.message || 'Error processing payment.', 'error');
    }
}

async function saveOnboard() {
    if (!user) { showToast('Please log in first', 'warn'); return; }
    const cityEl = document.getElementById('ob-city');
    const zoneEl = document.getElementById('ob-zone');
    if (!cityEl || !zoneEl) { showToast('Please select your city & zone', 'warn'); return; }
    const city = cityEl.value; const zone = zoneEl.value;
    if (!city) { showToast('Please select your city', 'warn'); return; }
    const platform = document.querySelector('#pg-onboard .wt.sel')?.dataset.platform || user.platform || 'Zomato';
    try {
        const res = await fetch('/api/user/update', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: user.phone, zone, platform, plan: currentPlan.name, premium: currentPlan.price, payout: currentPlan.payout })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Update failed');
        user = { ...user, zone, platform }; S.set('user', user);
        updateUserCityUI(city, zone);
        showToast('Profile saved! Coverage is now active 🛡️', 'success', 4000);
        setTimeout(() => goPage('dashboard'), 1200);
    } catch (e) { showToast(e.message, 'error'); }
}

/* ── NOTIFICATIONS ── */
function toggleAcc(el) { el.classList.toggle('open'); }
function markAllRead() {
    document.querySelectorAll('.notif-item.unread').forEach(el => el.classList.remove('unread'));
    showToast('All notifications marked as read', 'success');
}
function filterNotifs(type) { showToast('Showing: ' + type + ' notifications', 'info'); }



/* ── AI ASSISTANT ── */
function toggleAI() {
    const panel = document.getElementById('ai-chat');
    if (!panel) return;
    panel.classList.toggle('open');
}

function addUserMsg(text) {
    const m = document.getElementById('ai-msgs');
    if (!m) return;
    const d = document.createElement('div');
    d.className = 'ai-msg user';
    d.innerHTML = `<div class="ai-bubble">${text}</div>`;
    m.appendChild(d); m.scrollTop = m.scrollHeight;
}

function addBotMsg(text) {
    const m = document.getElementById('ai-msgs');
    if (!m) return;
    const d = document.createElement('div');
    d.className = 'ai-msg bot';
    d.innerHTML = `<div class="ai-bubble">${text}</div>`;
    m.appendChild(d); m.scrollTop = m.scrollHeight;
}

async function sendAI() {
    const inp = document.getElementById('ai-in');
    const q = inp ? inp.value.trim() : '';
    if (!q) return;
    inp.value = ''; addUserMsg(q);
    try {
        const res = await fetch('/api/ai/chat', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: q, userConfig: user ? { name: user.name, platform: user.platform, zone: user.zone, plan: currentPlan.name } : null })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'AI request failed');
        addBotMsg(data.reply);
    } catch (e) { addBotMsg('Sorry, I encountered an error: ' + e.message); }
}

function askAI(q) {
    const inp = document.getElementById('ai-in');
    if (inp) inp.value = q;
    const panel = document.getElementById('ai-chat');
    if (panel && !panel.classList.contains('open')) panel.classList.add('open');
    sendAI();
}

/* ── SIMULATOR ── */
function runSim() {
    const earnEl = document.getElementById('sim-earn');
    const hoursEl = document.getElementById('sim-hours');
    const cityEl = document.getElementById('sim-city');
    const earn = parseFloat(earnEl?.value) || 800;
    const hours = parseInt(hoursEl?.value) || 8;
    const city = cityEl?.value || 'Mumbai';
    const rainDays = { Mumbai: 85, Chennai: 70, Kolkata: 75, Bengaluru: 60, Delhi: 40, Hyderabad: 50, Pune: 65, Surat: 55 };
    const rd = rainDays[city] || 55;
    const lossPerDay = earn;
    const riskDays = Math.round(rd * 0.35);
    const annualRisk = riskDays * lossPerDay;
    const plans = [
        { name: 'Basic Shield', premium: 29 * 52, coverage: 600 * riskDays },
        { name: 'Standard Shield', premium: 59 * 52, coverage: 1200 * riskDays },
        { name: 'Premium Shield', premium: 99 * 52, coverage: 2500 * riskDays }
    ];
    const resEl = document.getElementById('sim-result');
    if (!resEl) return;
    resEl.style.display = 'block';
    resEl.innerHTML = `
        <div style="margin-bottom:16px;padding:14px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:12px;">
            <div style="font-size:11px;color:rgba(255,255,255,.5);font-family:var(--fm);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Annual Risk in ${city}</div>
            <div style="font-size:28px;font-family:var(--fh);color:#fca5a5;">₹${annualRisk.toLocaleString('en-IN')}</div>
            <div style="font-size:12px;color:rgba(255,255,255,.5);margin-top:4px">~${riskDays} bad-weather days/year · ₹${earn} daily earnings</div>
        </div>
        <div style="font-size:11px;color:rgba(255,255,255,.4);letter-spacing:2px;text-transform:uppercase;font-family:var(--fm);margin-bottom:10px;">Trinetra Plans</div>
        ${plans.map(p => `
        <div style="padding:12px 14px;border:1px solid rgba(255,255,255,.08);border-radius:11px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
            <div>
                <div style="font-size:13px;font-weight:600;">${p.name}</div>
                <div style="font-size:11px;color:rgba(255,255,255,.4);">₹${p.premium.toLocaleString('en-IN')}/yr</div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:13px;color:#86efac;font-weight:700;">₹${Math.min(p.coverage, annualRisk).toLocaleString('en-IN')}</div>
                <div style="font-size:10px;color:rgba(255,255,255,.4);">coverage</div>
            </div>
        </div>`).join('')}`;
}

/* ── APPEAL ── */
function submitAppeal() {
    const reason = document.getElementById('appeal-reason')?.value || '';
    const details = document.getElementById('appeal-details')?.value || '';
    if (!reason || !details) { showToast('Please provide reason and details', 'warn'); return; }
    showToast('Appeal submitted! We\'ll review in 2-3 business days.', 'success', 5000);
    const r = document.getElementById('appeal-reason'); if (r) r.value = '';
    const d = document.getElementById('appeal-details'); if (d) d.value = '';
}


/* ── MANUAL CLAIM MODAL ── */
let currentClaimType = '';

function openClaimModal() {
    console.log('🛡️ Trinetra: Opening Claim Menu...');
    if (!user) { showToast('Please log in first', 'warn'); return; }

    // Reset to Step 1 (Menu)
    showClaimMenu();

    document.getElementById('claim-modal').classList.add('open');
}

function showClaimMenu() {
    document.getElementById('cm-title').textContent = 'File a Claim';
    document.getElementById('cm-step-menu').style.display = 'block';
    document.getElementById('cm-step-form').style.display = 'none';
    document.getElementById('cm-form-ft').style.display = 'none';
}

function selectClaimType(type, icon) {
    console.log(`🛡️ Trinetra: Selected Claim Category - ${type}`);
    currentClaimType = type;

    document.getElementById('cm-title').textContent = 'Claim Details';
    document.getElementById('cm-sel-type').textContent = type;
    document.getElementById('cm-sel-icon').textContent = icon;

    // Set default amount based on plan
    const amtIn = document.getElementById('claim-amount');
    if (amtIn && currentPlan) {
        amtIn.value = currentPlan.payout ? currentPlan.payout.replace(/[^0-9]/g, '') : "1200";
    }

    document.getElementById('cm-step-menu').style.display = 'none';
    document.getElementById('cm-step-form').style.display = 'block';
    document.getElementById('cm-form-ft').style.display = 'flex';
}

function closeClaimModal() {
    document.getElementById('claim-modal').classList.remove('open');
}

async function submitManualClaim() {
    const amount = document.getElementById('claim-amount').value;
    const proof = document.getElementById('claim-proof').value;

    if (!amount || Number(amount) <= 0) { showToast('Please enter a valid amount', 'warn'); return; }
    if (!proof || proof.length < 15) { showToast('Please provide more details for verification', 'warn'); return; }

    const btn = document.querySelector('.cm-btn-p');
    const oldText = btn.textContent;
    btn.disabled = true; btn.textContent = 'Submitting...';

    try {
        const res = await fetch('/api/claim', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: user.phone,
                amount: parseFloat(amount),
                reason: currentClaimType,
                proof: proof,
                trigger_type: 'manual_trigger'
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to submit claim');

        showToast('🛡️ Claim submitted for AI assessment!', 'success', 5000);
        closeClaimModal();
        loadUserClaims(); // Refresh list
    } catch (e) {
        showToast(e.message, 'error');
    } finally {
        btn.disabled = false; btn.textContent = oldText;
    }
}

/* ── POLICY & CLAIMS ── */
async function loadUserPolicy() {
    if (!user || !user.phone || isDemo) return;
    try {
        const res = await fetch('/api/policy/' + encodeURIComponent(user.phone));
        if (!res.ok) { resetStatsForNewUser(); return; }
        const { policy } = await res.json();
        if (!policy) { resetStatsForNewUser(); return; }
        const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

        setEl('dash-tier', policy.plan || 'No Active Plan');
        setEl('dash-payout', policy.payout ? '₹' + Number(policy.payout).toLocaleString('en-IN') : '₹—');
        setEl('dash-prem', policy.premium ? '₹' + Number(policy.premium).toLocaleString('en-IN') : '₹—');
        setEl('stat-premium', policy.premium ? '₹' + Number(policy.premium).toLocaleString('en-IN') : '₹—');
        setEl('stat-premium-desc', policy.premium ? 'Auto-debit · Friday' : 'Select a plan to activate');

        // Toggle CTA
        const cta = document.getElementById('dash-get-covered');
        const pol = document.getElementById('dash-active-policy');
        if (cta) cta.style.display = 'none';
        if (pol) pol.style.display = 'block';

        // Update AI Risk Score
        const risk = policy.risk_score || 0.00;
        const riskEl = document.getElementById('dash-risk-score');
        const riskLbl = document.getElementById('dash-risk-label');
        if (riskEl) riskEl.textContent = Number(risk).toFixed(2);
        if (riskLbl) {
            if (risk > 0.7) { riskLbl.textContent = 'High Risk'; riskLbl.style.color = '#ef4444'; }
            else if (risk > 0.4) { riskLbl.textContent = 'Moderate Risk'; riskLbl.style.color = '#f59e0b'; }
            else { riskLbl.textContent = 'Low Risk'; riskLbl.style.color = '#22c55e'; }
        }

        const cpb = document.getElementById('cpb'); if (cpb) cpb.style.width = '75%';
        currentPlan = { name: policy.job_type || policy.plan, price: '₹' + policy.premium, payout: '₹' + policy.payout };
    } catch (e) { console.error('Policy Load Error:', e); resetStatsForNewUser(); }
}


async function loadUserClaims() {
    if (!user || !user.phone || isDemo) return;
    try {
        const res = await fetch('/api/claims/' + encodeURIComponent(user.phone));
        if (!res.ok) return;
        const { claims } = await res.json();

        const tbody = document.querySelector('#claims-table tbody') || document.getElementById('claims-list');
        if (tbody) tbody.innerHTML = '';

        let totalApproved = 0;
        let approvedCount = 0;

        if (claims && claims.length > 0) {
            claims.forEach(c => {
                const isApproved = c.status === 'Approved';
                if (isApproved) {
                    totalApproved += Number(c.amount || 0);
                    approvedCount++;
                }

                if (tbody) {
                    const statusColor = isApproved ? '#22c55e' : c.status === 'Rejected' ? '#dc2626' : '#d97706';
                    const fraudClass = (c.fraud_score || 0) > 0.6 ? 'fraud-high' : 'fraud-low';
                    const fraudLabel = (c.fraud_score || 0) > 0.6 ? 'Suspicious' : 'Verified';

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td style="padding:12px;font-size:13px">#${c.id}</td>
                        <td style="padding:12px;font-size:13px">₹${Number(c.amount || 0).toLocaleString('en-IN')}</td>
                        <td style="padding:12px;font-size:13px">${new Date(c.date || c.created_at).toLocaleDateString('en-IN')}</td>
                        <td style="padding:12px"><span style="color:${statusColor};font-weight:700;font-size:12px">${c.status}</span></td>
                        <td style="padding:12px">
                            <div class="fraud-badge ${fraudClass}">${fraudLabel} (${Number(c.fraud_score || 0).toFixed(2)})</div>
                        </td>
                        <td style="padding:12px;font-size:11px;color:rgba(255,255,255,.4)">${c.proof || '—'}</td>`;
                    tbody.appendChild(row);
                }
            });
        }

        // Update Dashboard Stats with real data
        const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        setEl('stat-protected', '₹' + totalApproved.toLocaleString('en-IN'));
        setEl('ib-stat-protected', '₹' + totalApproved.toLocaleString('en-IN'));
        setEl('stat-payout-count', approvedCount > 0 ? `↑ ${approvedCount} payouts` : 'No payouts yet');
        setEl('ib-stat-alert', approvedCount > 0 ? 'Claims Processed' : 'None');

        const lastSeen = S.get('lastClaimsCount') || 0;
        if (claims && claims.length > lastSeen) {
            showToast(`📋 You have ${claims.length} claim(s) on record.`, 'info', 4000);
            S.set('lastClaimsCount', claims.length);
        }
    } catch (e) { console.error('Claims Load Error:', e); }
}

/* ── BETTERMENT AI ── */
async function loadBetterment() {
    if (!user || !user.phone) return;
    try {
        const res = await fetch('/api/betterment/' + encodeURIComponent(user.phone));
        if (res.status === 404) {
            // No insights yet, trigger a simulation for demo purposes
            await fetch('/api/betterment/simulate', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: user.phone })
            });
            setTimeout(loadBetterment, 1000);
            return;
        }
        if (!res.ok) return;
        const { insight } = await res.json();
        const data = insight.insights;

        const scoreEl = document.getElementById('bet-score');
        const insightEl = document.getElementById('bet-insight-text');
        const recEl = document.getElementById('bet-recommendation');

        if (scoreEl) scoreEl.innerHTML = `${(data.prob * 100).toFixed(0)}% <span>Risk Exposure</span>`;
        if (insightEl) insightEl.textContent = data.insight;
        if (recEl) recEl.textContent = data.recommendation;

        // Randomize forecast bar heights for visual fidelity
        const bars = document.querySelectorAll('.f-day');
        bars.forEach(bar => {
            const h = 15 + Math.random() * 75;
            bar.style.height = h + '%';
            bar.className = 'f-day ' + (h > 70 ? 'high' : h > 40 ? 'med' : 'low');
        });

    } catch (e) { console.error('Betterment error:', e); }
}

/* ── LIVE WEATHER ── */
async function fetchLiveWeather() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
            const res = await fetch(`/api/weather/live?lat=${lat}&lon=${lon}`);
            if (!res.ok) return;
            const data = await res.json();
            if (!data.risk) return;
            const { location, weather, risk } = data;
            const locEl = document.getElementById('sw-loc');
            if (locEl) locEl.innerHTML = `<span class="user-zone">${user ? user.zone : location.city}</span>`;
            const alertBanner = document.getElementById('dash-ab');
            const alertBadge = document.getElementById('sw-badge');

            if (risk.riskLevel === 'EXTREME') {
                if (alertBanner) {
                    alertBanner.style.display = 'flex';
                    const alertTitle = alertBanner.querySelector('.ab-t');
                    const alertBody = alertBanner.querySelector('.ab-b2');
                    if (alertTitle) { alertTitle.textContent = `Parametric Trigger — ${risk.alertType}`; alertTitle.style.color = risk.alertColor; }
                    if (alertBody) alertBody.textContent = risk.alertMsg;
                }
                if (alertBadge) {
                    alertBadge.style.display = 'block';
                    alertBadge.textContent = risk.alertType.toUpperCase();
                }
                showToast(`🌧️ ${risk.alertType} in ${location.area}! Your coverage is active.`, 'warn', 7000);
            } else {
                if (alertBanner) alertBanner.style.display = 'none';
                if (alertBadge) alertBadge.style.display = 'none';
                if (risk.riskLevel === 'HIGH') showToast(`⚠️ ${risk.alertType} in ${location.city}. Stay cautious.`, 'info', 5000);
            }
            S.set('liveWeather', { location, weather, risk });
        } catch (e) { console.warn('Live weather fetch failed:', e.message); }
    }, () => { console.info('Location denied or unavailable. Using default data.'); }, { timeout: 8000, maximumAge: 300000 });
}

/* ── DOM INIT ── */
window.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initCursorInteractions();

    // Auto-login if remembered
    const savedUser = S.get('user');
    if (savedUser && S.get('rememberMe')) {
        user = savedUser; launchApp(savedUser);
    }

    // Autocomplete delegation
    document.body.addEventListener('click', e => {
        const item = e.target.closest('.ac-item');
        if (item) {
            const city = item.dataset.city;
            const inputId = item.dataset.input;
            const listId = item.dataset.list;
            const zoneId = item.dataset.zone;
            if (city && inputId) selectCity(inputId, listId, zoneId, city);
        }
        // Close autocomplete lists on outside click
        if (!e.target.closest('.ac-wrap')) {
            document.querySelectorAll('.ac-list').forEach(l => l.classList.remove('show'));
        }
    });

    // AI Enter key
    const aiIn = document.getElementById('ai-in');
    if (aiIn) aiIn.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAI(); } });

    // AI key settings
    ['ai-key', 'set-ai-key'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (aiKey) el.value = aiKey;
        el.addEventListener('change', () => { aiKey = el.value.trim(); S.set('aikey', aiKey); showToast('AI key saved', 'success'); });
    });
});

/* ── PWA ── */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js?v=2.0.3')
            .then(reg => console.log('SW Fixed v2.0.3'))
            .catch(e => console.error('SW Error:', e));
    });
}

/* ── EXPOSE TO GLOBAL SCOPE (required for onclick= attributes) ── */
window.openLogin = openLogin;
window.closeLogin = closeLogin;
window.switchTab = switchTab;
window.doLogin = doLogin;
window.doSignup = doSignup;
window.doLogout = doLogout;
window.loadDemo = loadDemo;
window.loadAdmin = loadAdmin;
window.launchApp = launchApp;
window.exitApp = exitApp;
window.goPage = goPage;
window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.toggleSet = toggleSet;
window.selectTier = selectTier;
window.saveOnboard = saveOnboard;
window.selWT = selWT;
window.showCities = showCities;
window.selectCity = selectCity;
window.updateZones = updateZones;
window.toggleAI = toggleAI;
window.sendAI = sendAI;
window.askAI = askAI;
window.addUserMsg = addUserMsg;
window.addBotMsg = addBotMsg;
window.runSim = runSim;
window.submitAppeal = submitAppeal;
async function fetchRecentTriggers() {
    try {
        const res = await fetch('/api/triggers/recent');
        const { triggers } = await res.json();
        const list = document.getElementById('recent-triggers-list');
        if (!list) return;

        if (!triggers || triggers.length === 0) {
            list.innerHTML = `<div style="text-align:center;padding:20px;color:rgba(255,255,255,.3);font-size:12px;">No recent triggers. Stay safe!</div>`;
            return;
        }

        list.innerHTML = triggers.map(t => {
            const date = new Date(t.timestamp);
            const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
            const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            
            return `
                <div class="tli">
                    <div class="tl-dot" style="background:var(--green); ${t.id === triggers[0].id ? 'box-shadow:0 0 7px rgba(var(--gRgb),.5);' : ''}"></div>
                    <div class="tl-b">
                        <div class="tl-t">${t.alert_type} — ${t.city}</div>
                        <div class="tl-m">
                            <span class="pill ${t.condition.includes('Rain') ? 'pr' : t.condition.includes('AQI') ? 'po' : 'pp'}">${t.condition}</span>
                            <span>${dateStr} ${timeStr}</span>
                            ${t.duration ? `<span>${t.duration}</span>` : ''}
                        </div>
                    </div>
                    <div class="tl-a">+₹${t.payout.toLocaleString('en-IN')}</div>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.error('Failed to fetch triggers:', e);
    }
}

window.fetchRecentTriggers = fetchRecentTriggers;
window.submitEmergencyClaim = submitEmergencyClaim;
window.markAllRead = markAllRead;
window.filterNotifs = filterNotifs;

window.toggleAcc = toggleAcc;
window.toggleMobSidebar = toggleMobSidebar;
window.closeMobSidebar = closeMobSidebar;
window.showToast = showToast;
window.requestOTP = requestOTP;
window.openClaimModal = openClaimModal;
window.closeClaimModal = closeClaimModal;
window.showClaimMenu = showClaimMenu;
window.selectClaimType = selectClaimType;
window.submitManualClaim = submitManualClaim;

/* ── LOCALIZATION ── */
const translations = {
    en: {
        nav_home: "Home", nav_claims: "Claims", nav_policy: "Policy", nav_profile: "Profile",
        dash_welcome: "Good morning", stat_protected: "Protected This Month",
        stat_premium: "Weekly Premium", stat_trust: "Trust Score", stat_triggers: "Active Triggers",
        policy_title: "Active Policy", btn_claim: "Emergency Claim", btn_pay: "Pay Now",
        land_hero: "Income protection<br>for India's<br><em>delivery heroes</em>",
        land_cta_start: "Start Coverage — ₹29/week", land_cta_login: "Partner Login",
        pol_curr: "Current Policy", pol_max: "Max payout per event", pol_prem_l: "Weekly premium",
        pol_trig_h: "Triggers Covered", onboard_h: "Quick Onboarding",
        onboard_details: "Worker Details", faq_title: "Common Questions"
    },
    hi: {
        nav_home: "मुख्य", nav_claims: "दावे", nav_policy: "पॉलिसी", nav_profile: "प्रोफ़ाइल",
        dash_welcome: "शुप्रभात", stat_protected: "इस महीने की सुरक्षा",
        stat_premium: "साप्ताहिक प्रीमियम", stat_trust: "ट्रस्ट स्कोर", stat_triggers: "सक्रिय ट्रिगर्स",
        policy_title: "सक्रिय पॉलिसी", btn_claim: "आपातकालीन दावा", btn_pay: "अभी भुगतान करें",
        land_hero: "भारत के डिलीवरी<br>हीरोज के लिए<br><em>आय सुरक्षा</em>",
        land_cta_start: "सुरक्षा शुरू करें — ₹29/सप्ताह", land_cta_login: "पार्टनर लॉगिन",
        pol_curr: "वर्तमान पॉलिसी", pol_max: "अधिकतम भुगतान", pol_prem_l: "साप्ताहिक प्रीमियम",
        pol_trig_h: "कवर किए गए ट्रिगर्स", onboard_h: "त्वरित ऑनबोर्डिंग",
        onboard_details: "कार्यकर्ता विवरण", faq_title: "सामान्य प्रश्न"
    },
    ta: {
        nav_home: "முகப்பு", nav_claims: "கோரிக்கைகள்", nav_policy: "பாலிசி", nav_profile: "விவரக்குறிப்பு",
        dash_welcome: "காலை வணக்கம்", stat_protected: "இந்த மாத பாதுகாப்பு",
        stat_premium: "வாராந்திர பிரீமியம்", stat_trust: "நம்பிக்கை மதிப்பெண்", stat_triggers: "செயலில் உள்ள தூண்டுதல்கள்",
        policy_title: "செயலில் உள்ள பாலிசி", btn_claim: "அவசர கோரிக்கை", btn_pay: "இப்போது செலுத்துங்கள்",
        land_hero: "இந்தியாவின் டெலிவரி<br>ஹீரோக்களுக்கான<br><em>வருமானப் பாதுகாப்பு</em>",
        land_cta_start: "பாதுகாப்பைத் தொடங்கவும் — ₹29/வாரம்", land_cta_login: "பங்குதாரர் உள்நுழைவு",
        pol_curr: "தற்போதைய பாலிசி", pol_max: "அதிகபட்ச கட்டணம்", pol_prem_l: "வாராந்திர பிரீமியம்",
        pol_trig_h: "பாதுகாக்கப்பட்ட தூண்டுதல்கள்", onboard_h: "விரைவான ஆன்போர்டிங்",
        onboard_details: "பணியாளர் விவரங்கள்", faq_title: "பொதுவான கேள்விகள்"
    },
    te: {
        nav_home: "హోమ్", nav_claims: "క్లెయిమ్‌లు", nav_policy: "పాలసీ", nav_profile: "ప్రొఫైల్",
        dash_welcome: "శుభోదయం", stat_protected: "ఈ నెల రక్షణ",
        stat_premium: "కనీస ప్రీమియం", stat_trust: "ట్రస్ట్ స్కోర్", stat_triggers: "ట్రిగ్గర్లు",
        policy_title: "యాక్టివ్ పాలసీ", btn_claim: "అత్యవసర క్లెయిమ్", btn_pay: "ఇప్పుడే చెల్లించండి",
        land_hero: "డెలివరీ హీరోలకు<br>భారతదేశ మొట్టమొదటి<br><em>ఆదాయ రక్షణ</em>",
        land_cta_start: "రక్షణను ప్రారంభించండి — ₹29/వారం", land_cta_login: "భాగస్వామి లాగిన్",
        pol_curr: "ప్రస్తుత పాలసీ", pol_max: "గరిష్ట చెల్లింపు", pol_prem_l: "వారపు ప్రీమియం",
        pol_trig_h: "కవర్ చేయబడిన ట్రిగ్గర్లు", onboard_h: "త్వరిత ఆన్‌బోర్డింగ్",
        onboard_details: "కార్మికుల వివరాలు", faq_title: "సాధారణ ప్రశ్నలు"
    }
};

function setLang(lang) {
    try {
        currentLang = lang;
        S.set('lang', lang);
        updateLocalization();
        document.querySelectorAll('.lang-o').forEach(el => el.classList.toggle('on', el.id === 'lang-' + lang));
        const labels = { en: 'English', hi: 'हिंदी', ta: 'தமிழ்', te: 'తెలుగు' };
        showToast('Language: ' + (labels[lang] || lang), 'success');
    } catch (e) { console.error('setLang error:', e); }
}

function updateLocalization() {
    try {
        const t = translations[currentLang];
        if (!t) return;
        document.querySelectorAll('[data-t]').forEach(el => {
            const key = el.getAttribute('data-t');
            if (t[key]) {
                if (el.tagName === 'INPUT') el.placeholder = t[key];
                else el.innerHTML = t[key];
            }
        });
    } catch (e) { console.error('Localization error:', e); }
}

function updateCityFraudScore() {
    const city = document.getElementById('admin-fraud-city').value;
    const scores = {
        'Mumbai': { score: 88, gps: 94, signal: 82, label: 'SAFE', color: 'var(--green)' },
        'Delhi': { score: 62, gps: 71, signal: 54, label: 'ELEVATED', color: 'var(--amber)' },
        'Bangalore': { score: 94, gps: 97, signal: 91, label: 'SAFE', color: 'var(--green)' },
        'Chennai': { score: 85, gps: 88, signal: 81, label: 'SAFE', color: 'var(--green)' },
        'Hyderabad': { score: 78, gps: 82, signal: 73, label: 'MODERATE', color: 'var(--amber)' },
        'Kolkata': { score: 55, gps: 58, signal: 49, label: 'ELEVATED', color: 'var(--red)' }
    };

    const d = scores[city] || scores['Mumbai'];
    const sEl = document.getElementById('city-fraud-score');
    const cEl = document.getElementById('city-fraud-circle');
    const lEl = sEl.nextElementSibling;

    if (sEl) {
        sEl.textContent = d.score;
        sEl.style.color = d.color;
    }
    if (lEl) {
        lEl.textContent = d.label;
    }
    if (cEl) {
        cEl.style.stroke = d.color;
        const dash = Math.round((d.score / 100) * 226);
        cEl.style.strokeDasharray = `${dash} 226`;
    }

    document.getElementById('gps-score-val').textContent = d.gps + '%';
    document.getElementById('gps-score-fill').style.width = d.gps + '%';
    document.getElementById('gps-score-fill').style.background = d.color;

    document.getElementById('signal-score-val').textContent = d.signal + '%';
    document.getElementById('signal-score-fill').style.width = d.signal + '%';
    document.getElementById('signal-score-fill').style.background = d.color;
}

window.updateCityFraudScore = updateCityFraudScore;
window.setLang = setLang;
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', updateLocalization);
} else {
    updateLocalization();
}
document.querySelectorAll('.lang-o').forEach(el => el.classList.toggle('on', el.id === 'lang-' + currentLang));


