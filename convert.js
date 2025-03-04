const fs = require('fs');
const { marked } = require('marked');
const path = require('path');

// Customize the markdown renderer to match our HTML structure
const renderer = new marked.Renderer();

// Custom renderer for lists to maintain the tool-list structure
renderer.list = function(body) {
    return `<ul class="tool-list">${body}</ul>`;
};

// Custom renderer for list items to maintain the tool-name and tool-provider structure
renderer.listitem = function(text) {
    // Extract the tool name and provider from markdown format "**name** - [provider](url)"
    const match = text.match(/\*\*(.*?)\*\* - \[(.*?)\]\((.*?)\)/);
    if (match) {
        const [, name, provider, url] = match;
        return `
                <li><span class="tool-name">${name}</span> - <span class="tool-provider"><a href="${url}" target="_blank">${provider}</a></span></li>`;
    }
    return `<li>${text}</li>`;
};

// Function to convert markdown sections to grid items
function convertSectionsToGridItems(markdown) {
    const sections = markdown.split(/(?=##\s[^#])/);
    return sections
        .map(section => {
            const titleMatch = section.match(/##\s+([^#\n]*)/);
            if (!titleMatch) return null;

            const title = titleMatch[1].trim();
            // Skip non-grid sections
            if (title === 'About' || title === 'What, why?') return null;

            // Remove the title from the content and convert the rest to HTML
            const content = section.replace(/##\s+[^#\n]*\n/, '').trim();
            const contentHtml = marked(content, { renderer });

            return `
        <div class="grid-item">
            <div class="grid-icon">${getIconForSection(title)}</div>
            <h2>${title}</h2>
            ${contentHtml}
        </div>`;
        })
        .filter(Boolean)
        .join('\n');
}

// Function to get icon for section
function getIconForSection(title) {
    const icons = {
        'Product Assortment': '📦',
        'Role Based Access Control': '🔑',
        'Team Management and Single Sign-on': '👥',
        'Reporting and Analytics': '📊',
        'Multi-Factor Authentication (MFA)': '🔐',
        'Feature Management': '⚙️',
        'SLA and Support': '🛟',
        'Product Security': '🛡️',
        'Integrations': '🔌',
        'Documentation': '📚',
        'Contract Life Cycle Management': '📝',
        'SDK Libraries Generators': '⚡',
        'Compliance Certification': '✅'
    };

    return icons[title] || '📋';
}

// Main conversion process
async function convertMdToHtml() {
    try {
        // Read files
        const template = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
        const markdown = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8');

        // Extract title and description
        const titleMatch = markdown.match(/# (.*?)\n/);
        const descriptionMatch = markdown.match(/\n\n([^\n#].*?)\n/);
        
        const title = titleMatch ? titleMatch[1] : 'Enterprise Ready Features';
        const description = descriptionMatch ? descriptionMatch[1] : 'Essential capabilities for B2B SaaS companies to become enterprise-ready';

        // Convert sections to grid items
        const gridItems = convertSectionsToGridItems(markdown);

        // Extract the about/why section
        const whatWhyMatch = markdown.match(/## What, why\?\n\n([\s\S]*?)(?=##|$)/);
        const aboutMatch = markdown.match(/## About\n\n([\s\S]*?)(?=##|$)/);
        
        const infoContent = whatWhyMatch ? whatWhyMatch[1] : aboutMatch ? aboutMatch[1] : '';

        // Update the template
        let updatedHtml = template
            .replace(/<h1 class="title">[^<]*<\/h1>/, `<h1 class="title">${title}</h1>`)
            .replace(/<p class="subtitle">[^<]*<\/p>/, `<p class="subtitle">${description}</p>`);

        // Replace grid container content
        updatedHtml = updatedHtml.replace(
            /(<div class="grid-container">)([\s\S]*?)(<\/div>\s*<section class="info-section">)/,
            `$1${gridItems}$3`
        );

        // Update info section content
        if (infoContent) {
            const infoHtml = marked(infoContent.trim());
            updatedHtml = updatedHtml.replace(
                /(<div class="info-content">[\s\S]*?<h2 class="info-title">[^<]*<\/h2>)([\s\S]*?)(<\/div>[\s\S]*?<\/section>)/,
                `$1${infoHtml}$3`
            );
        }

        // Write the updated HTML
        fs.writeFileSync(path.join(__dirname, 'index.html'), updatedHtml);
        console.log('Successfully converted Markdown to HTML and updated index.html');
    } catch (error) {
        console.error('Error during conversion:', error);
    }
}

// Run the conversion
convertMdToHtml().catch(console.error);