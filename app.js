
const blogs = [
  {
    title: 'Solving the Halting Problem',
    date: '2024-09-11',
    url: '/blog/halting-problem',
    path: 'blogs/halting-problem.md'
  },
  {
    title: 'This blog doesn\'t texist',
    date: '2024-09-11',
    url: '/',
    path: 'blogs/nginx.md'
  },
  {
    title: 'A Copy of a Copy of a Copy',
    date: '2024-09-11',
    url: '/blog/copy-of-a-copy',
    path: 'blogs/copy-of-a-copy.md'
  },
  {
    title: 'How I host a fork of Compiler Explorer',
    date: '2024-09-11',
    url: '/blog/nginx-compiler-explorer',
    path: 'blogs/nginx.md'
  }
]; 

const projects = [
  {
    title: 'Algo Trees',
    date: '2024-01-05',
    desc: 'Procedural tree generation from recurrence relations',
    link: 'https://justinmeimar.github.io/algo-trees/',
    photo: '/static/projects/tree.png'
  },
  {
    title: 'Mini Regex Engine',
    date: '2023-03-01',
    desc: 'A mini regex engine built from NFA closure properties',
    link: 'https://github.com/JustinMeimar/nfa-regex',
    photo: '/static/projects/nfa.png'
  }
];

function app() {
  
  return {
        currentPath: '/',
        baseUrl: '/minima/',
        links: [
            { url: '/', text: 'Home' },
            { url: '/blog', text: 'Blog' },
            { url: '/projects', text: 'Projects' }
        ],
        blogs: blogs, 
        projects: projects, 
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
