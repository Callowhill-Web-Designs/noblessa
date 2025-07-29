const slider = document.querySelector('.cs-slider');

function activate(e) {
  const items = document.querySelectorAll('.cs-slider-item');
  
  // Check if the clicked element is a navigation button or its child (svg)
  const button = e.target.closest('.btn');
  if (!button) return;
  
  if (button.classList.contains('next')) {
    slider.append(items[0]);
  } else if (button.classList.contains('prev')) {
    slider.prepend(items[items.length-1]);
  }
}

document.addEventListener('click', activate, false);