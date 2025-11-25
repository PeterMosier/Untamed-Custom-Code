document.addEventListener("DOMContentLoaded", function () {
  console.log("Script loaded, lity available:", typeof lity === "function");
  
  if (typeof lity !== "function" || !document.body.classList.contains("single-post")) return;

  // Only target the MAIN featured image (not sidebar/recent posts)
  const mainContent = document.querySelector('main, article, .entry-content, .post-content');
  if (!mainContent) {
    console.log("Main content area not found");
    return;
  }

  const featuredImages = mainContent.querySelectorAll(".wp-block-post-featured-image img");
  console.log("Found featured images in main content:", featuredImages.length);

  featuredImages.forEach(function (img) {
    if (img.closest("a[data-lity]")) return;

    const src = img.getAttribute("src");
    const title = img.getAttribute("title") || "";
    const caption = img.getAttribute("data-caption") || "";
    const description = img.getAttribute("data-description") || "";

    console.log("Image metadata:", { title, caption, description });

    const fullCaption = `
      <strong>${title}</strong><br>
      ${caption}<br>
      <em>${description}</em>
    `;

    const link = document.createElement("a");
    link.setAttribute("href", src);
    link.setAttribute("data-lity", "");
    link.style.display = "inline-block";
    link.dataset.caption = fullCaption;

    link.addEventListener("click", function (e) {
      console.log("Link clicked, setting active");
      document.querySelectorAll('[data-lity]').forEach(el => el.classList.remove('lity-active'));
      this.classList.add('lity-active');
      
      // Start watching for Lity content to be ready
      waitForLityContent();
    });

    img.parentNode.insertBefore(link, img);
    link.appendChild(img);
  });
});

// Wait for Lity content to fully load using MutationObserver
function waitForLityContent() {
  console.log("Waiting for Lity content...");
  
  const checkInterval = setInterval(function() {
    const lityContainer = document.querySelector(".lity-content");
    const lityImage = lityContainer ? lityContainer.querySelector("img") : null;
    
    if (lityContainer && lityImage) {
      console.log("Lity content found with image");
      clearInterval(checkInterval);
      
      // Wait for image to load
      if (lityImage.complete) {
        console.log("Image already loaded");
        injectCaption();
      } else {
        lityImage.addEventListener("load", function() {
          console.log("Image loaded event fired");
          injectCaption();
        });
      }
      
      // Also set up observer to watch for any changes that might remove our caption
      observeLityContent(lityContainer);
    }
  }, 50);
  
  // Stop checking after 3 seconds
  setTimeout(function() {
    clearInterval(checkInterval);
  }, 3000);
}

// Observe Lity content for changes and re-inject caption if needed
let observer = null;
function observeLityContent(lityContainer) {
  // Disconnect previous observer if it exists
  if (observer) {
    observer.disconnect();
  }
  
  observer = new MutationObserver(function(mutations) {
    // Check if our caption still exists
    const existingCaption = lityContainer.querySelector(".lity-caption-below");
    if (!existingCaption) {
      console.log("Caption removed by mutation, re-injecting...");
      injectCaption();
    }
  });
  
  observer.observe(lityContainer, {
    childList: true,
    subtree: true
  });
}

// Function to inject the caption
function injectCaption() {
  console.log("injectCaption called");
  
  const activeLink = document.querySelector('[data-lity].lity-active');
  console.log("Active link found:", activeLink);
  
  if (!activeLink) return;

  const captionHTML = activeLink.dataset.caption;
  console.log("Caption HTML:", captionHTML);
  
  if (!captionHTML) return;

  const content = document.querySelector(".lity-content");
  console.log("Lity content element:", content);
  
  if (content) {
    // Remove any old caption first
    const oldCaption = content.querySelector(".lity-caption-below");
    if (oldCaption) {
      console.log("Removing old caption");
      oldCaption.remove();
    }

    const captionDiv = document.createElement("div");
    captionDiv.className = "lity-caption-below";
    captionDiv.innerHTML = captionHTML;
    
    console.log("Appending caption div to content");
    content.appendChild(captionDiv);
    
    console.log("Caption div added successfully");
  }
}

// Also try with the lity:ready event (in case it does fire)
document.addEventListener("lity:ready", function (event, instance) {
  console.log("lity:ready event fired");
  waitForLityContent();
});

// Clean up on close
document.addEventListener("lity:close", function () {
  console.log("lity:close event fired");
  
  // Disconnect observer
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  
  const caption = document.querySelector(".lity-caption-below");
  if (caption) {
    console.log("Removing caption on close");
    caption.remove();
  }
  
  document.querySelectorAll('[data-lity].lity-active').forEach(el => el.classList.remove('lity-active'));
});
