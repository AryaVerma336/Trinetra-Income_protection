/* ── GIGSHIELD APP CORE (v2.0.2) ── */
console.log('GIGSHIELD_APP: Initializing v2.0.2 ...');

/* ── STORAGE ── */
const S = {
    get: (k) => { try { const v = localStorage.getItem('gs_' + k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem('gs_' + k, JSON.stringify(v)); } catch (e) { } },
    del: (k) => { try { localStorage.removeItem('gs_' + k); } catch (e) { } }
};

/* ── USER STATE ── */
let user = S.get('user') || null;
let settings = S.get('settings') || { renew: true, alerts: true, notif: true, bio: false, '2fa': true, sum: false, fraud: true };
let aiKey = S.get('aikey') || '';
let aiHistory = [];
let currentPlan = S.get('plan') || { name: 'Standard', price: '₹59', payout: '₹1,200' };

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
async function doLogin() {
    const ph = document.getElementById('login-phone').value.trim();
    const pw = document.getElementById('login-pass').value.trim();
    if (!ph) { showToast('Enter phone number', 'warn'); return; }
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: ph, password: pw })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        if (document.getElementById('remember-me')?.checked) { S.set('rememberMe', true); } else { S.del('rememberMe'); }
        S.set('savedPhone', ph);
        launchApp(data.user);
    } catch (e) { showToast(e.message, 'error'); }
}

async function doSignup() {
    const name = document.getElementById('su-name').value.trim();
    const phone = document.getElementById('su-phone').value.trim();
    const pass = document.getElementById('su-pass').value.trim();
    if (!name || !phone || !pass) { showToast('Please fill in required fields', 'warn'); return; }
    const platform = document.querySelector('.wt.sel')?.dataset.platform || 'Zomato';
    try {
        const res = await fetch('/api/auth/signup', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name, phone, platform,
                zone: document.getElementById('su-zone') ? document.getElementById('su-zone').value : 'Mumbai Central',
                upi: phone + '@upi',
                pid: 'ACT-' + Math.floor(1000 + Math.random() * 9000),
                password: pass
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Signup failed');
        S.set('savedPhone', phone);
        launchApp(data.user);
        setTimeout(() => goPage('onboard'), 800);
    } catch (e) { showToast(e.message, 'error'); }
}

function resetStatsForNewUser() {
    const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setEl('stat-protected', '₹0'); setEl('stat-premium', '₹—'); setEl('dash-payout', '₹—');
    setEl('dash-tier', 'No Plan'); setEl('dash-prem', '₹—');
    const cpb = document.getElementById('cpb'); if (cpb) cpb.style.width = '0%';
    const ab = document.getElementById('dash-ab'); if (ab) ab.style.display = 'none';
}

async function loadDemo(type) {
    const demos = {
        zomato: { name: 'Rajan Mehta', phone: '9876543210', platform: 'Zomato', zone: 'Dharavi, Mumbai', upi: '9876543210@upi', pid: 'ZMT-3821', plan: 'Standard Shield', premium: 59, payout: 1200, trust: 92 },
        swiggy: { name: 'Priya Sharma', phone: '9123456780', platform: 'Swiggy', zone: 'Koramangala, Bengaluru', upi: '9123456780@upi', pid: 'SWG-7734', plan: 'Premium Shield', premium: 99, payout: 2500, trust: 87 },
        blinkit: { name: 'Amit Kumar', phone: '9988776655', platform: 'Blinkit', zone: 'Hitech City, Hyderabad', upi: '9988776655@upi', pid: 'BLK-5512', plan: 'Basic Shield', premium: 29, payout: 600, trust: 78 }
    };
    const demo = demos[type] || demos.zomato;
    const demoUser = { name: demo.name, phone: demo.phone, platform: demo.platform, zone: demo.zone, upi: demo.upi, pid: demo.pid };
    showToast(`Loading ${demo.platform} demo...`, 'info', 2000);
    setTimeout(() => {
        launchApp(demoUser);
        currentPlan = { name: demo.plan, price: '₹' + demo.premium, payout: '₹' + demo.payout };
        S.set('plan', currentPlan);
        const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        setEl('stat-protected', '₹' + (demo.payout * 3).toLocaleString('en-IN'));
        setEl('stat-premium', '₹' + demo.premium);
        setEl('dash-payout', '₹' + demo.payout.toLocaleString('en-IN'));
        setEl('dash-tier', demo.plan);
        setEl('dash-prem', '₹' + demo.premium);
    }, 500);
}

async function loadAdmin() {
    const adminUser = { name: 'Admin User', phone: '0000000000', platform: 'GigShield HQ', zone: 'Connaught Place, Delhi', upi: 'admin@gigshield', pid: 'ADMIN-001' };
    showToast('Entering Admin Mode...', 'warn', 2000);
    setTimeout(() => {
        launchApp(adminUser);
        goPage('analytics');
    }, 500);
}

function launchApp(u) {
    user = u || user; if (u) S.set('user', u);
    let city = user.zone && user.zone.includes(',') ? user.zone.split(',').pop().trim() : (user.zone || 'Mumbai').split(' ')[0].trim();
    updateUserCityUI(city, user.zone || 'Mumbai');
    closeLogin();
    const landing = document.getElementById('landing');
    if (landing) landing.classList.add('exit');
    setTimeout(() => {
        if (landing) landing.style.display = 'none';
        document.getElementById('app').classList.add('open');
        const fab = document.getElementById('ai-fab'); if (fab) fab.classList.add('show');
        const eb = document.getElementById('emergency-claim-btn'); if (eb) eb.style.display = 'flex';
        updateUIFromUser();
        loadUserPolicy();
        loadUserClaims();
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
    openPayment(name, price, payout);
}

function openPayment(name, price, payout) {
    const p = document.getElementById('payment-panel');
    const nameEl = document.getElementById('pay-plan-name');
    const priceEl = document.getElementById('pay-plan-price');
    const qrImg = document.getElementById('pay-qr-img');
    
    if (nameEl) nameEl.textContent = name + ' Shield';
    if (priceEl) priceEl.textContent = price;
    
    // Update QR data with price
    if (qrImg) {
        const amt = price.replace('₹','');
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=upi://pay?pa=gigshield@upi&pn=GigShield%20India&am=${amt}&cu=INR`;
    }
    
    if (p) p.classList.add('open');
}

function closePayment() {
    const p = document.getElementById('payment-panel');
    if (p) p.classList.remove('open');
}

async function processPayment() {
    const btn = document.querySelector('.pay-btn');
    const btnText = document.getElementById('pay-btn-text');
    const spinner = document.getElementById('pay-spinner');
    const status = document.getElementById('payment-status');
    const actions = document.getElementById('pay-actions');

    if (!btn || !spinner) return;

    btn.disabled = true;
    btnText.style.display = 'none';
    spinner.style.display = 'block';

    // Simulate Payment Processing
    setTimeout(() => {
        spinner.style.display = 'none';
        btn.style.display = 'none';
        if (status) status.style.display = 'block';
        
        // Finalize selection and save
        currentPlan = selectedPlan;
        S.set('plan', currentPlan);
        showToast(`Payment Successful! ${currentPlan.name} is now active.`, 'success', 3000);

        setTimeout(() => {
            closePayment();
            saveOnboard();
        }, 2000);
    }, 2500);
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

/* ── REFERRALS ── */
function copyRef() {
    const refCode = document.getElementById('ref-code-display');
    const code = refCode ? refCode.textContent : 'GS-' + (user ? user.phone.slice(-4) : '0000');
    navigator.clipboard.writeText(code).then(() => showToast('Referral code copied!', 'success')).catch(() => showToast('Code: ' + code, 'info'));
}

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
        <div style="font-size:11px;color:rgba(255,255,255,.4);letter-spacing:2px;text-transform:uppercase;font-family:var(--fm);margin-bottom:10px;">GigShield Plans</div>
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

/* ── COMMUNITY ── */
function likePost(btn) {
    const count = btn.querySelector('.lk-c') || btn;
    const current = parseInt(count.textContent) || 0;
    count.textContent = current + 1;
    btn.style.color = '#22c55e';
}

function postCommunity() {
    const inp = document.getElementById('post-input');
    const txt = inp ? inp.value.trim() : '';
    if (!txt) { showToast('Write something first!', 'warn'); return; }
    const feed = document.getElementById('comm-feed');
    if (!feed) return;
    const name = user ? user.name : 'Anonymous';
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase();
    const post = document.createElement('div');
    post.className = 'comm-post';
    post.style.cssText = 'padding:16px;border:1px solid rgba(255,255,255,.07);border-radius:14px;margin-bottom:10px;';
    post.innerHTML = `
        <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;">
            <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--green),#16a34a);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;">${initials}</div>
            <div><div style="font-size:13px;font-weight:600;">${name}</div><div style="font-size:11px;color:rgba(255,255,255,.4);">Just now · ${user ? user.zone : 'India'}</div></div>
        </div>
        <p style="font-size:13px;color:rgba(255,255,255,.75);line-height:1.6;margin-bottom:10px;">${txt}</p>
        <div style="display:flex;gap:12px;">
            <button onclick="likePost(this)" style="background:none;border:none;color:rgba(255,255,255,.4);font-size:12px;cursor:pointer;display:flex;align-items:center;gap:5px;">👍 <span class="lk-c">0</span></button>
        </div>`;
    feed.insertBefore(post, feed.firstChild);
    inp.value = '';
    showToast('Posted to community!', 'success');
}

/* ── EMERGENCY CLAIM ── */
async function submitEmergencyClaim() {
    if (!user) { showToast('Please log in first', 'warn'); return; }
    const triggerType = document.getElementById('emergency-trigger')?.value || 'Heavy Rainfall';
    const proof = document.getElementById('emergency-proof')?.value || '';
    try {
        const res = await fetch('/api/claims/submit', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: user.phone, trigger_type: triggerType, proof })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Claim failed');
        showToast('🛡️ Emergency claim submitted! ₹' + (currentPlan.payout || '1,200') + ' processing to your UPI.', 'success', 6000);
        goPage('claims');
    } catch (e) { showToast(e.message, 'error'); }
}

/* ── POLICY & CLAIMS ── */
async function loadUserPolicy() {
    if (!user || !user.phone) return;
    try {
        const res = await fetch('/api/policy/' + encodeURIComponent(user.phone));
        if (!res.ok) return;
        const { policy } = await res.json();
        if (!policy) { resetStatsForNewUser(); return; }
        const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        setEl('dash-tier', policy.job_type || policy.plan || 'Standard Shield');
        setEl('dash-payout', '₹' + Number(policy.payout || 1200).toLocaleString('en-IN'));
        setEl('dash-prem', '₹' + Number(policy.premium || 59).toLocaleString('en-IN'));
        setEl('stat-premium', '₹' + Number(policy.premium || 59).toLocaleString('en-IN'));
        const cpb = document.getElementById('cpb'); if (cpb) cpb.style.width = '75%';
        currentPlan = { name: policy.job_type || policy.plan, price: '₹' + policy.premium, payout: '₹' + policy.payout };
        S.set('plan', currentPlan);
    } catch (e) { /* silent fail */ }
}

async function loadUserClaims() {
    if (!user || !user.phone) return;
    try {
        const res = await fetch('/api/claims/' + encodeURIComponent(user.phone));
        if (!res.ok) return;
        const { claims } = await res.json();
        if (!claims || claims.length === 0) return;
        const tbody = document.querySelector('#claims-table tbody') || document.getElementById('claims-list');
        if (!tbody) return;
        tbody.innerHTML = '';
        claims.forEach(c => {
            const statusColor = c.status === 'Approved' ? '#22c55e' : c.status === 'Rejected' ? '#dc2626' : '#d97706';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="padding:10px 12px;font-size:13px">#${c.id}</td>
                <td style="padding:10px 12px;font-size:13px">₹${Number(c.amount || 0).toLocaleString('en-IN')}</td>
                <td style="padding:10px 12px;font-size:13px">${new Date(c.date || c.created_at).toLocaleDateString('en-IN')}</td>
                <td style="padding:10px 12px"><span style="color:${statusColor};font-weight:700;font-size:12px">${c.status}</span></td>
                <td style="padding:10px 12px;font-size:11px;color:rgba(255,255,255,.4)">${c.proof || '—'}</td>`;
            tbody.appendChild(row);
        });
        const lastSeen = S.get('lastClaimsCount') || 0;
        if (claims.length > lastSeen) {
            showToast(`📋 You have ${claims.length} claim(s) on record.`, 'info', 4000);
            S.set('lastClaimsCount', claims.length);
        }
    } catch (e) { /* silent fail */ }
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
            if (alertBanner) {
                const alertTitle = alertBanner.querySelector('.ab-t');
                const alertBody = alertBanner.querySelector('.ab-b2');
                if (alertTitle) { alertTitle.textContent = `Parametric Trigger — ${risk.alertType}`; alertTitle.style.color = risk.alertColor; }
                if (alertBody) alertBody.textContent = risk.alertMsg;
            }
            S.set('liveWeather', { location, weather, risk });
            if (risk.riskLevel === 'EXTREME') showToast(`🌧️ ${risk.alertType} in ${location.area}! Your coverage is active.`, 'warn', 7000);
            else if (risk.riskLevel === 'HIGH') showToast(`⚠️ ${risk.alertType} in ${location.city}. Stay cautious.`, 'info', 5000);
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
        navigator.serviceWorker.register('/sw.js?v=2.0.2')
            .then(reg => console.log('SW Fixed v2.0.2'))
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
window.likePost = likePost;
window.postCommunity = postCommunity;
window.submitEmergencyClaim = submitEmergencyClaim;
window.markAllRead = markAllRead;
window.filterNotifs = filterNotifs;
window.copyRef = copyRef;
window.toggleAcc = toggleAcc;
window.toggleMobSidebar = toggleMobSidebar;
window.closeMobSidebar = closeMobSidebar;
window.showToast = showToast;
