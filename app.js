const getBaseUrl = () => {
  if (window.location.hostname.includes('github.io')) {
    // Ensure there's a trailing slash for GitHub Pages
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

/*
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
*/

function app() {
  const baseUrl = getBaseUrl();
  console.log("Base URL:", baseUrl);
  
  return {
        currentPath: '/',
        baseUrl: baseUrl,
        links: [
            { url: '/', text: 'Home' },
            { url: '/blog', text: 'Blog' },
           // { url: '/projects', text: 'Projects' }
        ],
        personalLinks: [
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
            link: baseUrl + 'static/cv.pdf',
          }
        ],
        blogs: blogs,
        //projects: projects, 
        navigate(path) {
            window.location.hash = path;
            this.currentPath = path;
            console.log("Navigated to:", path);
        },
        init() {
            const updatePath = () => {
                this.currentPath = window.location.hash.slice(1) || '/';
                console.log("Updated path:", this.currentPath);
            };
            window.addEventListener('hashchange', updatePath);
            updatePath();
            console.log("App initialized with baseUrl:", this.baseUrl);
            //this.baseUrl = getBaseUrl();
        },
        getBlogByUrl(url) {
            console.log("Looking for blog with URL:", url);
            console.log("Available blogs:", this.blogs);
            // Try direct match first
            let blog = this.blogs.find(blog => blog.url === url);
            
            // If no match, try removing leading slash
            if (!blog && url.startsWith('/')) {
                blog = this.blogs.find(blog => blog.url === url.substring(1));
            }
            
            // If still no match, try adding leading slash
            if (!blog && !url.startsWith('/')) {
                blog = this.blogs.find(blog => blog.url === '/' + url);
            }
            
            console.log("Found blog:", blog);
            return blog;
        }, 
        async renderBlog(htmlPath) {
          try {
            console.log("Original HTML path:", htmlPath);
            
            // Make sure we're using the correct path based on environment
            let fullPath = htmlPath;
            
            // If it's a relative path from blogs directory, ensure baseUrl is prepended
            if (fullPath.includes('blogs/') && !fullPath.startsWith('http') && !fullPath.startsWith(this.baseUrl)) {
              fullPath = this.baseUrl + fullPath;
            }
            
            console.log("Fetching blog from:", fullPath);
            const response = await fetch(fullPath);
            
            if (!response.ok) {
              console.error(`Failed to fetch blog content: ${response.status} ${response.statusText}`);
              return { content: `<p>Error loading blog content. Status: ${response.status}</p>` };
            }
            
            const content = await response.text();
            
            // Process content to fix relative image paths
            let processedContent = content;
            
            // Fix image paths - handle both direct static/ references and ../static/ references
            if (this.baseUrl !== '/') {
              // Replace src="static/ with the full baseUrl path
              processedContent = processedContent.replace(/src="static\//g, `src="${this.baseUrl}static/`);
              // Also handle src='static/ format
              processedContent = processedContent.replace(/src='static\//g, `src='${this.baseUrl}static/'`);
              
              // Handle ../static/ references (these are used in the blog HTML files)
              processedContent = processedContent.replace(/src="\.\.\/static\//g, `src="${this.baseUrl}static/`);
              processedContent = processedContent.replace(/src='\.\.\/static\//g, `src='${this.baseUrl}static/'`);
            }
            
            // Return content immediately so it's displayed
            setTimeout(() => {
              // Apply syntax highlighting to code blocks
              document.querySelectorAll('pre code').forEach((el) => {
                hljs.highlightElement(el);
              });
              
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
                
            return { content: processedContent };
          } catch (error) {
            console.error('Error loading HTML content:', error);
            return { content: '<p>Error loading blog content. Check console for details.</p>' };
          }
        }
    };
}
