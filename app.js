const getBaseUrl = () => {
  if (window.location.hostname === 'justinmeimar.github.io') {
    return '/minima/';
  } else {
    return '/';
  }
};

const blogs = [
  {
    title: 'Training Models That Affect Their Data',
    date: '2025-04-24',
    url: '/blog/training-ml',
    path: 'blogs/training-ml.html'
  },
]; 

const personalLinks = [
  {
    name: 'github',
    link: 'https://github.com/seif9116',
  },
  {
    name: 'email',
    link: 'smetwall@ualberta.ca',
  },
  {
    name: 'linkedin',
    link: 'https://www.linkedin.com/in/seif-metwally/',
  },
  {
    name: 'resume',
    link: getBaseUrl() + 'static/cv.pdf',
  }
];
/*
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
*/

function app() {
  
  return {
        currentPath: '/',
        baseUrl: getBaseUrl(),
        links: [
            { url: '/', text: 'Home' },
            { url: '/blog', text: 'Blog' },
           // { url: '/projects', text: 'Projects' }
        ],
        personalLinks: personalLinks,
        blogs: blogs,
        //projects: projects, 
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
            //this.baseUrl = getBaseUrl();
        },
        getBlogByUrl(url) {
            return this.blogs.find(blog => blog.url === url);
        }, 
        async renderBlog(htmlPath) {
          try {
              const response = await fetch(htmlPath);
              const content = await response.text();
              
              // Return content immediately so it's displayed
              setTimeout(() => {
                  // Apply syntax highlighting to code blocks
                  hljs.highlightAll();
                  
                  // Trigger MathJax to process any LaTeX content
                  if (window.MathJax) {
                      console.log("MathJax found, typesetting...");
                      try {
                          // Use a longer timeout to ensure MathJax has time to initialize
                          MathJax.typesetPromise().then(() => {
                              console.log("MathJax typesetting complete");
                          }).catch(err => {
                              console.error("MathJax typesetting error:", err);
                          });
                      } catch (err) {
                          console.error("MathJax error:", err);
                      }
                  } else {
                      console.error("MathJax not found or not initialized");
                  }
              }, 100); // Increased timeout to give more time for content to be rendered
                  
              return { content: content };
          } catch (error) {
              console.error('Error loading HTML content:', error);
              return { content: '<p>Error loading blog content.</p>' };
          }
      }
    };
}
