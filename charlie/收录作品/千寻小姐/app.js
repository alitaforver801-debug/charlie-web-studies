const markFailure = image => {
  if (image.classList.contains('img-error')) return;
  image.classList.add('img-error');
  image.alt = '图片暂未加载：' + image.alt;
};
document.querySelectorAll('img[src]').forEach(image => {
  image.addEventListener('error', () => markFailure(image));
  if (image.complete && !image.naturalWidth) markFailure(image);
});
const viewer = document.querySelector('.image-dialog');
const fullImage = viewer.querySelector('img');
fullImage.addEventListener('error', () => markFailure(fullImage));
document.querySelectorAll('.image-open').forEach(button => {
  button.addEventListener('click', () => {
    const source = button.querySelector('img');
    fullImage.classList.remove('img-error');
    fullImage.alt = source.alt;
    fullImage.src = source.currentSrc || source.src;
    viewer.querySelector('p').textContent = source.alt + ' · ©2023 Asmik Ace, Inc.';
    viewer.showModal();
  });
});
viewer.querySelector('.close').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', event => {
  if (event.target !== viewer) return;
  const b = viewer.getBoundingClientRect();
  if (event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom) viewer.close();
});
