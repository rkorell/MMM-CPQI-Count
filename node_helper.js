/* node_helper.js
 * MagicMirror Module - MMM-CPQI-Count Backend
 * 
 * Führt HTTP-Requests zum CPQI PHP-Backend aus.
 *
 * (c) Dr. Ralf Korell, 2025
 * MIT License
 *
 * # Created: 20.12.2025, 19:15 - AP 1: Initiale Erstellung
 */

var NodeHelper = require("node_helper");
var http = require("http");

module.exports = NodeHelper.create({
    
    start: function() {
        console.log("Starting node helper for: " + this.name);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "CPQI_GET_DATA") {
            this.fetchData(payload);
        }
    },

    fetchData: function(config) {
        var self = this;
        
        // URL aufbauen
        var path = "/php/MagicMirrorModuleStats.php";
        if (config.root) {
            path += "?root=" + encodeURIComponent(config.root);
        }

        var options = {
            hostname: config.serverAddress,
            port: 80,
            path: path,
            method: "GET",
            timeout: 10000
        };

        var req = http.request(options, function(res) {
            var data = "";

            res.on("data", function(chunk) {
                data += chunk;
            });

            res.on("end", function() {
                try {
                    var json = JSON.parse(data);
                    
                    // Fehler aus dem PHP prüfen
                    if (json.error) {
                        self.sendSocketNotification("CPQI_DATA_ERROR", json.error);
                    } else {
                        self.sendSocketNotification("CPQI_DATA_RECEIVED", json);
                    }
                } catch (e) {
                    self.sendSocketNotification("CPQI_DATA_ERROR", "JSON Parse Fehler: " + e.message);
                }
            });
        });

        req.on("error", function(e) {
            self.sendSocketNotification("CPQI_DATA_ERROR", "Server nicht erreichbar");
        });

        req.on("timeout", function() {
            req.destroy();
            self.sendSocketNotification("CPQI_DATA_ERROR", "Timeout bei Serveranfrage");
        });

        req.end();
    }
});
