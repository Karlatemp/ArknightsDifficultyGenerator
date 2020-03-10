// Challenge Mode
(function () {
    /**
     * @type {{[locale:string]:{[translate_key:string]:string}}}
     */
    var translates = {};
    window.locale = "unknown";
    window.translates = translates;
    /**
     * @type {{[key:string]:{ level:number,translate:string,disables:string[], dom:HTMLDivElement, lv_dom: HTMLSpanElement, context: HTMLSpanElement  }}}
     */
    var data = {};
    /**
     * parse translate
     * @param {string} key 
     * @param {string | null} def
     * @returns {string}
     */
    function parseTranslate(key, def) {
        if (key[0] == '$') return key.substr(1);
        var space = translates[window.locale];
        if (space == null) {
            if (def == null) return key;
            return def;
        }
        var val = space[key];
        if (val != null) return val;
        if (def != null) return def;
        return key;
    }
    /**
     * @type {(()=>void)[]}
     */
    var translateUpdateTasks = [];
    function updateTranslate(locale) {
        if (locale != null) window.locale = locale;
        for (var index in data) {
            var limit = data[index];
            limit.context.textContent = parseTranslate(limit.translate);
        }
        document.title = parseTranslate("doc.title", "Arknights Difficulty Generator | Contingency Contract");
        for (var task of translateUpdateTasks) task();
    };
    window.reloadTranslates = updateTranslate;
    /**
     * @type {HTMLDivElement}
     */
    var limits = document.getElementById("limits");
    /**
     * @type {HTMLDivElement}
     */
    var viewer = document.getElementById("limit-view");
    var lts = [
        // [<id>, level, <translate>, no-select]
        ["3star", 1, "3star", []],
        ["challenge", 3, "challenge", []],
        ["oper.10", 1, "oper.10", ["oper.8", "oper.6", "oper.4", "oper.3"]],
        ["oper.8", 2, "oper.8", ["oper.10", "oper.6", "oper.4", "oper.3"]],
        ["oper.6", 3, "oper.6", ["oper.10", "oper.8", "oper.4", "oper.3"]],
        ["oper.4", 4, "oper.4", ["oper.10", "oper.8", "oper.6", "oper.3"]],
        ["oper.3", 5, "oper.3", ["oper.10", "oper.8", "oper.6", "oper.4"]],
        ["no.medic", 2, "no.medic", []],
        ["no.supporter", 1, "no.supporter", []],
        ["no.specialist", 1, "no.specialist", []],
        ["no.defender", 2, "no.defender", []],
        ["no.vanguard", 2, "no.vanguard", []],
        ["no.sniper", 2, "no.sniper", []],
        ["no.guard", 2, "no.guard", []],
        ["no.caster", 2, "no.caster", []],
        ["no.ground", 3, "no.ground", ["no.hill"]],
        ["no.hill", 3, "no.hill", ["no.ground"]],
        ["speed.2x", 1, "speed.2x", []],
        ["no.pausing", 1, "no.pausing", []]
    ];
    for (var limit of lts) {
        var context = document.createElement("span");
        var lv = document.createElement("span");
        var rule = limits.appendChild((data[limit[0]] = {
            level: limit[1],
            translate: limit[2],
            disables: limit[3],
            dom: document.createElement("div"),
            lv_dom: lv,
            context: context
        }).dom);
        rule.appendChild(lv);
        lv.className = "acc-lv";
        lv.textContent = limit[1];
        rule.appendChild(context);
        rule.className = "acc-limit";
    }
    console.log(data);
    (function () { // Initialize limit selecting.
        function updateDisables() {
            var view = "";
            var level = 0;
            for (var index in data) {
                var limit = data[index];
                limit.dom.removeAttribute("disable");
            }
            for (var index in data) {
                var limit = data[index];
                if (limit.dom.getAttribute("selected") != null) {
                    view += limit.context.textContent + "\n";
                    level += limit.level;
                    for (var key of limit.disables) {
                        data[key].dom.setAttribute("disable", "");
                    }
                }
            }
            viewer.textContent = "Level: " + level + "\n" + view;
        }
        translateUpdateTasks.push(updateDisables);
        for (var index in data) {
            var limit = data[index];
            (function (l) {
                l.dom.addEventListener("click", function () {
                    if (l.dom.getAttribute("disable") != null) return;
                    if (l.dom.getAttribute("selected") != null) {
                        l.dom.removeAttribute("selected");
                    } else {
                        l.dom.setAttribute("selected", "");
                    }
                    updateDisables();
                });
            })(limit);
        }
    })();
    (function () { // Document titling. 
        var x = document.getElementById("title-mapping");
        var title = document.querySelector("head > title");
        if (title == null) {
            title = document.createElement("title");
            document.head.appendChild(title);
            title.textContent = document.title;
        }
        Object.defineProperty(document, "title", {
            "enumerable": false,
            "configurable": false,
            get: function () {
                return x.textContent;
            },
            set: function (val) {
                val = String(val);
                x.textContent = title.textContent = val;
            }
        });
    })();
    updateTranslate();
    (function () {
        var topBars = document.getElementById("top-bars");
        // <a href="#" class="item-show" id="language-selector">Language</a>
        /**
         * 
         * @param {string} name 
         * @param {(a: HTMLLinkElement) => void} handle 
         */
        function createNav(name, handle) {
            var a = document.createElement("a");
            a.href = "#";
            a.className = "item-show";
            a.textContent = parseTranslate(name);
            translateUpdateTasks.push(function () { a.textContent = parseTranslate(name) });
            topBars.appendChild(a);
            if (handle != null) handle(a);
            return a;
        }
        createNav("$Language").addEventListener("click", function () {
            Panel(function (sys) {
                function reload() {
                    reloadTranslates(this.getAttribute("language"));
                    sys.close();
                }
                var panel = sys.panel;
                panel.style.width = "600px";
                panel.style.border = "1px white solid";
                panel.style.borderRadius = "25px";
                panel.style.padding = "25px";
                panel.style.height = "500px";
                var d = document.createElement("div");
                d.style.float = "left";
                for (var key in translates) {
                    var lang = translates[key];
                    var x = document.createElement("h3");
                    x.textContent = lang.language;
                    d.appendChild(x);
                    x.style.float = "left";
                    x.style.lineHeight = "37px";
                    x.style.padding = "5px";
                    x.style.border = "1px #66ccff solid";
                    x.style.borderRadius = "7px";
                    x.style.margin = "2px";
                    x.setAttribute("language", key);
                    x.onclick = reload;
                    x.className = "lang-button";
                }
                panel.appendChild(d);
            });
        });
        createNav("$Fork", function (a) { a.target = "_blank"; }).href = "https://github.com/Karlatemp/ArknightsDifficultyGenerator";
        // TODO random select
    })();
})();