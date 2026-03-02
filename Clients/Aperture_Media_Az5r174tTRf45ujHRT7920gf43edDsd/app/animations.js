const observer = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            } else {
                entry.target.classList.remove("active");
            }
        });
    },
    { threshold: 0.2 }
);

function initAnimations(root = document) {
    root.querySelectorAll(".anim").forEach(el => {
        if (!el.dataset.observed) {
            el.dataset.observed = "true";

            if (el.classList.contains("anim-typewriter")) {
                const text = el.textContent.trim();
                el.style.setProperty("--chars", text.length);
            }

            observer.observe(el);
        }
    });
}

initAnimations();