async function loadIPInfo() {
    try {
        const response = await fetch('/api/ip-info');
        const data = await response.json();
        const ipContent = document.getElementById('ip-info-content');
        ipContent.innerHTML = `
            <div class="ip-item">
                <strong>Public IP:</strong> ${data.publicIP}
            </div>
            <div class="ip-item">
                <strong>Private IP:</strong><br>
                ${data.privateIPs.map(ip => `${ip.interface}: ${ip.address}`).join('<br>')}
            </div>
            <div class="ip-item">
                <strong>업데이트 시간:</strong> ${new Date(data.timestamp).toLocaleString('ko-KR')}
            </div>
        `;
    } catch (error) {
        document.getElementById('ip-info-content').innerHTML = '<div style="color: #ff6b6b;">IP 정보를 불러올 수 없습니다.</div>';
    }
}

document.addEventListener('DOMContentLoaded', loadIPInfo);


