document.addEventListener("DOMContentLoaded", function() {
    const colorOptions = document.querySelectorAll('.color-option');
    console.log("Found " + colorOptions.length + " color options.");
    colorOptions.forEach(option => {
      option.addEventListener('click', function() {
        const paletteData = option.getAttribute('data-palette');
        console.log("Click on option with paletteData:", paletteData);
        const colorsArr = paletteData.split(',').map(c => c.trim());
        if (colorsArr.length < 2) {
          console.warn("Palette data did not return two colors:", paletteData);
          return;
        }
        const color1 = new THREE.Color(colorsArr[0]);
        const color2 = new THREE.Color(colorsArr[1]);
        if (window.activeBackground === "bg1" && window.newBackgroundUniforms) {
          window.newBackgroundUniforms.color1.value.copy(color1);
          window.newBackgroundUniforms.color2.value.copy(color2);
          console.log("Updated background1 uniforms to:", color1.getHexString(), color2.getHexString());
        } else if (window.activeBackground === "bg2" && window.newBackground2Uniforms) {
          window.newBackground2Uniforms.colorA.value.copy(color1);
          window.newBackground2Uniforms.colorB.value.copy(color2);
          console.log("Updated background2 uniforms to:", color1.getHexString(), color2.getHexString());
        } else {
          console.log("Original background color change (if implemented) goes here.");
        }
      });
    });
  });
  