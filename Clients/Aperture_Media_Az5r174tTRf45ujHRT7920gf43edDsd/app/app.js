async function loadWork() {
    const container = document.getElementById("c5-work-cont");
    if (!container) return;

    try {
        const response = await fetch("./data/work.json");
        const data = await response.json();

        const isMobile = window.innerWidth <= 900;
        const amount = isMobile ? 4 : 6;

        const shuffled = [...data].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, amount);

        container.innerHTML = "";

        selected.forEach((item, index) => {
            const element = document.createElement("div");
            element.className = `c5-work-element anim anim-fade-up anim-delay-${index + 1}a`;

            element.innerHTML = `
                <div class="c5-work-image-cont">
                    <img src="${item.image}" class="c3-work-image" alt="${item.title}">
                </div>
                <h4 class="c5-work-title">${item.title}</h4>
                <p class="c5-work-description">${item.description}</p>
            `;

            container.appendChild(element);
            
            if (window.observer) {
                window.observer.observe(element);
            } else if (typeof observer !== 'undefined') {
                observer.observe(element);
            }
        });
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", loadWork);