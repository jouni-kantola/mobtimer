Neutralino.init();

const timerValueElement = document.getElementById("timerValue");
const timerDisplayElement = document.getElementById("timerDisplay");
const startButtonElement = document.getElementById("startButton");

const state = {
    activeUserIndex: 1,
    getCurrentUser: () => document.querySelector(".user.current input[data-mob-user]").value,
    isRunning() { return !!state.clockIntervalId },
    clockIntervalId: null,
    iterationLengthInSeconds: timerValueElement.value, 
    secondsRemaining: timerValueElement.value,
}

function resetTimer() {
    clearInterval(state.clockIntervalId);
    state.clockIntervalId = null;
    state.secondsRemaining = state.iterationLengthInSeconds;
}

function updateTimeDisplay() {
    const minutes = Math.floor(state.secondsRemaining / 60);
    const seconds = state.secondsRemaining % 60;
    timerDisplayElement.innerText = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

async function setTray() {
    await Neutralino.os.setTray({
        icon: "/resources/icons/trayIcon.png",
        menuItems: [
            {
                id: "currentUser",
                text: `Driver: ${state.getCurrentUser()}`,
            },
        ],
    });
}

async function setCurrentUser() {
    const previousUser = document.querySelector(".user.current");
    if (previousUser)
        previousUser.classList.remove("current");

    const nextUser = document.querySelector(`.user[data-index="${state.activeUserIndex}"]`);
    nextUser.classList.add("current");

    const nextUserName = nextUser.querySelector("input[data-mob-user]").value;

    startButtonElement.innerText = `Start session for ${nextUserName}`;

    setTray();
}

async function runningTimer() {
    state.secondsRemaining--;
    updateTimeDisplay();
    if (state.secondsRemaining <= 0) {
        const allUsers = document.querySelectorAll(".user");

        for (let i = 1; i < allUsers.length + 1; i++) {
            const checkUser = (state.activeUserIndex + i) % (allUsers.length + 1);

            if (document.querySelector(`.user[data-index="${checkUser}"] input[type=checkbox]:checked`)) {
                state.activeUserIndex = checkUser;
                break;
            }
        }

        await setCurrentUser();

        resetTimer();

        updateTimeDisplay();

        await Neutralino.window.show();
    }
}

timerValueElement.addEventListener("input", e => {
    state.secondsRemaining = Math.max(1, e.target.value);
    e.target.value = state.secondsRemaining;
    state.iterationLengthInSeconds = state.secondsRemaining;
    updateTimeDisplay();
});

startButtonElement.addEventListener("click", async () => {
    if (state.isRunning()) {
        await Neutralino.window.hide();
        return false;
    }

    startButtonElement.innerText = `Session running 🚀. Double click other user to switch/restart.`;

    const currentUser = document.querySelector(".user.current input[type=text]");
    await Neutralino.os.showNotification(
        "New session",
        `Let's go ${currentUser.value} 😘`
    );

    await Neutralino.window.hide();

    state.clockIntervalId = setInterval(runningTimer, 1000);
});

Neutralino.events.on("trayMenuItemClicked", async e => {
    await Neutralino.window.show();
});

async function initApp() {
    let mobUsers;

    try {
        mobUsers = JSON.parse(await Neutralino.storage.getData("mobUsers"));
    } catch (err) {
        mobUsers = ["User 1", "User 2", "User 3", "User 4", "User 5", "Break"];
    }

    document.getElementById("mobUsers").innerHTML = mobUsers.map((m, i) =>
        `<div class="grid user" data-index="${i + 1}">
    <input type="checkbox" role="switch" checked />
    <input type="text" placeholder="Name" value="${m}" data-mob-user="${m}" />
</div>`).join("");

    async function storeUsers() {
        await Neutralino.storage.setData(
            "mobUsers",
            JSON.stringify(
                Array.from(
                    document.querySelectorAll("input[data-mob-user]")
                ).map(x => x.value)
            )
        );
    }

    document.querySelectorAll("input[data-mob-user]").forEach(u => {
        u.addEventListener("change", storeUsers);

        u.addEventListener("dblclick", async udbclick => {
            if (!udbclick.target.previousElementSibling.checked) {
                return;
            }
            resetTimer();
            state.activeUserIndex = parseInt(udbclick.target.parentElement.dataset.index);
            await setCurrentUser();
            updateTimeDisplay();
        });
    });

    updateTimeDisplay();
    await setCurrentUser();
};

initApp();
