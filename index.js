const fs = require('fs');
const getVpnList = require("./lib/main");

const saveBase64ToFile = (base64Data, filename) => {
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filename, buffer);
};

const generateReadme = (vpnList) => {
    let content = `# VPN List\n\n`;
    content += `This is an auto-generated list of Open VPN config files.\n\n`;
    
    content += `## Last Updated\n\n`;
    content += `This list was last updated on: ${getDate(Date.now())}.\n\n`;
    
    content += `## Available Servers\n\n`;
    content += `Below is the list of available VPN servers:\n\n`;
    content += `(You may connect to any of these VPN servers with: Username: 'vpn', Password: 'vpn'.`
    content += "| Hostname | IP Address | Ping | Speed | Country | OpenVPN Config | Score |\n";
    content += "|----------|------------|-------|-------|---------|----------------| ----- |\n";
    vpnList.servers.forEach((server, index) => {
        let speedInMbps = (server.speed / 10000000).toFixed(2); // Convert to Mbps and round to two decimal places
        content += `| ${server.hostname} | ${server.ip} | ${server.ping} | ${speedInMbps} Mbps | ${server.countrylong} | [Download 📥](./configs/server_${index}_${server.countryshort}.ovpn) | ${server.score}\n`;
    });
    fs.writeFileSync('README.md', content);
}


const getDate = (unix) => {
    return `${new Date(unix).toUTCString()}`;
}

// Make sure the configs directory exists
if (!fs.existsSync('./configs')) {
    fs.mkdirSync('./configs');
}

getVpnList()
    .then(vpnList => {
        servers = vpnList.servers;
        countries = vpnList.countries;
        lastUpdated = Date.now();

        fs.writeFileSync("json/data.json",JSON.stringify([vpnList,lastUpdated], null, 4),"utf-8")
        // Save the configs and update the readme
        vpnList.servers.forEach((server, index) => {
            const configData = server.openvpn_configdata_base64;
            saveBase64ToFile(configData, `./configs/server_${index}_${server.countryshort}.ovpn`);

        });

        generateReadme(vpnList);
    })
    .catch(err => {
        console.log(err);
    });
