const http = require("http");

const getVpnList = () => {
  return new Promise((resolve, reject) => {
    const vpnGateApiUrl = "http://www.vpngate.net/api/iphone/";
    const req = http.get(vpnGateApiUrl, (res) => {
      let data = "";

      // Handle data received from the API
      res.on("data", (chunk) => {
        data += chunk;
      });

      // Handle the end of the response
      res.on("end", () => {
        if (res.statusCode !== 200) {
          reject({ servers: [], countries: {} });
        } else {
          try {
            let servers = [];
            let countries = {};
            let returnData = { servers, countries };

            data = data.trim().split("\n");

            if (data.length < 2) {
              reject(returnData);
              return;
            }

            const headers = data[1]
              .slice(1, -1)
              .split(",")
              .map((header) => header.trim());

            data = data.slice(2, data.length - 2);

            data.forEach((vpn) => {
              const values = vpn.split(",");
              countries[values[6].toLowerCase()] = values[5];
              let obj = {};
              for (let j = 0; j < values.length; j++) {
                obj[headers[j].toLowerCase()] = values[j].trim();
              }
              servers.push(obj);
            });

            resolve(returnData);
          } catch (error) {
            reject({ servers: [], countries: {} });
          }
        }
      });
    });

    req.on("error", (error) => {
      reject({ servers: [], countries: {} });
    });

    req.end();
  });
};

module.exports = getVpnList;
