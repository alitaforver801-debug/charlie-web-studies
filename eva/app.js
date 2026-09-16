document.querySelectorAll('img[src]').forEach(image => {
  const fail = () => { image.classList.add('image-fallback'); image.alt = '官方图片暂时无法载入：' + image.alt; };
  image.addEventListener('error',fail,{once:true});
  if(image.complete && !image.naturalWidth) fail();
});

const imageDialog = document.querySelector('.image-dialog');
const fullImage = imageDialog.querySelector('img');
document.querySelectorAll('.image-open').forEach(button => {
  button.addEventListener('click', () => {
    const source = button.querySelector('img');
    fullImage.src = source.currentSrc || source.src;
    fullImage.alt = source.alt.replace('，取原画面右侧局部', '');
    imageDialog.querySelector('.dialog-caption').textContent = fullImage.alt + ' · 官方剧照 / © khara';
    imageDialog.showModal();
  });
});
imageDialog.querySelector('.image-close').addEventListener('click', () => imageDialog.close());
imageDialog.addEventListener('click', event => {
  if (event.target === imageDialog) {
    const bounds = imageDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) imageDialog.close();
  }
});
