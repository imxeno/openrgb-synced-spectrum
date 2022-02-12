const { Client } = require("openrgb-sdk");
const chroma = require("chroma-js");
const spectrum = chroma.scale([
  "rgba(255, 0, 0, 1)",
  "rgba(255, 154, 0, 1)",
  "rgba(208, 222, 33, 1)",
  "rgba(79, 220, 74, 1)",
  "rgba(63, 218, 216, 1)",
  "rgba(47, 201, 226, 1)",
  "rgba(28, 127, 238, 1)",
  "rgba(95, 21, 242, 1)",
  "rgba(186, 12, 248, 1)",
  "rgba(251, 7, 217, 1)",
  "rgba(255, 0, 0, 1)",
  "rgba(255, 0, 0, 1)",
]);
const client = new Client("Synced Spectrum", 6742, "localhost");
const process = require("process");

let end = false;

async function start() {
  await client.connect();

  const controllerCount = await client.getControllerCount();

  let deviceList = [];
  for (let deviceId = 0; deviceId < controllerCount; deviceId++) {
    deviceList.push(await client.getControllerData(deviceId));
  }

  let progress = 0.0;

  let updateColorsInterval;

  const updateColors = async () => {
    if (end) {
      clearInterval(updateColorsInterval);
      await client.disconnect();
    }
    progress += 0.01;
    if (progress >= 1) progress = 0;
    const color = spectrum(progress).rgb();
    for (const device of deviceList) {
      const colors = Array(device.colors.length).fill({
        red: color[0],
        green: color[1],
        blue: color[2],
      });
      await client.updateLeds(device.deviceId, colors);
    }
  };

  updateColorsInterval = setInterval(updateColors, 50);
}

process.on("SIGINT", function () {
  console.log("Caught interrupt signal");
  end = true;
});

start();
