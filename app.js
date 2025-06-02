const getBaseUrl = () => {
  if (window.location.hostname.includes('github.io')) {
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
              // Make sure the path is properly handled with baseUrl
              let path = htmlPath;
              // If it's not an absolute URL and doesn't already have the baseUrl, add it
              if (!path.startsWith('http') && !path.startsWith(this.baseUrl) && path.includes('blogs/')) {
                  // Strip any leading / from the baseUrl if it exists
                  path = this.baseUrl + path;
              }
              
              console.log("Fetching blog from:", path);
              const response = await fetch(path);
              const content = await response.text();
              
              // Process content to fix relative image paths
              let processedContent = content;
              // Fix image src paths that might be relative
              if (this.baseUrl !== '/') {
                  processedContent = content.replace(/src="static\//g, `src="${this.baseUrl}static/`);
              }
              
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
                  
              return { content: processedContent };
          } catch (error) {
              console.error('Error loading HTML content:', error);
              return { content: '<p>Error loading blog content.</p>' };
          }
      }
    };
}
