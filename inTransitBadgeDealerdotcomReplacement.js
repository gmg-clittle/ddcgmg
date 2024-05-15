document.addEventListener('DOMContentLoaded', function() {
  // Find the <div> element with the specific classes
  var targetDiv = document.querySelector('div.badge.badge-in-transit.status-7');

  if (targetDiv) {
    // Access the parent <li> element of the found <div>
    var oldElement = targetDiv.parentNode;

    // Make sure the parent is indeed an <li> element
    if (oldElement.tagName === 'LI') {
      // Create the new <div> element
      var newElement = document.createElement('div');
      newElement.style.display = 'inline-flex';
      newElement.style.alignItems = 'center';
      newElement.style.borderRadius = '0';  // No rounded edges
      newElement.style.whiteSpace = 'nowrap';
      newElement.style.border = '1px solid rgba(0, 0, 0, 0.1)';
      newElement.style.padding = '6px 12px';
      newElement.style.fontSize = '0.875rem';
      newElement.style.fontWeight = '500';
      newElement.style.transition = 'all 0.3s ease';
      newElement.style.outline = 'none';
      newElement.style.background = '#072a60';  // Solid background color
      newElement.style.color = 'white';
      newElement.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';  // Subtle shadow
      newElement.style.cursor = 'pointer';  // Pointer cursor on hover
      newElement.innerText = 'In-Transit';

      // Hover effect for a cleaner look
      newElement.addEventListener('mouseover', function() {
        newElement.style.background = '#06529c';  // Slightly lighter shade on hover
      });
      newElement.addEventListener('mouseout', function() {
        newElement.style.background = '#072a60';
      });

      // Add popover attributes to the new <div>
      newElement.setAttribute('class', 'btn btn-primary');
      newElement.setAttribute('data-toggle', 'popover');
      newElement.setAttribute('data-trigger', 'hover');  // Set trigger to hover
      newElement.setAttribute('data-placement', 'bottom');
      newElement.setAttribute('data-title', 'Vehicle In-Transit');
      newElement.setAttribute('data-content', 'Disclaimer: This vehicle is currently in-transit to the dealership.');

      // Replace the old <li> element with the new <div> element
      oldElement.parentNode.replaceChild(newElement, oldElement);

      // Initialize the popover
      $(newElement).popover();
    } else {
      console.log('The parent of the target div is not an <li> element.');
    }
  } else {
    console.log('Target <div> element not found.');
  }
});
