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
          console.log("Navigating to:", path);
          
          // Special handling for blog posts
          if (path.startsWith('/blog/')) {
            const blog = this.blogs.find(b => b.url === path);
            
            // For GitHub Pages, direct blog navigation may be problematic
            if (window.location.hostname.includes('github.io') && blog) {
              console.log("Direct blog navigation on GitHub Pages, checking alternatives");
              
              // Try using standalone version when on GitHub Pages
              if (blog.url === '/blog/training-ml') {
                console.log("Using standalone blog version");
                window.location.href = this.baseUrl + 'full-blog.html';
                return;
              }
            }
          }
          
          // Standard navigation
          window.location.hash = path;
          this.currentPath = path;
          console.log("Navigation complete to:", path);
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
            let fetchError = false;
            
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
                  this.baseUrl + 'full-blog.html',
                  '/minima/blogs/training-ml.html',
                  '/minima/training-ml.html',
                  '/minima/full-blog.html',
                  './blogs/training-ml.html',
                  './training-ml.html',
                  './full-blog.html'
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
              fetchError = true;
            }
            
            // If all fetch attempts failed or returned non-OK status
            if (fetchError || !response || !response.ok) {
              console.error(`Failed to fetch blog content: ${response ? response.status : 'No response'}`);
              console.error("Failed URL:", fullPath);
              
              // Check if we're on the index page and attempting to load a blog post
              if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/minima/')) {
                // Return an error status to allow the parent to handle the redirect
                return { 
                  content: '<p>Error loading blog content. Redirecting to standalone version...</p>', 
                  error: true 
                };
              }
              
              return { 
                content: `<p>Error loading blog content. Please try one of these alternatives:</p>
                         <ul>
                           <li><a href="${this.baseUrl}full-blog.html">Standalone blog post</a></li>
                           <li><a href="${this.baseUrl}blogs.html">Blog index</a></li>
                           <li><a href="${this.baseUrl}training-ml.html">Direct blog access</a></li>
                         </ul>`, 
                error: true 
              };
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
                
            return { content: processedContent, error: false };
          } catch (error) {
            console.error('Error loading HTML content:', error);
            console.error('Stack trace:', error.stack);
            return { 
              content: `<p>Error loading blog content. Please try <a href="${this.baseUrl}full-blog.html">the standalone version</a>.</p>`, 
              error: true 
            };
          }
        }
    };
}
