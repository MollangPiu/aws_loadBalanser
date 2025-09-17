// 부드러운 랜덤 배경색 생성
function setRandomBackground() {
    const softColors = [
        ['#a8edea', '#fed6e3'], // 연한 민트-핑크
        ['#d299c2', '#fef9d7'], // 연한 보라-노랑
        ['#89f7fe', '#66a6ff'], // 연한 하늘-파랑
        ['#fdbb2d', '#22c1c3'], // 연한 주황-청록
        ['#ffecd2', '#fcb69f'], // 연한 크림-복숭아
        ['#a1c4fd', '#c2e9fb'], // 연한 파랑-하늘
        ['#ff9a9e', '#fecfef'], // 연한 핑크-라벤더
        ['#ffecd2', '#fcb69f'], // 연한 오렌지-핑크
        ['#84fab0', '#8fd3f4'], // 연한 그린-블루
        ['#fad0c4', '#ffd1ff']  // 연한 피치-핑크
    ];
    
    const randomPair = softColors[Math.floor(Math.random() * softColors.length)];
    const gradient = `linear-gradient(135deg, ${randomPair[0]} 0%, ${randomPair[1]} 100%)`;
    document.documentElement.style.setProperty('--random-gradient', gradient);
}

async function loadIPInfo() {
    try {
        const response = await fetch('/api/ip-info');
        const data = await response.json();
        document.getElementById('public-ip').textContent = data.publicIP;
        document.getElementById('private-ip').textContent = data.privateIPs.map(ip => `${ip.interface}: ${ip.address}`).join(', ');
    } catch (error) {
        document.getElementById('public-ip').textContent = '오류';
        document.getElementById('private-ip').textContent = '오류';
    }
}

async function sendToPeer() {
    const peerHost = document.getElementById('peerHost').value.trim();
    const peerNote = document.getElementById('peerNote').value.trim();
    const resultDiv = document.getElementById('peer-result');
    if (!peerHost) {
        resultDiv.innerHTML = '<div style="color:#ff6b6b;">상대 서버 IP를 입력해주세요.</div>';
        return;
    }
    resultDiv.innerHTML = '<div style="color:#666;">전송 중...</div>';
    try {
        const response = await fetch('/api/peer/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ peerHost, note: peerNote })
        });
        const data = await response.json();
        if (data.ok) {
            resultDiv.innerHTML = `<div style="color:#00b894;">✅ 전송 성공!<br>내 Private IP: ${data.myPrivateIP}<br>상대 응답: ${JSON.stringify(data.peerResponse)}</div>`;
        } else {
            resultDiv.innerHTML = `<div style="color:#ff6b6b;">❌ 전송 실패: ${data.error}</div>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<div style=\"color:#ff6b6b;\">❌ 오류: ${error.message}</div>`;
    }
}

async function checkReceived() {
    const resultDiv = document.getElementById('peer-result');
    resultDiv.innerHTML = '<div style="color:#666;">수신 내역 확인 중...</div>';
    try {
        const response = await fetch('/api/peer/received');
        const data = await response.json();
        if (data.count === 0) {
            resultDiv.innerHTML = '<div style="color:#fdcb6e;">📭 수신된 메시지가 없습니다.</div>';
        } else {
            let html = `<div style="color:#00b894;">📬 수신된 메시지 (${data.count}개):</div>`;
            data.items.forEach((item, index) => {
                html += `<div style="margin:10px 0; padding:10px; background:rgba(255,255,255,0.7); border-radius:8px;">
                    <strong>${index + 1}.</strong> ${item.fromPrivateIP}<br>
                    <small>메모: ${item.note || '없음'}</small><br>
                    <small>수신시간: ${new Date(item.receivedAt).toLocaleString('ko-KR')}</small>
                </div>`;
            });
            resultDiv.innerHTML = html;
        }
    } catch (error) {
        resultDiv.innerHTML = `<div style=\"color:#ff6b6b;\">❌ 오류: ${error.message}</div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setRandomBackground();
    loadIPInfo();
});


