(function () {
  function svgToImg(svg) {
    const img = new Image();
    img.src = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
    img.draggable = false;
    return img;
  }
  const svgs = {
    player: `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g><ellipse cx='40' cy='50' rx='26' ry='12' fill='#00f6ff'/><rect x='26' y='26' width='28' height='26' rx='6' fill='#00b4d8'/></g></svg>`,
    alien: `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><ellipse cx='32' cy='30' rx='22' ry='18' fill='#7fff00'/><circle cx='22' cy='26' r='3.6' fill='#001'/><circle cx='42' cy='26' r='3.6' fill='#001'/></svg>`,
    ufo: `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='40' viewBox='0 0 80 40'><ellipse cx='40' cy='20' rx='30' ry='12' fill='#8e24aa'/><ellipse cx='40' cy='14' rx='18' ry='6' fill='#ce93d8'/></svg>`,
    spacejet: `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='40' viewBox='0 0 100 40'><polygon points='0,20 24,6 98,20 24,34' fill='#ff9800'/></svg>`,
  };
  window.Images = {
    get(name) {
      if (!svgs[name]) return null;
      return svgToImg(svgs[name]);
    },
  };
})();
