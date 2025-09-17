const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function getPublicIP() {
    try {
        const { stdout } = await execAsync('curl -s http://169.254.169.254/latest/meta-data/public-ipv4');
        const awsIP = stdout.trim();
        if (awsIP) return awsIP;
    } catch (e) {
        // ignore, fallback below
    }

    const services = [
        { url: 'https://api.ipify.org?format=json', key: ['ip'] },
        { url: 'https://ipapi.co/json/', key: ['ip'] },
        { url: 'https://httpbin.org/ip', key: ['ip', 'origin'] },
    ];
    for (const s of services) {
        try {
            const res = await fetch(s.url, { timeout: 3000 });
            if (!res.ok) continue;
            const data = await res.json();
            for (const k of s.key) {
                const v = data[k];
                if (typeof v === 'string' && v.trim()) return v.trim();
            }
        } catch (_) {}
    }
    return 'N/A';
}

async function getIPInfo() {
    const interfaces = os.networkInterfaces();
    const privateIPs = [];
    Object.keys(interfaces).forEach((name) => {
        interfaces[name].forEach((inf) => {
            if (inf.family === 'IPv4' && !inf.internal) {
                privateIPs.push({ interface: name, address: inf.address });
            }
        });
    });
    const publicIP = await getPublicIP();
    return { publicIP, privateIPs, timestamp: new Date().toISOString() };
}

module.exports = { getPublicIP, getIPInfo };


