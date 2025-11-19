class FollowNavBar extends HTMLElement {
    static #instance = 0;

    static {
        // Get the directory of the current script
        const scriptUrl = import.meta.url;
        const scriptDir = scriptUrl.substring(0, scriptUrl.lastIndexOf('/'));
        const cssPath = `${scriptDir}/follow-navbar.css`;
        
        // Check if follow-navbar.css is already linked
        const existingLink = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
            .find(link => link.href.endsWith('follow-navbar.css'));
        
        if (!existingLink) {
            // Create and insert the CSS link
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssPath;
            document.head.appendChild(link);
        }
    }

    constructor() {
        super();
    }

    connectedCallback() {
        // Create the nav bar container
        const navBar = document.createElement('nav');
        // Assign a unique ID to the nav bar
        navBar.id = `follow-navbar-${FollowNavBar.#instance++}`;

        // If this FollowNavBar has an attribute called 'base-follow-colour', use it to set a CSS variable.
        const baseFollowColour = this.getAttribute('base-follow-colour');
        if (baseFollowColour) {
            navBar.style.setProperty('--base-follow-colour', baseFollowColour);
        }

        // If the FollowNavBar has an attribute called 'font-size', use it to set a CSS variable.
        const fontSize = this.getAttribute('font-size');
        if (fontSize) {
            navBar.style.setProperty('--base-font-size', fontSize);
        }

        // If the FollowNavBar has an attribute called 'follow-height', use it to set a CSS variable.
        const followHeight = this.getAttribute('follow-height');
        if (followHeight) {
            navBar.style.setProperty('--follow-height', followHeight);
        }

        // If the FollowNavBar has an attribute called 'follow-speed', use it to set a CSS variable.
        const followSpeed = this.getAttribute('follow-speed');
        if (followSpeed) {
            navBar.style.setProperty('--follow-speed', followSpeed);
        }

        const navBarList = document.createElement('ul');
        navBar.appendChild(navBarList);
        // Get all child elements within this component
        const children = Array.from(this.children);

        // Get the computed default color from CSS if not set via attribute
        const defaultColor = baseFollowColour || 'steelblue';

        let childFollowColours = [];
        // Iterate over each child and wrap it in a list item before appending to the nav bar
        children.forEach(child => {
            const listItem = document.createElement('li');
            listItem.appendChild(child);
            navBarList.appendChild(listItem);

            // Check if the child has a 'follow-colour' attribute, if it does, store it in the childFollowColours array.
            const followColour = child.getAttribute('follow-colour');
            if (followColour) {
                childFollowColours.push(followColour);
            } else {
                // If no follow-colour attribute is found, use the base follow colour from the nav bar (if set), or the CSS default.
                childFollowColours.push(defaultColor);
            }
        });

        // If there are any child follow colours, we want to set them as &:has(li:nth-child(1):hover)::after CSS rules to the nav bar element.
        if (childFollowColours.length > 0) {
            const styleElement = document.createElement('style');
            let cssRules = '';
            childFollowColours.forEach((colour, index) => {
                cssRules += `
                    nav#${navBar.id}:has(li:nth-child(${index + 1}):hover)::after {
                        background: ${colour};
                    }
                `;
            });
            styleElement.textContent = cssRules;
            this.appendChild(styleElement);
        }

        this.appendChild(navBar);
    }
}

customElements.define('follow-navbar', FollowNavBar);

export { FollowNavBar };