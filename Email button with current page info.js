document.addEventListener('DOMContentLoaded', function() {
    // 1. Find the button using the class we added
    var buttonLink = document.querySelector('.auto-email-btn .wp-block-button__link');

    if (buttonLink) {
        // 2. Get the current Page Title and URL
        var pageTitle = document.title.split('–')[0].trim(); // Grabs title, removes site name if present
        var pageUrl = window.location.href;

        // 3. Build the Email Pieces
        var emailTo = "protectthebruce@yahoo.ca"; // Bruce's email
        var subject = "Print Inquiry: " + pageTitle;
        var body = "Hi Bruce,\n\nI am interested in ordering a print of this photo:\n" + pageTitle + "\n\n" + pageUrl + "\n\n[Please add your questions or size preference or print type (e.g. digial download or print or canvas stretch etc.) here. ]";

        // 4. Encode them for a URL (turns spaces into %20, etc.)
        var mailtoLink = "mailto:" + emailTo + 
                         "?subject=" + encodeURIComponent(subject) + 
                         "&body=" + encodeURIComponent(body);

        // 5. Inject the new link into the button
        buttonLink.href = mailtoLink;
    }
});

