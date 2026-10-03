document.querySelectorAll('img').forEach(image => {
  const showFallback = () => {
    image.classList.add('img-error');
    image.alt = '官方图片暂时未能载入：' + image.alt;
  };
  image.addEventListener('error', showFallback, {once:true});
  if (image.complete && image.naturalWidth === 0) showFallback();
});
