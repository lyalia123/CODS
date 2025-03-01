document.addEventListener("DOMContentLoaded", function () {
    var savedLang = localStorage.getItem("selectedLanguage");
    if (savedLang) {
        setTimeout(() => applyTranslation(savedLang), 1000);
    }

    function applyTranslation(lang) {
        var googleFrame = document.querySelector(".goog-te-combo");
        if (googleFrame) {
            googleFrame.value = lang;
            googleFrame.dispatchEvent(new Event("change"));
        } else {
            setTimeout(() => applyTranslation(lang), 500);
        }
    }

    function hideGoogleTranslateBar() {
        var googleBanner = document.querySelector(".goog-te-banner-frame");
        var googleFrame = document.querySelector("body > iframe");

        if (googleBanner) googleBanner.style.display = "none";
        if (googleFrame) googleFrame.style.display = "none";

        document.body.style.top = "0px";
    }

    setInterval(hideGoogleTranslateBar, 500);
});


