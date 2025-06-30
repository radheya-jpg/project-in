const swiper = document.querySelector('#swiper');
const like = document.querySelector('#like');
const dislike = document.querySelector('#dislike');

const urls = [
  'Assets/cat1.png',
  'Assets/cat2.png',
  'Assets/cat3.png',
  'Assets/dog1.png',
];

let cardCount = 0;
let topCardInstance = null; // Keep track of top card

function appendNewCard() {
  const card = new Card({
    imageUrl: urls[cardCount % urls.length],
    onDismiss: appendNewCard,
    onLike: () => {
      like.style.animationPlayState = 'running';
      like.classList.add('trigger');
      setTimeout(() => like.classList.remove('trigger'), 1000);
    },
    onDislike: () => {
      dislike.style.animationPlayState = 'running';
      dislike.classList.add('trigger');
      setTimeout(() => dislike.classList.remove('trigger'), 1000);
    }
  });

  swiper.appendChild(card.element);
  topCardInstance = card; // Update the top card
  cardCount++;

  const cards = swiper.querySelectorAll('.card:not(.dismissing)');
  cards.forEach((card, index) => {
    card.style.setProperty('--i', index);
  });
}

// Initial stack
for (let i = 0; i < 5; i++) {
  appendNewCard();
}

// Like and Dislike button listeners
like.addEventListener('click', () => {
  topCardInstance?.dismissWithDirection(1);
});

dislike.addEventListener('click', () => {
  topCardInstance?.dismissWithDirection(-1);
});
