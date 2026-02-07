/* MMM-CPQI-Count.js
 * MagicMirror Module - Cisco Partner Quality Index Teilnehmerzähler
 * 
 * Zeigt hierarchische Teilnehmerzahlen aus der CPQI-Umfrage an.
 * Ruft Daten von einem PHP-Backend ab und stellt sie als Baumstruktur dar.
 *
 * (c) Dr. Ralf Korell, 2025
 * MIT License
 *
 * # Created: 20.12.2025, 19:15 - AP 1: Initiale Erstellung
 * # Modified: 20.12.2025, 20:45 - AP 1: Logo neben Titel (Flex-Container)
 */

Module.register("MMM-CPQI-Count", {
    
    defaults: {
        serverAddress: "",          // Required: IP oder Hostname des CPQI-Servers
        root: null,                 // Optional: Startpunkt im Baum (z.B. "SLED")
        detailLevel: 1,             // Anzeigetiefe (1=nur Root, 2=+Kinder, etc.)
        showLogo: false,            // Cisco Partner Logo anzeigen
        title: "CPQI - Anzahl",     // Überschrift
        updateInterval: 300000      // Update-Intervall in ms (default: 5 Min)
    },

    // Interne Variablen
    responseData: null,
    errorMessage: null,

    start: function() {
        Log.info("Starting module: " + this.name);
        
        if (!this.config.serverAddress) {
            this.errorMessage = "Konfigurationsfehler: serverAddress fehlt";
            return;
        }
        
        this.getData();
        this.scheduleUpdate();
    },

    getStyles: function() {
        return ["MMM-CPQI-Count.css"];
    },

    scheduleUpdate: function() {
        var self = this;
        setInterval(function() {
            self.getData();
        }, this.config.updateInterval);
    },

    getData: function() {
        this.sendSocketNotification("CPQI_GET_DATA", {
            serverAddress: this.config.serverAddress,
            root: this.config.root
        });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "CPQI_DATA_RECEIVED") {
            this.errorMessage = null;
            this.responseData = payload;
            this.updateDom();
        } else if (notification === "CPQI_DATA_ERROR") {
            this.errorMessage = payload;
            this.responseData = null;
            this.updateDom();
        }
    },

    getDom: function() {
        var wrapper = document.createElement("div");
        wrapper.className = "cpqi-wrapper";

        // Header-Container (Titel + Logo)
        if (this.config.title || this.config.showLogo) {
            var header = document.createElement("div");
            header.className = "cpqi-header";

            // Titel
            if (this.config.title) {
                var title = document.createElement("div");
                title.className = "cpqi-title";
                title.textContent = this.config.title;
                header.appendChild(title);
            }

            // Logo (falls aktiviert)
            if (this.config.showLogo) {
                var logo = document.createElement("img");
                logo.className = "cpqi-logo";
                logo.src = this.file("cisco.png");
                header.appendChild(logo);
            }

            wrapper.appendChild(header);

            // Linie unter Header
            var line = document.createElement("div");
            line.className = "cpqi-title-line";
            wrapper.appendChild(line);
        }

        // Fehleranzeige
        if (this.errorMessage) {
            var error = document.createElement("div");
            error.className = "cpqi-error dimmed";
            error.textContent = this.errorMessage;
            wrapper.appendChild(error);
            return wrapper;
        }

        // Ladeanzeige
        if (!this.responseData) {
            var loading = document.createElement("div");
            loading.className = "cpqi-loading dimmed";
            loading.textContent = "Lade Daten...";
            wrapper.appendChild(loading);
            return wrapper;
        }

        // Daten anzeigen
        var content = document.createElement("div");
        content.className = "cpqi-content";
        
        var rootNode = this.responseData.root;
        if (rootNode) {
            var rootLevelDepth = rootNode.level_depth || 1;
            this.renderNode(content, rootNode, rootLevelDepth);
        }
        
        wrapper.appendChild(content);
        return wrapper;
    },

    renderNode: function(container, node, rootLevelDepth) {
        // Prüfen ob dieser Knoten angezeigt werden soll (basierend auf detailLevel)
        var relativeLevel = node.level_depth - rootLevelDepth + 1;
        if (relativeLevel > this.config.detailLevel) {
            return;
        }

        // Zeile für diesen Knoten erstellen
        var row = document.createElement("div");
        row.className = "cpqi-row";
        
        // Nullwerte dimmen
        if (node.count === 0) {
            row.className += " dimmed";
        }

        // Einrückung basierend auf Level
        var indent = (node.level_depth - rootLevelDepth) * 15;
        row.style.paddingLeft = indent + "px";

        // Name
        var name = document.createElement("span");
        name.className = "cpqi-name";
        name.textContent = node.name;
        row.appendChild(name);

        // Anzahl
        var count = document.createElement("span");
        count.className = "cpqi-count";
        count.textContent = node.count;
        row.appendChild(count);

        container.appendChild(row);

        // Kinder rekursiv rendern
        if (node.children && node.children.length > 0) {
            for (var i = 0; i < node.children.length; i++) {
                this.renderNode(container, node.children[i], rootLevelDepth);
            }
        }
    }
});
