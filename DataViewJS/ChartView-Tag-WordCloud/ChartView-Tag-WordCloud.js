// --- CONFIGURATION ---
const excludedFolders = ["Templates", "Archive", "Private"];
const minFontSize = 15;
const maxFontSize = 60;
// ---------------------

// 1. Fetch pages and filter out excluded folders
const pages = dv.pages()
    .where(p => !excludedFolders.some(folder => p.file.path.includes(folder)));

// 2. Extract, split and count tags
// Example: #Microsoft/Cloud becomes "Microsoft" and "Cloud"
const tagCounts = {};
pages.forEach(p => {
    if (p.file.tags) {
        p.file.tags.forEach(fullTag => {
            // Remove '#' and split by '/'
            const parts = fullTag.replace(/^#/, "").split("/");
            parts.forEach(part => {
                const cleanPart = part.trim();
                if (cleanPart) {
                    tagCounts[cleanPart] = (tagCounts[cleanPart] || 0) + 1;
                }
            });
        });
    }
});

// 3. Transform data for Charts View
const data = Object.entries(tagCounts).map(([word, count]) => ({
    word: word,
    count: count
}));

// 4. Define the WordCloud configuration
const config = {
    type: 'WordCloud',
    data: data,
    options: {
        wordField: 'word',
        weightField: 'count',
        colorField: 'word',
        wordStyle: {
            fontFamily: 'Verdana',
            fontSize: [minFontSize, maxFontSize],
            rotation: 0,
        },
        random: () => 0.5,
        // Interaction: click to search in Obsidian
        onEvent: (plot) => {
            plot.on('element:click', (ev) => {
                const tag = ev.data.data.word;
                // Search for the tag in Obsidian (including hierarchical matches)
                const query = `tag:#${tag}`;
                app.internalPlugins.getPluginById('global-search').instance.openGlobalSearch(query);
            });
        }
    },
};

// 5. Render the chart
if (window.ChartsView) {
    ChartsView.render(config, this.container);
} else {
    dv.paragraph("⚠️ Charts View plugin is not installed or enabled.");
}
