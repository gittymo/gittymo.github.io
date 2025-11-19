function BreakText(element, chance = 5) {
    // Make sure chance has a sensible value, if it is set.
    if (isNaN(chance) || chance < 2) chance = 5;
    // Make sure the calling method has passed a valid <p> element reference.
    if (!element || element === undefined || !element instanceof HTMLParagraphElement) return;
    // This function will insert <span style="broken-text"> entries into the textual content of the given <p> element.
    // It is meant to give the text a more chaotic look.
    // There are three ways that the span can affect the text:
    // 1)   The span will use the text of a whole word (including punctuation).
    // 2)   The span will start at a random character within one word and will last for a random number of characters,
    //      even if those characters form part of other words.
    // 3)   The span will start at a random character within a word and will randomly change sets of characters in that
    //      word only.

    // Get the text content of the element.
    const elementText = element.innerText;
    // If the element has no inner text, return.
    if (elementText.length == 0) return;

    var i = 0;
    var newElementText = '';
    while (i < elementText.length) {
        // Just add any non-word content to the new element text.
        while (i < elementText.length && !/^[a-zA-Z0-9]$/.test(elementText.charAt(i))) {
            newElementText += elementText.charAt(i++);
        }

        // We're at the start of a word, so we can potentially add our span here - however, we have to roll the chance dice 
        // and hit 1.
        const chanceRoll = Math.round(Math.random() * (chance));
        if (chanceRoll != 1) {
            // If we've not rolled a two, go to the next word.
            while (i < elementText.length && /^[a-zA-Z0-9.,\-!?()]$/.test(elementText.charAt(i))) {
                newElementText += elementText.charAt(i++);
            }
            continue;
        }

        // Get the length of the word.
        var j = i;
        while (j < elementText.length && /^[a-zA-Z0-9.,\-!?()]$/.test(elementText.charAt(j))) j++;
        const wordLength = j - i;

        // Determine if we're going to be doing a whole word or just affecting 'n' number of characters from character index 'm'
        // in the word.
        const wrapWholeWord = Math.round(Math.random() + 1) == 1;

        // If it's the whole word that we're going to wrap with a span, then do that.
        if (wrapWholeWord) {
            newElementText += "<span class='broken-text'>";
            while (i < j) newElementText += elementText.charAt(i++);
            newElementText += "</span>";
        } else {
            // Otherwise, decide on a random offset into the word and then a random number of characters from that offset
            // to wrap with the span.
            const randomOffset = Math.round(Math.random() * (wordLength - 1));
            const randomCharLength = Math.round(Math.random() * 10) + 1;
            // Add any word characters that come before the offset to the new element text.
            j = i + randomOffset;
            while (i < j) newElementText += elementText.charAt(i++);
            // Add the broken text span containing randomCharLength characters from the original text.
            newElementText += "<span class='broken-text'>";
            j += randomCharLength;
            while (i < j) newElementText += elementText.charAt(i++);
            newElementText += "</span>";
            // If we're not at the end of a word, keep adding characters to the new element text until we find it.
            while (i < elementText.length && /^[a-zA-Z0-9.,\-!?()]$/.test(elementText.charAt(i))) {
                newElementText += elementText.charAt(i++);
            }
        }
    }

    // Set the new inner text for the element.
    element.innerHTML = newElementText;
}



function initFilterButtons() {
    const filterButtons = document.getElementsByClassName('filter-button');
    for (let i = 0; i < filterButtons.length; i++) {
        filterButtons[i].addEventListener('click', function () {
            const catFilter = this.getAttribute('cat-filter');
            filterContentByCategory(catFilter);
            // Set the class style active-filter only on the clicked button.
            for (let j = 0; j < filterButtons.length; j++) {
                filterButtons[j].classList.remove('active-filter');
            }
            this.classList.add('active-filter');
        });
    }
}

function filterContentByCategory(category) {
    const contentItems = document.getElementsByClassName('content-item');
    for (let i = 0; i < contentItems.length; i++) {
        const el = contentItems[i];
        const itemCategories = (el.getAttribute('cat-filter') || '').split(' ');
        const shouldShow = itemCategories.includes(category) || category === 'all';

        const isHidden = el.classList.contains('hidden') || getComputedStyle(el).display === 'none';

        if (shouldShow) {
            if (!isHidden) {
                // already visible
                el.classList.remove('fade-out');
                el.classList.remove('fade-in');
                el.style.display = 'block';
                el.style.height = '';
                continue;
            }

            // Show: remove hidden, set height from 0 -> scrollHeight to animate expansion
            el.classList.remove('hidden');
            el.style.display = 'block';
            // start collapsed
            el.style.height = '0px';
            // reflow
            void el.offsetWidth;
            // set target height
            const target = el.scrollHeight;
            el.classList.remove('fade-out');
            el.classList.add('fade-in');
            el.style.height = target + 'px';

            const onShowEnd = function (ev) {
                if (ev.propertyName === 'height') {
                    el.style.height = '';
                    el.classList.remove('fade-in');
                    el.removeEventListener('transitionend', onShowEnd);
                }
            };
            el.addEventListener('transitionend', onShowEnd);
        } else {
            if (isHidden) continue;

            // Hide: animate from scrollHeight -> 0 so siblings slide up
            const startH = el.scrollHeight;
            el.style.height = startH + 'px';
            // force reflow
            void el.offsetWidth;
            // start visual fade
            el.classList.remove('fade-in');
            el.classList.add('fade-out');
            // animate to zero height
            el.style.height = '0px';

            const onHideEnd = function (ev) {
                if (ev.propertyName === 'height') {
                    el.style.display = 'none';
                    el.classList.remove('fade-out');
                    el.classList.add('hidden');
                    el.style.height = '';
                    el.removeEventListener('transitionend', onHideEnd);
                }
            };
            el.addEventListener('transitionend', onHideEnd);
        }
    }
}

function init() {
    initFilterButtons();
    setupPageTracking();
}

// Cookie management functions for tracking last visited page
function setCookie(name, value, days = 30) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(nameEQ) === 0) {
            return cookie.substring(nameEQ.length);
        }
    }
    return null;
}

function setupPageTracking() {
    // Save the current page when leaving (clicking a link or navigating away)
    window.addEventListener('beforeunload', function() {
        const currentPage = window.location.pathname;
        const lastPage = getCookie('lastPage');
        
        // Only update if we're actually navigating to a different page
        if (!lastPage || lastPage !== currentPage) {
            setCookie('lastPage', currentPage);
        }
    });
}

function getLastPage() {
    // Returns the last visited page
    return getCookie('lastPage');
}

function createBackButton(containerId) {
    // Creates a back button that links to the last visited page
    const lastPage = getLastPage();
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error('Container element not found:', containerId);
        return;
    }
    
    if (lastPage) {
        const backButton = document.createElement('a');
        backButton.href = lastPage;
        backButton.textContent = 'Back to Previous Page';
        backButton.className = 'back-button';
        container.appendChild(backButton);
    }
}