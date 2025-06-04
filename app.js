const getBaseUrl = () => {
  if (window.location.hostname.includes('github.io')) {
    console.log("GitHub Pages detected, using /personal_website/ base URL");
    return '/personal_website/';
  } else {
    console.log("Local development detected, using / base URL");
    return '/';
  }
};

const blogs = [
  {
    title: 'Training Models That Affect Their Data',
    date: '2025-04-24',
    url: '/blog/training-ml',
    path: 'blogs/training-ml.html',
    githubPath: '/personal_website/blogs/training-ml.html',
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
            console.log("Direct match result:", blog);
            
            // If no match, try removing leading slash
            if (!blog && url.startsWith('/')) {
                const altUrl = url.substring(1);
                console.log("Trying without leading slash:", altUrl);
                blog = this.blogs.find(blog => blog.url === altUrl);
            }
            
            // If still no match, try adding leading slash
            if (!blog && !url.startsWith('/')) {
                const altUrl = '/' + url;
                console.log("Trying with leading slash:", altUrl);
                blog = this.blogs.find(blog => blog.url === altUrl);
            }
            
            console.log("Final blog result:", blog);
            return blog;
        }, 
        async renderBlog(htmlPath) {
          try {
            console.log("Original HTML path:", htmlPath);
            console.log("Base URL:", this.baseUrl);
            
            // For GitHub Pages, skip the complex path resolution and use the working standalone version
            if (window.location.hostname.includes('github.io')) {
              console.log("GitHub Pages detected - using standalone blog approach");
              
              // Just fetch the content from the working standalone blog
              const standaloneUrl = this.baseUrl + 'full-blog.html';
              console.log("Fetching from standalone URL:", standaloneUrl);
              
              const response = await fetch(standaloneUrl);
              if (response.ok) {
                const content = await response.text();
                console.log("Successfully loaded standalone blog content");
                
                // Extract just the article content from the standalone blog
                const parser = new DOMParser();
                const doc = parser.parseFromString(content, 'text/html');
                const article = doc.querySelector('article');
                
                if (article) {
                  // Return just the article content
                  return { content: article.innerHTML, error: false };
                } else {
                  // Fallback to full content
                  return { content: content, error: false };
                }
              } else {
                throw new Error(`Failed to fetch standalone blog: ${response.status}`);
              }
            }
            
            // For local development, try the original approach
            let fullPath = htmlPath;
            if (!fullPath.startsWith('http') && !fullPath.startsWith(this.baseUrl)) {
              fullPath = this.baseUrl + fullPath;
            }
            
            console.log("Fetching blog from:", fullPath);
            const response = await fetch(fullPath);
            
            if (!response.ok) {
              throw new Error(`Failed to fetch blog: ${response.status}`);
            }
            
            const content = await response.text();
            console.log("Successfully loaded blog content locally");
            
            // Process content to fix relative image paths
            let processedContent = content;
            
            // Fix image paths
            if (this.baseUrl !== '/') {
              processedContent = processedContent.replace(/src="static\//g, `src="${this.baseUrl}static/`);
              processedContent = processedContent.replace(/src='static\//g, `src='${this.baseUrl}static/'`);
              processedContent = processedContent.replace(/src="\.\.\/static\//g, `src="${this.baseUrl}static/`);
              processedContent = processedContent.replace(/src='\.\.\/static\//g, `src='${this.baseUrl}static/'`);
            }
            
            // Apply post-processing
            setTimeout(() => {
              document.querySelectorAll('pre code').forEach((el) => {
                hljs.highlightElement(el);
              });
              
              if (window.MathJax) {
                console.log("MathJax found, typesetting...");
                MathJax.typesetPromise().then(() => {
                  console.log("MathJax typesetting complete");
                }).catch(err => {
                  console.error("MathJax typesetting error:", err);
                });
              }
            }, 100);
                
            return { content: processedContent, error: false };
          } catch (error) {
            console.error('Error loading HTML content:', error);
            return { 
              content: `<p>Error loading blog content. Please try <a href="${this.baseUrl}full-blog.html" target="_blank">the standalone version</a>.</p>`, 
              error: true 
            };
          }
        }
    };
}
