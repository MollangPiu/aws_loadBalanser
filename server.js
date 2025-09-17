const express = require('express');
const os = require('os');
const app = express();
const PORT = 3000;

// 정적 파일 서빙 (server1.html, server2.html 포함)
app.use(express.static('.'));

// server1.html 렌더링 (IP 정보 포함)
app.get('/server1.html', async (req, res) => {
    const ipInfo = await getIPInfo();
    const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>서버 1 - 로드밸런서 테스트</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 500px;
            width: 100%;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        h1 {
            color: #333;
            margin-bottom: 30px;
            font-size: 2.5em;
            font-weight: 300;
            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .server-info {
            background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
            border-radius: 15px;
            padding: 25px;
            margin: 20px 0;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .server-info:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }

        .server-label {
            font-size: 1.2em;
            color: #2d3436;
            margin-bottom: 10px;
            font-weight: 600;
        }

        .ip-info {
            background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
            border-radius: 15px;
            padding: 25px;
            margin: 20px 0;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .ip-info:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }

        .ip-item {
            margin-bottom: 10px;
            font-size: 1.1em;
            color: #2d3436;
        }

        .refresh-btn {
            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-size: 1em;
            cursor: pointer;
            margin-top: 20px;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
        }

        .refresh-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
        }

        .refresh-btn:active {
            transform: translateY(0);
        }

        @media (max-width: 600px) {
            .container {
                padding: 30px 20px;
            }
            
            h1 {
                font-size: 2em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔥 서버 1</h1>
        
        <div class="server-info">
            <div class="server-label">⚡ 로드밸런서 테스트 - 서버 1</div>
            <p>현재 요청이 서버 1로 라우팅되었습니다!</p>
        </div>
        
        <div class="ip-info">
            <h3>🌐 네트워크 정보</h3>
            <div class="ip-item">
                <strong>Public IP:</strong> ${ipInfo.publicIP}
            </div>
            <div class="ip-item">
                <strong>Private IP:</strong><br>
                ${ipInfo.privateIPs.map(ip => `${ip.interface}: ${ip.address}`).join('<br>')}
            </div>
            <div class="ip-item">
                <strong>업데이트 시간:</strong> ${new Date(ipInfo.timestamp).toLocaleString('ko-KR')}
            </div>
        </div>
        
        <button class="refresh-btn" onclick="location.reload()">🔄 새로고침</button>
    </div>
</body>
</html>`;
    res.send(html);
});

// server2.html 렌더링 (IP 정보 포함)
app.get('/server2.html', async (req, res) => {
    const ipInfo = await getIPInfo();
    const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>서버 2 - 로드밸런서 테스트</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 500px;
            width: 100%;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        h1 {
            color: #333;
            margin-bottom: 30px;
            font-size: 2.5em;
            font-weight: 300;
            background: linear-gradient(45deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .server-info {
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            border-radius: 15px;
            padding: 25px;
            margin: 20px 0;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .server-info:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }

        .server-label {
            font-size: 1.2em;
            color: #2d3436;
            margin-bottom: 10px;
            font-weight: 600;
        }

        .ip-info {
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            border-radius: 15px;
            padding: 25px;
            margin: 20px 0;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .ip-info:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }

        .ip-item {
            margin-bottom: 10px;
            font-size: 1.1em;
            color: #2d3436;
        }

        .refresh-btn {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-size: 1em;
            cursor: pointer;
            margin-top: 20px;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }

        .refresh-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .refresh-btn:active {
            transform: translateY(0);
        }

        @media (max-width: 600px) {
            .container {
                padding: 30px 20px;
            }
            
            h1 {
                font-size: 2em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌊 서버 2</h1>
        
        <div class="server-info">
            <div class="server-label">⚡ 로드밸런서 테스트 - 서버 2</div>
            <p>현재 요청이 서버 2로 라우팅되었습니다!</p>
        </div>
        
        <div class="ip-info">
            <h3>🌐 네트워크 정보</h3>
            <div class="ip-item">
                <strong>Public IP:</strong> ${ipInfo.publicIP}
            </div>
            <div class="ip-item">
                <strong>Private IP:</strong><br>
                ${ipInfo.privateIPs.map(ip => `${ip.interface}: ${ip.address}`).join('<br>')}
            </div>
            <div class="ip-item">
                <strong>업데이트 시간:</strong> ${new Date(ipInfo.timestamp).toLocaleString('ko-KR')}
            </div>
        </div>
        
        <button class="refresh-btn" onclick="location.reload()">🔄 새로고침</button>
    </div>
</body>
</html>`;
    res.send(html);
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

app.get('/api/ip-info', async (req, res) => {
    res.json(await getIPInfo());
});

app.listen(PORT, () => {
    console.log('🌐 Server is running on port ' + PORT);
    console.log('📱 Access: http://localhost:' + PORT);
    console.log('🔗 IP Info API: http://localhost:' + PORT + '/api/ip-info');
});
