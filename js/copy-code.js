document.querySelectorAll('.copy-button').forEach(button => {
    button.addEventListener('click', function () {
        const targetId = this.getAttribute('data-clipboard-target');
        const codeElement = document.querySelector(targetId);
        const text = codeElement.textContent;

        navigator.clipboard.writeText(text).then(() => {
            // Change icon to check mark temporarily
            const icon = this.querySelector('i');
            icon.classList.remove('fa-copy');
            icon.classList.add('fa-check');

            // Revert back to copy icon after 2 seconds
            setTimeout(() => {
                icon.classList.remove('fa-check');
                icon.classList.add('fa-copy');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text:', err);
        });
    });
});