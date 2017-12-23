/**
 * aXe HTML Report generator bookmarklet for accessibility testing.
 *
 * @author Ugurcan (Ugi) Kutluoglu <ugurcank@gmail.com>
 */

var aXeReport = (function () {
    "use strict";

    var templateSrc = '<h1>Report For "{{testUrl}}"</h1><p>Generated at {{testDate}}</p><ul><li>{{numCritical}} Critical</li><li>{{numSevere}} Serious</li><li>{{numModerate}} Moderate</li><li>{{numMinor}} Minor</li></ul><ul>{{#each violations}}<li><h2>{{help}} <span>({{impact}})</span></h2><p>{{description}} <a href="{{helpUrl}}" target="_blank">More Info</a></p><pre>{{html}}</pre><pre>Location: {{target}}</pre></li>{{/each}}</ul>';

    var renderData = {
        testUrl: 'http://www.yourURL.com',
        testDate: '01/01/2017 12:00A',
        numCritical: 0,
        numSevere: 0,
        numModerate: 0,
        numMinor: 0,
        violations: []
    };

    function main() {
        axe.run(document, {
            runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa", "best-practice"]
            },
            "rules": {
                "skip-link": {enabled: false}
            }
        }, function (err, results) {
            if (err) throw err;

            if (results.violations.length) {
                results.violations.forEach(function (violation) {
                    violation.nodes.forEach(function (node) {
                        var currentNode = [];
                        currentNode["impact"] = violation.impact;
                        currentNode["description"] = violation.description;
                        currentNode["help"] = violation.help;
                        currentNode["helpUrl"] = violation.helpUrl;
                        currentNode["html"] = node.html;
                        currentNode["target"] = node.target;

                        switch (violation.impact) {
                            case "critical":
                                renderData.numCritical++;
                                break;
                            case "serious":
                                renderData.numSevere++;
                                break;
                            case "moderate":
                                renderData.numModerate++;
                                break;
                            case "minor":
                                renderData.numMinor++;
                                break;
                            default:
                                renderData.numModerate++;
                        }
                        renderData.violations.push(currentNode);
                    }, this);
                }, this);

                renderData.testUrl = window.location.href;

                var currentdate = new Date();
                renderData.testDate = currentdate.getDate() + "/"
                    + (currentdate.getMonth() + 1) + "/"
                    + currentdate.getFullYear() + " @ "
                    + currentdate.getHours() + ":"
                    + currentdate.getMinutes() + ":"
                    + currentdate.getSeconds();

                var template = Handlebars.compile(templateSrc);
                download('results.html', template(renderData));

            } else {
                alert("Awesome, no problems found.");
            }

        });
    }

    /**
     * getResource - Loads multiple Script and CSS resources from the specified URL.
     * a call back is called when all the resources are loaded.
     * @param string url, a string or a coma-separated list of urls
     * @param string callback
     * @param string type
     * This function is a modified version of Paul Irish's getScript() function
     * http://pastie.org/462639
     */
    function getResource(url, callback, type) {
        var head = document.getElementsByTagName("head")[0],
            done = false,
            elem,
            splitUrl = url.split(',');
        type = type || 'script';

        if (splitUrl.length > 0) {
            for (var i = 0; i < splitUrl.length; i++) {
                switch (type) {
                    case 'script': {
                        elem = document.createElement("script");
                        elem.src = splitUrl[i];
                        break;
                    }
                    case 'css': {
                        elem = document.createElement("link");
                        elem.type = "text/css";
                        elem.rel = "stylesheet";
                        elem.href = splitUrl[i];
                        break;
                    }
                }

                elem.onload = elem.onreadystatechange = function () {
                    if (!done && (!this.readyState ||
                            this.readyState === "loaded" || this.readyState === "complete")) {
                        done = true;
                        callback();
                    }
                };
                head.appendChild(elem);
            }
        } else {
            switch (type) {
                case 'script': {
                    elem = document.createElement("script");
                    elem.src = url;
                    break;
                }
                case 'css': {
                    elem = document.createElement("link");
                    elem.type = "text/css";
                    elem.rel = "stylesheet";
                    elem.href = url;
                    break;
                }
            }

            elem.onload = elem.onreadystatechange = function () {
                if (!done && (!this.readyState ||
                        this.readyState === "loaded" || this.readyState === "complete")) {
                    done = true;
                    callback();
                }
            };
            head.appendChild(elem);
        }
    }

    function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    getResource('https://cdnjs.cloudflare.com/ajax/libs/axe-core/2.6.0/axe.min.js', function () {
        getResource('https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.11/handlebars.min.js', function () {
            main();
        });
    });

})();