/*  examples.js
    Contains utility functions for use in the example pages.
    (C)2025 Morgan Evans */

// Function to pretty print HTML content
function prettyPrintToDiv(sourceElementId, targetElementId) {
  const sourceElement = document.getElementById(sourceElementId);
  const targetElement = document.getElementById(targetElementId);

  if (!sourceElement || !targetElement) {
    console.error("Source or target element not found");
    return;
  }

  // Get the HTML content
  let htmlContent = sourceElement.innerHTML;

  // Remove prettyPrintToDiv comments and function calls
  htmlContent = htmlContent.replace(/\s*\/\/\s*Pretty print the content[^\n]*\n?/g, '');
  htmlContent = htmlContent.replace(/\s*prettyPrintToDiv\([^)]*\);?\s*/g, '');

  // Pretty print the HTML
  const formattedHtml = formatHtml(htmlContent);

  // Create a pre element for better formatting
  const preElement = document.createElement("pre");
  preElement.style.cssText = `
                        background-color: #f8f9fa;
                        border: 1px solid #e9ecef;
                        border-radius: 4px;
                        padding: 12px;
                        overflow-x: auto;
                        font-family: 'Courier New', Consolas, monospace;
                        font-size: 12px;
                        line-height: 1.4;
                        color: #333;
                        white-space: pre-wrap;
                        word-wrap: break-word;
                        margin: 0px;
                    `;

  preElement.textContent = formattedHtml;

  // Clear target and add formatted content
  targetElement.innerHTML = "";
  targetElement.appendChild(preElement);
}

// Function to format HTML with proper indentation
function formatHtml(html) {
  let formatted = "";
  let indent = 0;
  const indentSize = 2;

  // Remove extra whitespace and split by tags
  html = html.replace(/>\s+</g, "><").trim();

  // Split by tags while preserving them
  const tokens = html.split(/(<[^>]*>)/);

  tokens.forEach((token) => {
    if (token.trim() === "") return;

    if (token.startsWith("</")) {
      // Closing tag - decrease indent before adding
      indent = Math.max(0, indent - indentSize);
      formatted += " ".repeat(indent) + token + "\n";
    } else if (token.startsWith("<")) {
      // Opening tag
      formatted += " ".repeat(indent) + token + "\n";
      // Increase indent for next line unless it's a self-closing tag
      if (!token.endsWith("/>") && !token.includes("</")) {
        // Check if it's not a self-closing HTML tag
        const tagName = token.match(/<(\w+)/)?.[1]?.toLowerCase();
        const selfClosingTags = ["img", "br", "hr", "input", "meta", "link"];
        if (!selfClosingTags.includes(tagName)) {
          indent += indentSize;
        }
      }
    } else {
      // Text content
      if (token.trim()) {
        formatted += " ".repeat(indent) + token.trim() + "\n";
      }
    }
  });

  return formatted.trim();
}
