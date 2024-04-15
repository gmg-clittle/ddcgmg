<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script>
var storedBannerData = {}; // Object to store banner data

document.addEventListener('DOMContentLoaded', function() {
    initialDataFetch();
    relocateBanner();
    attachClickEventToBanners('.banner-image.hidden-xs img', false); // for desktop banners
    attachClickEventToBanners('.banner-image.visible-xs img', true); // for mobile banners
});

function initialDataFetch() {
    var banners = document.querySelectorAll('.banner-image img'); // Assuming images are inside .banner-image containers
    var i;
    for (i = 0; i < banners.length; i++) {
        (function(banner) {
            var makeModel = extractMakeModelFromBanner(banner);
            if (makeModel && !storedBannerData[makeModel.make + '-' + makeModel.model]) {
                fetchBannerData(makeModel.make, makeModel.model, function(data) {
                    storedBannerData[makeModel.make + '-' + makeModel.model] = data;
                });
            }
        })(banners[i]);
    }
}

function extractMakeModelFromBanner(banner) {
    var src = banner.src;
    // Regex captures "chevrolet" as make and the model name which may include additional hyphenated parts (like "silverado-1500")
    var pattern = /new-(chevrolet)-((?:\w+-)*\w+)(?:-garber)/i;
    var match = src.match(pattern);
    if (match) {
        var make = decodeURIComponent(match[1]);
        var model = decodeURIComponent(match[2]);

        // Normalize make
        make = make.charAt(0).toUpperCase() + make.slice(1).toLowerCase();
        // Replace dashes with spaces in the model
        model = model.replace(/-/g, ' ').trim();

        return { make: make, model: model };
    }
    return null;
}


function fetchBannerData(make, model, callback) {
    var sheetName = encodeURIComponent('Garber Chevrolet Saginaw - Saginaw, MI');
    var apiURL = 'https://sheetdb.io/api/v1/pom19rkndxfuq/search?sheet=' + sheetName + '&Make=' + encodeURIComponent(make) + '&Model=' + encodeURIComponent(model);
    fetch(apiURL)
        .then(function(response) { return response.json(); })
        .then(function(data) { 
            callback(data); 
        })
        .catch(function(error) { 
            console.error('Error fetching banner data:', error); 
        });
}

  
function attachClickEventToBanners(selector, isMobile) {
    var banners = document.querySelectorAll(selector);
    for (var i = 0; i < banners.length; i++) {
        (function(banner) {
            banner.style.cursor = 'pointer';

            banner.onclick = function(event) {
                event.preventDefault();
                var makeModel = extractMakeModelFromBanner(banner);
                if (makeModel) {
                    var key = makeModel.make + '-' + makeModel.model;
                    console.log("Click Event - Key:", key); // Debug log
                    console.log("Stored Data Available:", storedBannerData[key]); // Debug log
                    if (storedBannerData[key] && storedBannerData[key].length > 0) {
                        showCustomForm(storedBannerData[key][0]); // Ensure data is available
                    } else {
                        console.error("No data available for this model.");
                    }
                }
            };
        })(banners[i]);
    }
}



function showCustomForm(data) {
    var formData = {
        Make: data.Make,
        Model: data.Model,
        "Offer-A": data["Offer-A"],
        "Offer-B": data["Offer-B"],
        "Offer-C": data["Offer-C"]
    };
    var formHTML = generateFormHTML(formData);

    Swal.fire({
        title: 'Get Your Offer',
        html: formHTML,
        confirmButtonText: 'Submit',
        focusConfirm: false,
        preConfirm: function() {
            return preFormSubmit();
        }
    }).then(function(result) {
        if (result.isConfirmed) {
            submitFormData(preFormSubmit(), formData);
        }
    });
}

function generateFormHTML(formData) {
    var formHTML = '<form id="getYourOfferForm">' +
        '<div class="form-group">' +
            '<label for="nameInput" class="control-label col-sm-4">Name</label>' +
            '<div class="col-sm-8">' +
                '<input type="text" class="form-control" id="nameInput" name="name" required>' +
            '</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label for="emailInput" class="control-label col-sm-4">Email</label>' +
            '<div class="col-sm-8">' +
                '<input type="email" class="form-control" id="emailInput" name="email" required>' +
            '</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label for="phoneInput" class="control-label col-sm-4">Phone Number</label>' +
            '<div class="col-sm-8">' +
                '<input type="tel" class="form-control" id="phoneInput" name="phone" required>' +
            '</div>' +
        '</div>' +
        '<div class="form-group">' +
            '<label for="messageInput" class="control-label col-sm-4">Message (Optional)</label>' +
            '<div class="col-sm-8">' +
                '<textarea class="form-control" id="messageInput" name="message"></textarea>' +
            '</div>' +
        '</div>';

    for (var key in formData) {
        if (formData.hasOwnProperty(key)) {
            formHTML += '<input type="hidden" name="' + key + '" value="' + formData[key] + '">';
        }
    }

    formHTML += '</form>';
    return formHTML;
}

function showCustomForm(data) {
    var formData = {
        Make: data.Make,
        Model: data.Model,
        "Offer-A": data["Offer-A"],
        "Offer-B": data["Offer-B"],
        "Offer-C": data["Offer-C"]
    };
    var formHTML = generateFormHTML(formData);

    Swal.fire({
        title: 'Get Your Offer',
        html: formHTML,
        confirmButtonText: 'Submit',
        focusConfirm: false,
        preConfirm: function() {
            return preFormSubmit();
        }
    }).then(function(result) {
        if (result.isConfirmed) {
            submitFormData(preFormSubmit(), formData);
        }
    });
}

function preFormSubmit() {
    var name = document.getElementById('nameInput').value;
    var email = document.getElementById('emailInput').value;
    var phone = document.getElementById('phoneInput').value;
    var message = document.getElementById('messageInput').value;

    if (!name || !email || !phone) {
        Swal.showValidationMessage('Please fill in all the required fields');
        return false;
    }

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        Swal.showValidationMessage('Please enter a valid email address');
        return false;
    }

    return { name: name, email: email, phone: phone, message: message };
}

function submitFormData(customerData, formData) {
    var fullData = Object.assign({}, customerData, formData);

    fetch('https://hook.us1.make.com/8kro3j3a3dmmu4axgwh6q3oe9n8gi1ig', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullData)
    })
    .then(handleResponse)
    .catch(handleError);
}

function handleResponse(response) {
    if (!response.ok) throw new Error('Network response was not ok');
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

function attachClickEventToBanner(banner, isMobile) {
    var makeModel = extractMakeModelFromBanner(banner);
    if (!makeModel) return;

    banner.style.cursor = 'pointer';
    banner.onclick = function(event) {
        event.preventDefault();
        fetchBannerData(makeModel.make, makeModel.model, function(data) {
            showCustomForm(data);
        });
    };
}

function relocateBanner() {
    var hiddenXsBanner = document.querySelector('.banner-image.hidden-xs img');
    var visibleXsBanner = document.querySelector('.banner-image.visible-xs img');
    var targetLocation = document.querySelector('#specials1-app-root');

    if (hiddenXsBanner && visibleXsBanner && targetLocation) {
        targetLocation.parentNode.insertBefore(hiddenXsBanner.parentNode, targetLocation.nextSibling);
        hiddenXsBanner.parentNode.parentNode.insertBefore(visibleXsBanner.parentNode, hiddenXsBanner.parentNode.nextSibling);
        targetLocation.style.display = 'none';
    }
}
  
</script>
