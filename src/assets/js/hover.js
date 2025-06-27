import HoverEffect from 'hover-effect';

const imageGroup1 = document.querySelector('.cs-picture1');
if (imageGroup1) {
  new HoverEffect({
    parent: imageGroup1,
    intensity: .1,
    image1: '/assets/images/lazar/lazarhome2.webp',
    image2: '/assets/images/lazar/lazarhome1.webp',
    displacementImage: '/assets/images/2.jpg',
    imagesRatio: 1.1,
  });
}

const imageGroup2 = document.querySelector('.cs-picture2');
if (imageGroup2) {
  new HoverEffect({
    parent: imageGroup2,
    intensity: .1,
    image1: '/assets/images/silva/silvahome1.webp',
    image2: '/assets/images/silva/silvahome2.webp',
    displacementImage: '/assets/images/2.jpg',
    imagesRatio: .7,
  });
}

const imageGroup3 = document.querySelector('.cs-picture3');
if (imageGroup3) {
  new HoverEffect({
    parent: imageGroup3,
    intensity: .1,
    image1: '/assets/images/walnutkitchen.webp',
    image2: '/assets/images/whitekitchen.webp',
    displacementImage: '/assets/images/2.jpg',
  });
}

const imageGroup4 = document.querySelector('.cs-picture4');
if (imageGroup4) {
  new HoverEffect({
    parent: imageGroup4,
    intensity: .1,
    image1: '/assets/images/youngers/youngers2.webp',
    image2: '/assets/images/youngers/youngers1.webp',
    displacementImage: '/assets/images/2.jpg',
    imagesRatio: 1.1,
  });
}