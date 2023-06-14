let scrapeEmails = document.getElementById('scrapeEmails')
let list = document.getElementById('emailList')

// Handler to receive emails from content scripts
chrome.runtime.onMessage.addListener((request,
    sender, sendResponse) => {

    // Getting emails
    const emails = request.emails || [];

    // Event handler for clicking on an email link
    const handleEmailLinkClick = (event) => {
        event.preventDefault();
        const email = event.target.innerText;
        const mailtoLink = `mailto:${email}`;
        chrome.tabs.create({ url: mailtoLink });
    };

    // Get the <ul> element to display the email links
    const list = document.getElementById('emailList');
    list.innerHTML = ''; // Clear existing content before adding new emails

    if (emails.length === 0) {
        // Display a message if no emails are found

        const li = document.createElement('li');
        li.innerText = 'No emails found';
        list.appendChild(li);
    } else {
        // Create email links and add them to the <ul> element

        emails.forEach((email) => {
            const link = document.createElement('a');
            link.href = `mailto:${email}`;
            link.innerText = email;
            link.addEventListener('click', handleEmailLinkClick);

            const li = document.createElement('li');
            li.appendChild(link);
            list.appendChild(li);
        });
    }
});

// Button (event listener on click)
scrapeEmails.addEventListener("click", async () => {

    // Fetch current active tab
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    // Script to parse emails on the page
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapeEmailsFromPage,
    })
})

// Function that scrapes email

function scrapeEmailsFromPage() {
    // RegEx for emails from html code base
    const emailRegEx = /[\w.\=-]+@[\w.-]+\.[\w]{2,3}/gim;


    // Parses emails from the HTML of the current page 
    let emails = document.body.innerHTML.match(emailRegEx) || []

    const emailLinks = emails.map((email) => {
        const a = document.createElement('a');
        a.href = `mailto:${email}`;
        a.innerText = email;
        return a;
    });

    // Sending emails to popup
    chrome.runtime.sendMessage({ emails })

}