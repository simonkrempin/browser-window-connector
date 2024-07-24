const windowIndex = registerWindow();
const screen = {
  x: 0,
  y: 0,
  height: 0,
  width: 0,
}
const windowPositions = [];
const connections = [];
const cache = {};

setInterval(() => {
  getWindowProperties();
  saveWindowProperties();
  getOtherWindowProperties();
  paintConnections();
}, 10);

window.addEventListener("beforeunload", () => {
  unregisterWindow();
});

function getOtherWindowProperties() {
  const storedWindowIndexes = window.localStorage.getItem("index");

  if (
    !storedWindowIndexes
  ) {
    return;
  }

  windowPositions.length = 0;

  cache["windowIndexes"] = storedWindowIndexes;

  const windowIndexes = JSON.parse(storedWindowIndexes);

  for (let i = 0; i < windowIndexes.length; i++) {
    if (i === windowIndex) {
      continue;
    }

    const currentWindowPosition = window.localStorage.getItem(i.toString());

    if (!currentWindowPosition) {
      continue;
    }

    windowPositions.push({
      index: i,
      ...JSON.parse(currentWindowPosition)
    });
  }
}

function registerWindow() {
  const storedWindowIndexes = window.localStorage.getItem("index");

  if (!storedWindowIndexes) {
    window.localStorage.setItem("index", "[0]");
    return 0;
  }

  const windowIndexes = JSON.parse(storedWindowIndexes);

  let emptyIndex = windowIndexes.findIndex((registeredIndex, index) => registeredIndex !== index);

  if (emptyIndex === -1) {
    emptyIndex = windowIndexes.length;
    windowIndexes.push(emptyIndex);
  } else {
    windowIndexes.splice(emptyIndex, 0, emptyIndex);
  }

  window.localStorage.setItem("index", JSON.stringify(windowIndexes));
  return emptyIndex;
}

function unregisterWindow() {
  const storedWindowIndexes = window.localStorage.getItem("index");

  if (!storedWindowIndexes) {
    return;
  }

  const windowIndexes = JSON.parse(storedWindowIndexes);

  if (windowIndexes.length === 1) {
    window.localStorage.removeItem("index");
    return;
  }

  windowIndexes.splice(windowIndex, 1);

  window.localStorage.setItem("index", JSON.stringify(windowIndexes));
}

function getWindowProperties() {
  screen.x = window.screenX;
  screen.y = window.screenY;
  screen.height = window.innerHeight;
  screen.width = window.innerWidth;
}

function saveWindowProperties() {
  window.localStorage.setItem(windowIndex.toString(), JSON.stringify(screen));
}

function paintConnections() {
  for (const connection in connections) {
    const removeConnection = windowPositions.find((windowPosition) => connection.index === windowPosition.index);

    if (!!removeConnection && connection.element !== undefined) {
      connection.element.remove();
    }
  }

  for (const windowPosition of windowPositions) {
    const existingConnection = connections.find((connection) => connection.index === windowPosition.index);

    if (!existingConnection) {
      const connection = document.createElement("div");
      connection.style.backgroundColor = "black";
      connection.style.position = "fixed";
      connection.style.left = "50%";
      connection.style.height = "10px";
      connection.style.top = "50%";
      connection.style.transformOrigin = "center left";
      connection.style.transform = `rotate(${getRotation(windowPosition)}deg)`;
      connection.style.width = screen.width.toString() + "px";
      document.body.appendChild(connection);
      connections.push({
        element: connection,
        index: windowPosition.index,
      });
    }

    existingConnection.element.style.transform = `rotate(${getRotation(windowPosition)}deg)`;
  }
}

function getRotation(windowPosition) {
  const windowVector = {
    x: (windowPosition.x + windowPosition.width / 2),
    y: (windowPosition.y + windowPosition.height / 2),
  };
  const screenVector = {
    x: (screen.x + screen.width / 2),
    y: (screen.y + screen.height / 2),
  };
  const angleDeg = Math.atan2(windowVector.y - screenVector.y, windowVector.x - screenVector.x) * 180 / Math.PI;
  return angleDeg;
}
