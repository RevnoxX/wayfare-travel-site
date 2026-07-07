class WayfareCursor extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        .cursor {
          pointer-events: none;
          position: fixed;
          display: block;
          border-radius: 0;
          mix-blend-mode: difference;
          top: 0;
          left: 0;
          z-index: 9999999999999999;  
        }

        .circle {
            position: absolute;
            display: block;
            width: 25px;
            height: 25px;
            border-radius: 20px;
            background-color: #fff;
        }

        @media(max-width: 768px) {
            .cursor { display: none; }
        }
      </style>
      <div class="cursor">
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
        <div class="circle"></div>
      </div>
    `;

    this.initCursor();
  }

  initCursor() {
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches || window.innerWidth <= 768) {
        return;
    }
    const coords = { x: 0, y: 0 };
    const circles = this.querySelectorAll(".circle");
    const cursor = this.querySelector(".cursor");

    

    circles.forEach(function (circle, index) {
      circle.x = 0;
      circle.y = 0;
      circle.style.backgroundColor = "white";
    });

    window.addEventListener("mousemove", function (e) {
      let targetX = e.clientX;
      let targetY = e.clientY;

      

      coords.x = targetX;
      coords.y = targetY;
    });

    

    

    function animateCircles() {
      let x = coords.x;
      let y = coords.y;

      // The cursor container stays fixed, we just animate the circles inside it
      cursor.style.top = "0px";
      cursor.style.left = "0px";
      
      circles.forEach(function (circle, index) {
        circle.style.left = x - 12 + "px";
        circle.style.top = y - 12 + "px";

        circle.style.scale = (circles.length - index) / circles.length;

        circle.x = x;
        circle.y = y;

        const nextCircle = circles[index + 1] || circles[0];
        x += (nextCircle.x - x) * 0.2;
        y += (nextCircle.y - y) * 0.2;
      });

      requestAnimationFrame(animateCircles);
    }

    animateCircles();
  }
}

customElements.define('wayfare-cursor', WayfareCursor);
