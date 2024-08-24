
/// Render the markdown file at given path into content element
const render = async (mdFilePath) => {
    try {
        // Fetch the file locally
        const res = await fetch(mdFilePath);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        // Read, sanatize and set the markdown
        const text = await res.text();
        const sanitizedHtmlContent = DOMPurify.sanitize(marked.parse(text));
        const contentElement = document.getElementById('content');
        
        if (!contentElement) {
            throw new Error("Unable to find content element.");
        }
     
        // Set the markdown
        contentElement.innerHTML = sanitizedHtmlContent;

    } catch (error) {
        console.error("Error rendering markdown:", error);
        const contentElement = document.getElementById('content');
        if (contentElement) {
            contentElement.textContent = 'Error loading content.';
        }
    }
}
