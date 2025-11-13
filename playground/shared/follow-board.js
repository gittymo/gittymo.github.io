class FollowBoard extends HTMLElement {
    static {
        // Get the directory of the current script
        const scriptUrl = import.meta.url;
        const scriptDir = scriptUrl.substring(0, scriptUrl.lastIndexOf('/'));
        const cssPath = `${scriptDir}/follow-board.css`;
        
        // Check if follow-board.css is already linked
        const existingLink = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
            .find(link => link.href.endsWith('follow-board.css'));
        
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
        const squares = parseInt(this.getAttribute('squares')) || 8;
        if (isNaN(squares) || squares < 2) {
            throw Error("Squares must be a number of value 2 or greater.");
        }
        const animspeed = parseInt(this.getAttribute('speed')) || 300;
        if (isNaN(squares) || animspeed < 0) {
            throw Error("Speed must be a number greater than or equal to zero (0).");
        }
        
        const baseDiv = document.createElement('div');
        
        // Calculate cell size based on the follow-board width
        // Use clientWidth or offsetWidth for more reliable dimensions
        const boardWidth = this.offsetWidth || this.clientWidth || parseInt(getComputedStyle(this).width) || 800;
        const cellSize = boardWidth / squares;
        baseDiv.style.setProperty('--cell-size', cellSize + 'px');
        baseDiv.style.setProperty('--anim-speed', animspeed + 'ms');
        
        // Generate random colors for each cell position up to squares count
        const randomDarkColor = () => {
            const r = Math.floor(Math.random() * 64);
            const g = Math.floor(Math.random() * 64);
            const b = Math.floor(Math.random() * 64);
            return { r, g, b };
        };

        const lightenColor = (color, factor = 1.8) => {
            return {
                r: Math.min(255, Math.floor(color.r * factor)),
                g: Math.min(255, Math.floor(color.g * factor)),
                b: Math.min(255, Math.floor(color.b * factor))
            };
        };
        
        // Create a style element for color rules
        const styleEl = document.createElement('style');
        let colorRules = '';
        
        for (let i = 1; i <= squares; i++) {
            const darkColor = randomDarkColor();
            const lightColor = lightenColor(darkColor);
            const darkColorStr = `rgb(${darkColor.r}, ${darkColor.g}, ${darkColor.b})`;
            const lightColorStr = `rgb(${lightColor.r}, ${lightColor.g}, ${lightColor.b})`;
            
            colorRules += `
                follow-board > div > span:nth-child(${(squares + 1)}n+${i}) {
                    background-color: ${darkColorStr};
                }
                follow-board > div:has(span:nth-child(${(squares + 1)}n+${i}):hover)::after {
                    background-color: ${lightColorStr};
                }
            `;
        }
        
        styleEl.textContent = colorRules;
        document.head.appendChild(styleEl);
        
        // Add image if specified
        const imageUrl = this.getAttribute('image');
        if (imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = 'Follow board background';
            baseDiv.appendChild(img);
        }
        
        for (var y = 0; y < squares; y++) {
            for (var x = 0; x < squares; x++) {
                const span = document.createElement('span');
                baseDiv.appendChild(span);
            }
        }

        // Track last hovered span
        let lastHoveredSpan = null;
        const spans = baseDiv.querySelectorAll('span');
        
        spans.forEach(span => {
            span.addEventListener('mouseenter', () => {
                if (lastHoveredSpan) {
                    lastHoveredSpan.classList.remove('last-hovered');
                }
                lastHoveredSpan = span;
            });
        });

        baseDiv.addEventListener('mouseleave', () => {
            if (lastHoveredSpan) {
                lastHoveredSpan.classList.add('last-hovered');
            }
        });

        baseDiv.addEventListener('mouseenter', () => {
            if (lastHoveredSpan) {
                lastHoveredSpan.classList.remove('last-hovered');
            }
        });

        baseDiv.style.gridTemplateColumns = "repeat(" + squares + ", 1fr)";
        baseDiv.style.gridTemplateRows = "repeat(" + squares + ", 1fr)";
        this.appendChild(baseDiv);
    }
}

customElements.define("follow-board", FollowBoard);

export { FollowBoard };