(function () {

    if (typeof browser === "undefined") {
        browser = chrome;
    }

    Interval = {
        PowerPaneControl: {
            Pointer: undefined,
            Count: 0,
            MaxTryCount: 10
        }
    }

    ApplicationType = {
        DynamicsCRM: "Dynamics CRM",
        Dynamics365: "Dynamics 365"
    }

    function GetAppicationType() {

        var mainBody = document.querySelectorAll('body[scroll=no]');
        var topBar = document.querySelector("div[data-id=topBar]")

        if (mainBody && mainBody.length > 0) {
            return ApplicationType.DynamicsCRM
        } else if (topBar) {
            return ApplicationType.Dynamics365
        } else {
            return null;
        }
    }

    function BuildScriptTag(source) {
        var script = document.createElement("script");
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', source);

        return script;
    }

    function BuildSytleTag(source) {
        var style = document.createElement('link');
        style.setAttribute('rel', 'stylesheet');
        style.setAttribute('type', 'text/css');
        style.setAttribute('src', source);

        return style;
    }

    function BuildPowerPaneButton() {
        var powerPaneButton = document.createElement("span");
        powerPaneButton.setAttribute('class', 'navTabButton');
        powerPaneButton.setAttribute('id', 'crm-power-pane-button');
        powerPaneButton.setAttribute('title', 'Show Dynamics CRM Power Pane');
        

        var linkElement = document.createElement("a");
        linkElement.setAttribute("class", "navTabButtonLink");
        linkElement.setAttribute("title", "");

        var linkImageContainerElement = document.createElement("span");
        linkImageContainerElement.setAttribute("class", "navTabButtonImageContainer");

        var imageElement = document.createElement("img");
        imageElement.setAttribute("src", browser.extension.getURL("img/adjust48.png"));

        if (GetAppicationType() == ApplicationType.Dynamics365) {
            const myDivObjBgColor = window.getComputedStyle(window.top.document.getElementById('topBar')).backgroundColor;

            powerPaneButton.setAttribute('style', 'float:left; width:48px; height:48px;cursor:pointer!important');
            linkElement.setAttribute("style", "float:left; width:48px; height:48px;cursor:pointer!important;text-align:center;background-color:" + myDivObjBgColor);//background-color:black
            //imageElement.setAttribute("style", "padding-top:10px");
        }

        linkImageContainerElement.appendChild(imageElement);
        linkElement.appendChild(linkImageContainerElement);
        powerPaneButton.appendChild(linkElement);

        return powerPaneButton;
    }

    function InjectSource(sources) {

        var isPowerPaneInjected = Array.from(window.top.document.scripts).find(function (elem) { return elem.src.indexOf("ui/js/pane.js") > -1 });

        if (isPowerPaneInjected != undefined) { //power pane already injected
            return;
        }

        body = window.top.document.querySelector('body[scroll=no]') || window.top.document.querySelector('body');

        sources.forEach(function (s) {
            body.appendChild(s);
        });
    }


    function InjectPowerPaneButton() {
        var powerPaneButton = BuildPowerPaneButton();
        var applicationType = GetAppicationType();

        if (applicationType == ApplicationType.DynamicsCRM) {
            var ribbon = window.top.document.querySelector('#navBar');
            console.log("ribbon_DynamicsCRM", ribbon)

            if (ribbon) {
                ribbon.prepend(powerPaneButton);
            }

            return true;

        } else if (applicationType == ApplicationType.Dynamics365) {
            //var officeWaffle = window.top.document.querySelector("button[data-id=officewaffle]");
            var officeWaffle = window.top.document.getElementById("topBar");
            //console.log("ribbon_Dynamics365", officeWaffle)
            
            const myDivObjBgColor = window.getComputedStyle(window.top.document.getElementById('topBar')).backgroundColor;
           // alert(myDivObjBgColor)
           // window.addEventListener("load", function () { changeBackground('red') });
            //window.top.document.getElementById('topBar').style.backgroundColor = 'red';
            //window.top.document.getElementById('O365_MainLink_NavMenu').style.backgroundColor = 'red';
          //  window.top.document.getElementById('siteMapPanelBodyDiv').style.backgroundColor = myDivObjBgColor;
           // window.top.document.document.querySelectorAll('[role="presentation"]').style.backgroundColor = 'red';
            //

            //
            //

            if (officeWaffle) {
                officeWaffle.before(powerPaneButton);
            }

            return true;
        }

        return false;
    };

    function Initialize() {
        Interval.PowerPaneControl.Pointer = setInterval(function () {

            Interval.PowerPaneControl.Count++;
            if (Interval.PowerPaneControl.Count > Interval.PowerPaneControl.MaxTryCount) {
                clearInterval(Interval.PowerPaneControl.Pointer);
            }

            var powerPaneButton = document.getElementById("crm-power-pane-button");

            if (!powerPaneButton) {
                var injectButtonResult = InjectPowerPaneButton();
                if (injectButtonResult == false) {
                    return;
                }

                var powerPaneTemplate = browser.extension.getURL("ui/pane.html");

                xmlHttp = new XMLHttpRequest();
                xmlHttp.open("GET", powerPaneTemplate, true);

                xmlHttp.onreadystatechange = function () {
                    if (xmlHttp.readyState == XMLHttpRequest.DONE) {
                        if (xmlHttp.status == 200) {
                            var content = document.createElement("div");
                            content.innerHTML = xmlHttp.responseText
                            content.className = "crm-power-pane-container";

                            var style = BuildSytleTag(browser.extension.getURL("ui/css/pane.css"));
                            var script = BuildScriptTag(browser.extension.getURL("ui/js/pane.js"));
                            
                            InjectSource([style, script, content]);
                        }
                        else if (xmlHttp.status == 400) {
                            alert('There was an error 400');
                        }
                        else {
                            alert('something else other than 200 was returned');
                        }
                    }
                };

                xmlHttp.send();
            } else {
                clearInterval(Interval.PowerPaneControl.Pointer);
            }
        }, 1000);
    }

    Initialize();

})();
