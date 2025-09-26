const express = require('express');
const path = require('path');
const router = express.Router();
const { getIPInfo } = require('../services/ip');

// 메모리 수신 로그는 앱 인스턴스에 보관(주입)되도록 의존성 주입 사용
module.exports = (peerReceiveLog, port) => {
    // 우리가 받은 목록 확인
    router.get('/peer/received', (req, res) => {
        res.json({ count: peerReceiveLog.length, items: peerReceiveLog });
    });

    // 상대 서버가 우리에게 자신의 Private IP를 등록(전송)
    router.post('/peer/register', (req, res) => {
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

    // 상대 서버로 우리 Private IP를 전송
    router.post('/peer/send', async (req, res) => {
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

            const url = `http://${peerHost}:${port}/api/peer/register`;
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


    // Apple 서비스 페이지
    router.get('/apple', (req, res) => {
        console.log('🍎 Apple 서비스에 접속했습니다! (API 라우터)');
        console.log('📱 클라이언트 IP:', req.ip);
        console.log('🕐 접속 시간:', new Date().toLocaleString('ko-KR'));
        console.log('🌐 User-Agent:', req.headers['user-agent']);
        console.log('----------------------------------------');
        res.sendFile(path.join(__dirname, '../../public/apple/index.html'));
    });

    // Samsung 서비스 페이지  
    router.get('/samsung', (req, res) => {
        console.log('📱 Samsung 서비스에 접속했습니다! (API 라우터)');
        console.log('📱 클라이언트 IP:', req.ip);
        console.log('🕐 접속 시간:', new Date().toLocaleString('ko-KR'));
        console.log('🌐 User-Agent:', req.headers['user-agent']);
        console.log('----------------------------------------');
        res.sendFile(path.join(__dirname, '../../public/samsung/index.html'));
    });

    router.get('/load-test', (req, res) => {
        console.log('✅ load-test page');
        res.sendFile(path.join(__dirname, '../../public/load/index.html'));
    });

    // Apple 페이지 접속 로그
    router.post('/apple/access', (req, res) => {
        console.log('🍎 Apple 페이지에 접속했습니다!');
        console.log('📱 클라이언트 IP:', req.ip);
        console.log('🕐 접속 시간:', new Date().toLocaleString('ko-KR'));
        console.log('🌐 User-Agent:', req.headers['user-agent']);
        console.log('📊 요청 데이터:', req.body);
        console.log('----------------------------------------');
        
        res.json({ ok: true, message: 'Apple 페이지 접속 로그 기록됨' });
    });

    // Samsung 페이지 접속 로그
    router.post('/samsung/access', (req, res) => {
        console.log('📱 Samsung 페이지에 접속했습니다!');
        console.log('📱 클라이언트 IP:', req.ip);
        console.log('🕐 접속 시간:', new Date().toLocaleString('ko-KR'));
        console.log('🌐 User-Agent:', req.headers['user-agent']);
        console.log('📊 요청 데이터:', req.body);
        console.log('----------------------------------------');
        
        res.json({ ok: true, message: 'Samsung 페이지 접속 로그 기록됨' });
    });

    // 현재 서버 IP 정보
    router.get('/ip-info', async (req, res) => {
        res.json(await getIPInfo());
    });

    return router;
};


