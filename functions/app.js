document.querySelectorAll('.skill-tab').forEach(button => {
    button.addEventListener('click', () => {
        const target = button.dataset.target;

        document.querySelectorAll('.skill-tab').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        document.querySelectorAll('.skill-panel').forEach(panel => panel.classList.remove('active'));
        document.getElementById(target).classList.add('active');
    });
});

const hamburguerMenu = document.querySelector('.hamburguer_menu');
const offScreenMenu = document.querySelector('.off_screen_menu');

hamburguerMenu.addEventListener('click', () => {
    hamburguerMenu.classList.toggle('active');
    offScreenMenu.classList.toggle('active');
});
