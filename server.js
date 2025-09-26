const express = require('express');
const path = require('path');
const os = require('os');
const app = express();
const PORT = 3000;

// 정적 파일 서빙 (루트와 public 모두)
app.use(express.static('.'));
app.use(express.static(path.join(__dirname, 'public')));
// JSON 바디 파싱 (에러 처리 포함)
app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf, encoding) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            console.error('JSON 파싱 에러:', e.message);
            console.error('받은 데이터:', buf.toString());
            throw new Error('Invalid JSON');
        }
    }
}));

// 서버 간 수신 기록을 메모리에 저장
const peerReceiveLog = [];

// 메인 홈페이지
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// (페이지 SSR 라우트 제거) — 정적 파일과 단축 경로만 유지

// public 하위에 폴더로 분리된 정적 페이지 단축 경로
app.get('/server1', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'server1', 'index.html'));
});
app.get('/server2', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'server2', 'index.html'));
});
app.get('/peer-test', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'peer', 'index.html'));
});

// MSA 데모 서비스 페이지들
app.get('/apple', (req, res) => {
    console.log('🍎 Apple 서비스에 접속했습니다!');
    console.log('📱 클라이언트 IP:', req.ip);
    console.log('🕐 접속 시간:', new Date().toLocaleString('ko-KR'));
    console.log('🌐 User-Agent:', req.headers['user-agent']);
    console.log('----------------------------------------');
    
    res.sendFile(path.join(__dirname, 'public', 'apple', 'index.html'));
});

app.get('/samsung', (req, res) => {
    console.log('📱 Samsung 서비스에 접속했습니다!');
    console.log('📱 클라이언트 IP:', req.ip);
    console.log('🕐 접속 시간:', new Date().toLocaleString('ko-KR'));
    console.log('🌐 User-Agent:', req.headers['user-agent']);
    console.log('----------------------------------------');
    
    res.sendFile(path.join(__dirname, 'public', 'samsung', 'index.html'));
});

app.get('/load', (req, res) => {
    console.log('⚖️ Load Balancer 페이지에 접속했습니다!');
    console.log('📊 클라이언트 IP:', req.ip);
    console.log('🕐 접속 시간:', new Date().toLocaleString('ko-KR'));
    console.log('🌐 User-Agent:', req.headers['user-agent']);
    console.log('----------------------------------------');
    
    res.sendFile(path.join(__dirname, 'public', 'load', 'index.html'));
});

// Public IP를 가져오는 비동기 함수 (AWS Metadata API 우선)
async function getPublicIP() {
    // AWS EC2 Metadata API (가장 정확) - Node.js에서 직접 접근
    try {
        console.log('🔍 AWS Metadata API 시도 중...');
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        
        const { stdout } = await execAsync('curl -s http://169.254.169.254/latest/meta-data/public-ipv4');
        const awsIP = stdout.trim();
        
        if (awsIP && awsIP !== '') {
            console.log('✅ AWS Metadata API에서 Public IP 가져옴:', awsIP);
            return awsIP;
        }
    } catch (error) {
        console.log('⚠️ AWS Metadata API 실패:', error.message);
    }
    
    // AWS Metadata가 실패하면 다른 서비스들 시도
    const services = [
        { url: 'https://api.ipify.org?format=json', name: 'ipify.org', isJson: true },
        { url: 'https://ipapi.co/json/', name: 'ipapi.co', isJson: true },
        { url: 'https://httpbin.org/ip', name: 'httpbin.org', isJson: true }
    ];
    
    for (const service of services) {
        try {
            console.log(`🔍 ${service.name} 시도 중...`);
            const response = await fetch(service.url, { timeout: 3000 });
            
            if (response.ok) {
                const data = await response.json();
                const ip = data.ip || data.origin || data.query;
                
                if (ip && ip.trim() !== '') {
                    console.log(`✅ ${service.name}에서 Public IP 가져옴:`, ip.trim());
                    return ip.trim();
                }
            }
        } catch (error) {
            console.log(`⚠️ ${service.name} 실패:`, error.message);
            continue;
        }
    }
    
    console.error('❌ 모든 Public IP 서비스 실패');
    return 'N/A';
}

// IP 정보를 가져오는 함수
async function getIPInfo() {
    const interfaces = os.networkInterfaces();
    const privateIPs = [];
    let publicIP = await getPublicIP(); // Public IP 가져오기
    
    Object.keys(interfaces).forEach(interfaceName => {
        interfaces[interfaceName].forEach(interface => {
            if (interface.family === 'IPv4' && !interface.internal) {
                privateIPs.push({
                    interface: interfaceName,
                    address: interface.address
                });
            }
        });
    });
    
    return {
        publicIP: publicIP,
        privateIPs: privateIPs,
        timestamp: new Date().toISOString()
    };
}

// ========== API Router (/api) ==========
const api = express.Router();

// 상대 서버가 우리에게 자신의 Private IP를 등록(전송)
api.post('/peer/register', (req, res) => {
    const { fromPrivateIP, note } = req.body || {};
    const record = {
        fromPrivateIP: fromPrivateIP || 'unknown',
        note: note || '',
        receivedAt: new Date().toISOString(),
        client: req.ip,
        xff: req.headers['x-forwarded-for'] || null,
    };
    peerReceiveLog.push(record);
    res.json({ ok: true, received: record, total: peerReceiveLog.length });
});

// 우리가 받은 목록 확인
api.get('/peer/received', (req, res) => {
    res.json({ count: peerReceiveLog.length, items: peerReceiveLog });
});

// 상대 서버로 우리 Private IP를 전송
api.post('/peer/send', async (req, res) => {
    try {
        const { peerHost, note } = req.body || {};
        if (!peerHost) {
            return res.status(400).json({ ok: false, error: 'peerHost가 필요합니다. 예: 172.31.x.x 또는 hostname' });
        }

        const info = await getIPInfo();
        const myPrivate = (info.privateIPs[0] && info.privateIPs[0].address) || null;
        if (!myPrivate) {
            return res.status(500).json({ ok: false, error: '내 Private IP를 찾을 수 없습니다.' });
        }

        const url = `http://${peerHost}:${PORT}/api/peer/register`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fromPrivateIP: myPrivate, note: note || 'hello from peer' }),
            timeout: 5000,
        });

        const data = await response.json().catch(() => ({}));
        res.json({ ok: true, sentTo: url, myPrivateIP: myPrivate, peerResponse: data });
    } catch (err) {
        res.status(502).json({ ok: false, error: err.message || String(err) });
    }
});

// IP 정보 조회
api.get('/ip-info', async (req, res) => {
    res.json(await getIPInfo());
});

// /api로 마운트
app.use('/api', api);

app.listen(PORT, () => {
    console.log('🌐 Server is running on port ' + PORT);
    console.log('📱 Access: http://localhost:' + PORT);
    console.log('🔗 IP Info API: http://localhost:' + PORT + '/api/ip-info');
});