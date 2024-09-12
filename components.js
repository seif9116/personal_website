function app() {
    return {
        currentPath: '/',
        links: [
            { url: '/', text: 'Home' },
            { url: '/blog', text: 'Blog' },
            { url: '/projects', text: 'Projects' }
        ],
        blogs: [
            {
                title: 'Solving the Halting Problem',
                date: '2024-09-11',
                url: '/blog/halting-problem',
                path: '/blogs/halting-problem.md'
            },
            {
                title: 'This blog doesn\'t texist',
                date: '2024-09-11',
                url: '/blog/nginx',
                path: '/blogs/nginx.md'
            }
        ],
        projects: [
            {
                title: 'Toy Regular Expression Engine',
                date: '2024-09-11',
                link: 'https://github.com/JustinMeimar/nfa-regex',
                desc: 'A regular expression engine from scratch in C++ using finite automata'
            },
            {
                title: 'Procedurally Generated Trees',
                date: '2024-09-11',
                link: 'https://justinmeimar.github.io/algo-trees/',
                desc: 'Making trees from recurrence relations in Svelte'
            },
            {
                title: 'Real-AI',
                date: '2024-09-11',
                link: 'https://github.com/JustinMeimar/hack-gpt',
                desc: 'Semantic analysis for real-estate listings with LLMs'
            }
        ],
        navigate(path) {
            window.location.hash = path;
            this.currentPath = path;
        },
        init() {
            const updatePath = () => this.currentPath = window.location.hash.slice(1) || '/';
            window.addEventListener('hashchange', updatePath);
            updatePath();
        },
        getBlogByUrl(url) {
            return this.blogs.find(blog => blog.url === url);
        },
        async renderBlog(markdownPath) {
            try {
                const response = await fetch(markdownPath);
                const content = await response.text();
                return { content: marked.parse(content) };
            } catch (error) {
                console.error('Error loading markdown:', error);
                return { content: '<p>Error loading blog content.</p>' };
            }
        }
    };
}
