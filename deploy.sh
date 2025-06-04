#!/bin/bash
# Script to debug GitHub Pages deployment issues

# Print current directory
echo "Current directory: $(pwd)"

# Make sure blogs directory exists in GitHub Pages
echo "Creating blogs directory if needed..."
mkdir -p _site/blogs

# Copy HTML files
echo "Copying HTML files..."
cp index.html _site/
cp test.html _site/
cp blogs/training-ml.html _site/blogs/

# Copy JS files
echo "Copying JS files..."
cp app.js _site/

# Copy CSS files
echo "Copying CSS files..."
cp styles.css _site/
cp -r styles/ _site/

# Copy static files
echo "Copying static files..."
cp -r static/ _site/static/

# Create a special diagnostic file
echo "Creating diagnostic file..."
cat > _site/debug.html << EOF
<!DOCTYPE html>
<html>
<head>
  <title>GitHub Pages Debug</title>
</head>
<body>
  <h1>GitHub Pages Debug Information</h1>
  <p>Deployment timestamp: $(date)</p>
  
  <h2>File Structure</h2>
  <pre>
  Blogs directory:
  $(ls -la blogs/)
  
  Static directory:
  $(ls -la static/)
  </pre>
  
  <h2>Test Blog Loading</h2>
  <button onclick="loadBlog()">Load Blog</button>
  <div id="blogResult"></div>
  
  <script>
  async function loadBlog() {
    const result = document.getElementById('blogResult');
    result.innerHTML = 'Attempting to load blog...';
    
    try {
      // Try different paths
      const paths = [
        '/minima/blogs/training-ml.html',
        './blogs/training-ml.html',
        '../blogs/training-ml.html'
      ];
      
      for (const path of paths) {
        result.innerHTML += '<br>Trying path: ' + path;
        try {
          const response = await fetch(path);
          const status = response.status;
          
          if (response.ok) {
            const content = await response.text();
            result.innerHTML += '<br>✅ Success! Content length: ' + content.length;
            result.innerHTML += '<br>Path ' + path + ' works correctly!';
            break;
          } else {
            result.innerHTML += '<br>❌ Failed with status: ' + status;
          }
        } catch (e) {
          result.innerHTML += '<br>❌ Error: ' + e.message;
        }
      }
    } catch (e) {
      result.innerHTML += '<br>General error: ' + e.message;
    }
  }
  </script>
</body>
</html>
EOF

echo "Debug deployment files created!" 