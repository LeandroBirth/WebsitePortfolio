// Function to display the portfolio content
function showPortfolio(type) {
    const content = document.getElementById('content');
    let filePath = '';

    switch (type) {
        case 'ux':
            filePath = 'Portfolio/ux.html';
            break;
        case 'frontend':
            filePath = 'Portfolio/frontend.html';
            break;
        case 'data-analysis':
            filePath = 'Portfolio/data-analysis.html';
            break; 
        case 'backend':
            filePath = 'Portfolio/backend.html';
            break;
        case 'publications':
            filePath = 'Portfolio/publications.html';
            break; 
        default:
            console.error('Unknown portfolio type');
            return;
    }

    // Clear existing content
    content.innerHTML = ''; // Clear existing content

    // Fetch the specified HTML file
    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            console.log('Fetched data:', data);  // Log the fetched content
            content.innerHTML = data; // Insert fetched content into the page
        })
        .catch(error => {
            console.error('Error loading file:', error);  // Log the error for more details
            content.innerHTML = `<p>Sorry, an error occurred while loading the portfolio. Please try again later.</p>`;
        });
}

// Add click event listeners for project boxes
document.querySelectorAll('.portfolio-content__project-box').forEach(box => {
    box.addEventListener('click', function() {
        const projectId = this.id;
        const projectDetailsId = projectId + '-details';
        const projectDetails = document.getElementById(projectDetailsId);

        // Toggle project details visibility
        if (projectDetails) {
            projectDetails.style.display = projectDetails.style.display === 'none' ? 'block' : 'none';
        }
    });
});
