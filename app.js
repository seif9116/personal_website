const getBaseUrl = () => {
  if (window.location.hostname === 'justinmeimar.github.io') {
    return '/minima/';
  } else {
    return '/';
  }
};

const blogs = [
  {
    title: 'Solving the Halting Problem',
    date: '2024-09-11',
    url: '/blog/halting-problem',
    path: 'blogs/halting-problem.md'
  }
  /**
  ,
  {
    title: 'A Copy of a Copy of a Copy',
    date: '2024-09-11',
    url: '/blog/copy-of-a-copy',
    path: 'blogs/copy-of-a-copy.md'
  }
  {
    title: 'This blog doesn\'t texist',
    date: '2024-09-11',
    url: '/',
    path: 'blogs/nginx.md'
  },
  ,
  {
    title: 'How I host a fork of Compiler Explorer',
    date: '2024-09-11',
    url: '/blog/nginx-compiler-explorer',
    path: 'blogs/nginx.md'
  }
  */
]; 

const personalLinks = [
  {
    name: 'github',
    link: 'https://github.com/JustinMeimar',
  },
  {
    name: 'email',
    link: 'meimar@ualberta.ca',
  },
  {
    name: 'linkedin',
    link: 'https://www.linkedin.com/in/justin-meimar-dev/',
  },
  {
    name: 'resume',
    link: getBaseUrl() + 'static/resume.pdf',
  }
];

const projects = [
  {
    title: 'Dragon-Runner',
    date: '2024-09-20',
    desc: 'V2 of a custom toolchain and test runner for my universitys compiler class',
    link: 'https://github.com/JustinMeimar/Dragon-Runner',
    photo: getBaseUrl() + 'static/projects/dragon.png'
  },
  {
    title: '415 Compiler-Explorer',
    date: '2024-08-01',
    desc: 'A fork of compiler-explorer for 415 assignments',
    link: 'https://www.cmput415compilerexplorer.com/',
    photo: getBaseUrl() + 'static/projects/ce.png'
  },
  {
    title: 'Algo Trees',
    date: '2024-01-05',
    desc: 'Procedural tree generation from recurrence relations',
    link: 'https://justinmeimar.github.io/algo-trees/',
    photo: getBaseUrl() + 'static/projects/tree.png'
  },
  {
    title: 'Mini Regex Engine',
    date: '2023-03-01',
    desc: 'A mini regex engine built from NFA closure properties',
    link: 'https://github.com/JustinMeimar/nfa-regex',
    photo: getBaseUrl() + 'static/projects/nfa.png'
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
        personalLinks: personalLinks,
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
            this.baseUrl = getBaseUrl();
        },
        getBlogByUrl(url) {
            return this.blogs.find(blog => blog.url === url);
        }, 
        async renderBlog(markdownPath) {
          try {
              const response = await fetch(markdownPath);
              const content = await response.text();
              
              // Configure marked options
              marked.setOptions({
                  highlight: function(code, lang) {
                      if (lang && hljs.getLanguage(lang)) {
                          return hljs.highlight(code, {language: lang}).value;
                      } else {
                          return hljs.highlightAuto(code).value;
                      }
                  },
                  langPrefix: 'hljs language-',
                  breaks: true,
                  gfm: true
              });
              setTimeout(() => hljs.highlightAll(), 0);
                  
              return { content: marked.parse(content) };
          } catch (error) {
              console.error('Error loading markdown:', error);
              return { content: '<p>Error loading blog content.</p>' };
          }
      }
    };
}
