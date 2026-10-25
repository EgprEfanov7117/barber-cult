'use strict';

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
const dialog = document.querySelector('#booking-dialog');
const dialogTitle = document.querySelector('#dialog-title');
const dialogDescription = document.querySelector('#dialog-description');
const selection = document.querySelector('#booking-selection');
const servicesButton = document.querySelector('#dialog-services');
let returnFocus = null;

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
  navigation.classList.remove('open');
}

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  navigation.classList.toggle('open', open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.querySelector('.header').addEventListener('focusout', event => {
  if (!event.currentTarget.contains(event.relatedTarget)) closeMenu();
});
document.addEventListener('click', event => {
  if (!event.target.closest('.header')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
const mobileQuery = window.matchMedia('(max-width: 760px)');
mobileQuery.addEventListener('change', () => { if (!mobileQuery.matches) closeMenu(); });

// Keep native anchor navigation/history and move keyboard focus to its destination.
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => {
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
});

function openDialog(trigger, social) {
  closeMenu();
  returnFocus = trigger;
  dialogTitle.innerHTML = social ? 'ОСТАВАЙСЯ<br><span class="accent">В CULT.</span>' : 'ТВОЙ СЛЕДУЮЩИЙ<br><span class="accent">ОБРАЗ.</span>';
  dialogDescription.textContent = social
    ? `${social} — демонстрационная ссылка. У вымышленного бренда BARBER CULT нет официальных социальных сетей. Это портфолио AI-студии NOVARY.`
    : 'Это демонстрационный проект NOVARY. Настоящая запись недоступна: данные не собираются и никуда не отправляются.';
  const details = [];
  if (trigger.dataset.service) details.push(`Услуга: ${trigger.dataset.service}`);
  if (trigger.dataset.master) details.push(`Мастер: ${trigger.dataset.master}`);
  selection.textContent = details.join('\n');
  selection.hidden = details.length === 0;
  servicesButton.hidden = Boolean(social);
  dialog.showModal();
  document.body.classList.add('locked');
}

document.querySelectorAll('[data-book]').forEach(button => button.addEventListener('click', () => openDialog(button)));
document.querySelectorAll('[data-social]').forEach(button => button.addEventListener('click', () => openDialog(button, button.dataset.social)));
document.querySelectorAll('.dialog-close, .dialog-dismiss').forEach(button => button.addEventListener('click', () => dialog.close()));
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('locked');
  const focusTarget = returnFocus;
  returnFocus = null;
  focusTarget?.focus({ preventScroll: true });
});
servicesButton.addEventListener('click', () => {
  const heading = document.querySelector('#services-title');
  heading.setAttribute('tabindex', '-1');
  // The close event runs asynchronously; restore focus to the destination there.
  returnFocus = heading;
  dialog.close();
  const section = document.querySelector('#services');
  section.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
});

const reviews = [
  { text: '«Тот случай, когда не нужно объяснять дважды. Обсудили форму, подобрали длину — и получилось именно то, что хотелось. Спокойно, точно, со вкусом.»', author: 'Александр' },
  { text: '«Понравилось внимание к мелочам: от консультации до финальной укладки. Теперь знаю, как поддерживать форму дома. Именно такого подхода и хотелось.»', author: 'Михаил' },
  { text: '«Час без спешки и хороший разговор. Стрижка получилась естественной, борода — аккуратной. Пример того, как могла бы выглядеть моя идеальная встреча с барбером.»', author: 'Артём' }
];
let reviewIndex = 0;
function showReview(direction) {
  reviewIndex = (reviewIndex + direction + reviews.length) % reviews.length;
  document.querySelector('#review-text').textContent = reviews[reviewIndex].text;
  document.querySelector('#review-author').textContent = reviews[reviewIndex].author;
  document.querySelector('#review-index').textContent = String(reviewIndex + 1).padStart(2, '0');
}
document.querySelector('#review-prev').addEventListener('click', () => showReview(-1));
document.querySelector('#review-next').addEventListener('click', () => showReview(1));
document.querySelector('#year').textContent = new Date().getFullYear();

// Without JavaScript, show navigation and keep unavailable controls disabled.
document.documentElement.classList.add('has-js');
document.querySelectorAll('button').forEach(button => { button.disabled = false; });

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  document.documentElement.classList.add('js');
}
