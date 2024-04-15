<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script>
(function() {
    var $ = window.jQuery;

    function getModelFromQuery() {
        var urlParams = new URLSearchParams(window.location.search);
        var models = urlParams.getAll('model');
        var model = models.length > 0 ? models[models.length - 1] : null;
        if (model) {
            var make = 'Chevrolet';
            console.log("Determined make:", make, "| Latest extracted model:", model);
            return { make: make, model: model };
        }
        return null;
    }

    function clearBannerContainer() {
        var bannerContainer = document.getElementById('banner-container');
        while (bannerContainer && bannerContainer.firstChild) {
            bannerContainer.removeChild(bannerContainer.firstChild);
        }
    }

    function updateModelDisplay() {
        clearBannerContainer();
        var brandModel = getModelFromQuery();
        if (brandModel) {
            console.log("Updating banner for:", brandModel.model);
            checkExpirationAndProceed(brandModel);
        } else {
            console.log("Make and model could not be determined from URL.");
        }
    }

    function checkExpirationAndProceed(brandModel) {
        var sheetName = encodeURIComponent('Garber Chevrolet Midland - Midland, MI');
        var apiURL = 'https://sheetdb.io/api/v1/pom19rkndxfuq/search?sheet=' + sheetName + '&Make=' + encodeURIComponent(brandModel.make) + '&Model=' + encodeURIComponent(brandModel.model);
        fetch(apiURL)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                if (data.length > 0 && data[0].hasOwnProperty('Expired') && data[0].Expired === 'Active' && data[0].hasOwnProperty('Status') && data[0].Status === 'Enabled') {
                    setModelBanner(brandModel, data[0]);
                    fetchDisclaimer(data[0]); // Fetch and display the disclaimer
                } else {
                    console.log("Banner and disclaimer not shown due to inactive status or expiration.");
                }
            })
            .catch(function(error) {
                console.error('Error checking expiration:', error);
            });
    }

    function setModelBanner(brandModel, apiData) {
        var bannerContainer = document.getElementById('banner-container');
        if (!bannerContainer) {
            console.log("Banner container not found.");
            return;
        }

        var baseImageUrl = 'https://assets.garberauto.com/specials/garber-chevrolet-midland-midland-mi';
        var modelFormatted = brandModel.model.replace(/\s+/g, '-').toLowerCase();
        var makeFormatted = brandModel.make.toLowerCase();

        var bannerDetails = {
            desktop: baseImageUrl + '/model-overview/desktop/new-' + makeFormatted + '-' + modelFormatted + '-garber-chevrolet-midland.png',
            mobile: baseImageUrl + '/model-overview/mobile/new-' + makeFormatted + '-' + modelFormatted + '-garber-chevrolet-midland.png',
            backgroundImage: baseImageUrl + '/background/new-' + makeFormatted + '-' + modelFormatted + '-garber-chevrolet-midland.jpg'
        };

        bannerContainer.innerHTML = '<img class="banner-image" src="' + bannerDetails.desktop + '" alt="New ' + brandModel.model + ' Banner" style="width: 100%; height: auto; display: block;">' +
                                    '<img class="mobile-banner-image" src="' + bannerDetails.mobile + '" alt="New ' + brandModel.model + ' Mobile Banner" style="width: 100%; height: auto; display: none;">';

        bannerContainer.style.backgroundImage = 'url("' + bannerDetails.backgroundImage + '")';
        bannerContainer.style.backgroundRepeat = 'no-repeat';
        bannerContainer.style.backgroundSize = 'cover';
        bannerContainer.style.backgroundPosition = 'center';
        bannerContainer.style.padding = '15px';
        bannerContainer.style.marginBottom = '20px';

        var mediaQuery = window.matchMedia('(max-width: 768px)');
        function handleBannerDisplay(e) {
            document.querySelector('.banner-image').style.display = e.matches ? 'none' : 'block';
            document.querySelector('.mobile-banner-image').style.display = e.matches ? 'block' : 'none';
        }
        handleBannerDisplay(mediaQuery);
        mediaQuery.addListener(handleBannerDisplay);

        var targetElement = document.querySelector('.page-section[data-name="srp-wrapper-listing-inner-inventory-results"]');
        if (targetElement && targetElement.parentNode.firstChild !== bannerContainer) {
            targetElement.parentNode.insertBefore(bannerContainer, targetElement);
        }

        attachClickEventToBanner(bannerContainer, mediaQuery.matches, apiData);
    }

    function fetchDisclaimer(apiData) {
        var disclaimerSpan = document.getElementById('bannerDisclaimer');
        if (disclaimerSpan && apiData.Disclaimer) {
            disclaimerSpan.textContent = apiData.Disclaimer;
            disclaimerSpan.style.display = 'block'; // Ensure it is visible
        }
    }

    function attachClickEventToBanner(banner, isMobile, apiData) {
        var formData = {
            "Make": apiData.Make,
            "Model": apiData.Model,
            "Offer-A": apiData["Offer-A"],
            "Offer-B": apiData["Offer-B"],
            "Offer-C": apiData["Offer-C"],
            "Disclaimer": apiData.Disclaimer
        };

        $(banner).css('cursor', 'pointer').on('click', function(event) {
            event.preventDefault();
            showCustomForm(formData);
        });
    }

    function showCustomForm(formData) {
        Swal.fire({
            title: 'Get Your Offer',
            html: generateFormHTML(formData),
            confirmButtonText: 'Submit',
            focusConfirm: false,
            preConfirm: function() {
                return preFormSubmit();
            }
        }).then(function(result) {
            if (result.isConfirmed) {
                submitFormData(result.value, formData);
            }
        });
    }

    function generateFormHTML(formData) {
        var formHTML = '<form id="getYourOfferForm">' +
            '<div class="form-group">' +
                '<label for="nameInput" class="form-label">Name</label>' +
                '<input type="text" class="form-control" id="nameInput" name="name" required>' +
            '</div>' +
            '<div class="form-group">' +
                '<label for="emailInput" class="form-label">Email</label>' +
                '<input type="email" class="form-control" id="emailInput" name="email" required>' +
            '</div>' +
            '<div class="form-group">' +
                '<label for="phoneInput" class="form-label">Phone Number</label>' +
                '<input type="tel" class="form-control" id="phoneInput" name="phone" required>' +
            '</div>' +
            '<div class="form-group">' +
                '<label for="messageInput" class="form-label">Message (Optional)</label>' +
                '<textarea class="form-control" id="messageInput" name="message"></textarea>' +
            '</div>';

        for (var key in formData) {
            if (formData.hasOwnProperty(key)) {
                formHTML += '<input type="hidden" name="' + key + '" value="' + formData[key] + '">';
            }
        }

        formHTML += '</form>';
        return formHTML;
    }

    function preFormSubmit() {
        var name = Swal.getPopup().querySelector('#nameInput').value;
        var email = Swal.getPopup().querySelector('#emailInput').value;
        var phone = Swal.getPopup().querySelector('#phoneInput').value;
        var message = Swal.getPopup().querySelector('#messageInput').value;

        if (!name || !email || !phone) {
            Swal.showValidationMessage('Please fill in all the required fields');
            return false;
        }

        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Swal.showValidationMessage('Please enter a valid email address');
            return false;    }

    return { name: name, email: email, phone: phone, message: message };
}

function submitFormData(customerData, formData) {
    var fullData = $.extend({}, customerData, formData);

    fetch('https://hook.us1.make.com/8kro3j3a3dmmu4axgwh6q3oe9n8gi1ig', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullData)
    })
    .then(handleResponse)
    .catch(handleError);
}

function handleResponse(response) {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.text().then(function(text) {
        if (text === 'Accepted') {
            Swal.fire('Thank You!', 'Your information has been submitted.', 'success');
        } else {
            throw new Error('Submission was not accepted');
        }
    });
}

function handleError(error) {
    console.error('Submission failed', error);
    Swal.fire('Oops...', 'Something went wrong with your submission.', 'error');
}

function observeBannerContainer() {
    var bannerContainer = document.getElementById('banner-container');
    if (!bannerContainer) {
        console.error('Banner container not found. Ensure the container exists in the DOM.');
        return;
    }

    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1 && node.classList.contains('banner-image')) {
                    // Attach click event for desktop banner
                    attachClickEventToBanner(node, false, {});
                } else if (node.nodeType === 1 && node.classList.contains('mobile-banner-image')) {
                    // Attach click event for mobile banner
                    attachClickEventToBanner(node, true, {});
                }
            });
        });
    });

    observer.observe(bannerContainer, { childList: true, subtree: true });
}

$(document).ready(function() {
    updateModelDisplay();
    observeBannerContainer();

    // Improved URL change detection for SPAs
    var currentPath = window.location.pathname + window.location.search;
    setInterval(function() {
        var newPath = window.location.pathname + window.location.search;
        if (newPath !== currentPath) {
            currentPath = newPath;
            updateModelDisplay();
        }
    }, 500); // Check every 500ms for URL changes
});
})();
</script>