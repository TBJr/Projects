/*
 * Get User Location
 * Author: Thomas Brown
 * Website: https://thomasbrown.app
 */

(() => {
    "use strict";

    const form = document.getElementById("location-form");
    const keyInput = document.getElementById("api-key");
    const button = document.getElementById("detect-button");
    const result = document.getElementById("location-result");

    function setResult(message, state = "info") {
        result.textContent = message;
        result.dataset.state = state;
    }

    function getPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 60000
            });
        });
    }

    function locationError(error) {
        if (error.code === 1) return "Location access was denied. Allow access in your browser settings and try again.";
        if (error.code === 2) return "Your location is unavailable. Try again when your device can determine it.";
        if (error.code === 3) return "Finding your location timed out. Try again.";
        return "Your location could not be determined. Try again.";
    }

    function responseError(status) {
        if (status === 401 || status === 403) return "OpenCage did not accept this key. Check it and try again.";
        if (status === 402 || status === 429) return "The OpenCage request limit was reached. Try again later or use another key.";
        return "OpenCage could not complete the lookup. Try again later.";
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();
        const key = keyInput.value.trim();
        if (!/^[A-Za-z0-9]{32}$/.test(key)) {
            setResult("Enter a valid 32-character OpenCage API key.", "error");
            keyInput.focus();
            return;
        }
        if (!navigator.geolocation) {
            setResult("This browser does not support location access.", "error");
            return;
        }

        button.disabled = true;
        setResult("Waiting for location permission…");
        let position;
        try {
            position = await getPosition();
        } catch (error) {
            setResult(locationError(error), "error");
            button.disabled = false;
            return;
        }

        setResult("Looking up your location…");
        try {
            const { latitude, longitude } = position.coords;
            const url = new URL("https://api.opencagedata.com/geocode/v1/json");
            url.search = new URLSearchParams({ q: `${latitude},${longitude}`, key }).toString();
            const response = await fetch(url, { cache: "no-store", referrerPolicy: "no-referrer" });
            if (!response.ok) {
                setResult(responseError(response.status), "error");
                return;
            }

            const data = await response.json();
            const first = data.results?.[0];
            if (!first) {
                setResult("No address was found for this location.", "error");
                return;
            }

            const { county, postcode, country } = first.components || {};
            const area = [county, postcode].filter(Boolean).join(" ");
            const place = [area, country].filter(Boolean).join(", ") || first.formatted;
            setResult(place ? `Found: ${place}` : "An address was found, but it has no displayable name.", place ? "success" : "error");
        } catch {
            setResult("The lookup failed. Check your connection and try again.", "error");
        } finally {
            button.disabled = false;
        }
    });
})();
