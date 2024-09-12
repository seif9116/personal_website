function app() {
    return {
        currentPath: '/',
        baseUrl: '/minima/', // Change this to '/' for local development
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
                path: 'blogs/halting-problem.md'
            },
            {
                title: 'This blog doesn\'t texist',
                date: '2024-09-11',
                url: '/blog/nginx',
                path: 'blogs/nginx.md'
            }
        ],
        projects: [
            // Project data remains the same
        ],
        navigate(path) {
            window.location.hash = path;
            this.currentPath = path;
        },
        init() {
            const updatePath = () => {
                this.currentPath = window.location.hash.slice(1) || '/';
            };
            window.addEventListener('hashchange', updatePath);
            updatePath();

            // Check if we're on GitHub Pages
            if (window.location.hostname === 'justinmeimar.github.io') {
                this.baseUrl = '/minima/';
            } else {
                this.baseUrl = '/';
            }
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
