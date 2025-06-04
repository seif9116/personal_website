const getBaseUrl = () => {
  if (window.location.hostname.includes('github.io')) {
    // Use your GitHub username instead of JustinMeimar
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
    path: 'blogs/training-ml.html',
    githubPath: '/minima/blogs/training-ml.html',
    rootPath: 'training-ml.html' // Alternative path directly in root
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
            console.log("Base URL:", this.baseUrl);
            
            // Make sure we're using the correct path based on environment
            let fullPath = htmlPath;
            
            // For GitHub Pages, try multiple path options
            const blog = this.blogs.find(b => b.path === htmlPath);
            if (window.location.hostname.includes('github.io')) {
              if (blog) {
                // First try the root path option
                if (blog.rootPath) {
                  fullPath = this.baseUrl + blog.rootPath;
                  console.log("Trying root path:", fullPath);
                } else if (blog.githubPath) {
                  fullPath = blog.githubPath;
                  console.log("Using direct GitHub path:", fullPath);
                }
              } else if (!fullPath.startsWith('http') && !fullPath.startsWith(this.baseUrl)) {
                fullPath = this.baseUrl + fullPath;
              }
            } else if (!fullPath.startsWith('http') && !fullPath.startsWith(this.baseUrl)) {
              fullPath = this.baseUrl + fullPath;
            }
            
            console.log("Fetching blog from:", fullPath);
            console.log("Current host:", window.location.hostname);
            console.log("Current path:", window.location.pathname);
            
            // Try fetch with different approaches if on GitHub Pages
            let response;
            try {
              // Try the constructed path first
              response = await fetch(fullPath);
              
              // If that fails and we're on GitHub Pages, try alternate paths
              if (!response.ok && window.location.hostname.includes('github.io')) {
                console.log("First fetch failed, trying alternate paths");
                
                // Try a series of paths that might work
                const pathsToTry = [
                  this.baseUrl + 'blogs/training-ml.html',
                  this.baseUrl + 'training-ml.html',
                  '/minima/blogs/training-ml.html',
                  '/minima/training-ml.html',
                  './blogs/training-ml.html',
                  './training-ml.html'
                ];
                
                for (const path of pathsToTry) {
                  console.log("Trying path:", path);
                  try {
                    const altResponse = await fetch(path);
                    if (altResponse.ok) {
                      console.log("Found working path:", path);
                      response = altResponse;
                      break;
                    }
                  } catch (err) {
                    console.error("Error fetching alternate path:", path, err);
                  }
                }
              }
            } catch (e) {
              console.error("Fetch attempt failed:", e);
              return { content: `<p>Error loading blog content. Check console for details.</p>` };
            }
            
            if (!response.ok) {
              console.error(`Failed to fetch blog content: ${response.status} ${response.statusText}`);
              console.error("Failed URL:", fullPath);
              return { content: `<p>Error loading blog content. Status: ${response.status}. Check console for details.</p>` };
            }
            
            const content = await response.text();
            console.log("Successfully loaded blog content of length:", content.length);
            
            // Process content to fix relative image paths
            let processedContent = content;
            
            // Fix image paths - handle both direct static/ references and ../static/ references
            if (this.baseUrl !== '/') {
              console.log("Fixing image paths for GitHub Pages");
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
            console.error('Stack trace:', error.stack);
            return { content: '<p>Error loading blog content. Check console for details.</p>' };
          }
        }
    };
}
