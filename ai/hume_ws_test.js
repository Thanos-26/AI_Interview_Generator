import WebSocket from "ws";
import fs from "fs";
import "dotenv/config";

const ws = new WebSocket("wss://api.hume.ai/v0/stream/models", {
    headers: {
        "X-Hume-Api-Key": process.env.HUME_API_KEY
    }
});

ws.on("open", () => {
    console.log("Connected to Hume");

    // read image
    const imageBuffer = fs.readFileSync("image.png");
    const base64Image = imageBuffer.toString("base64");

    // send image
    ws.send(JSON.stringify({
        data: base64Image,
        models: {
            face: {}
        }
    }));
});

ws.on("message", (msg) => {
    const data = JSON.parse(msg.toString());
    // console.log("Hume response:", JSON.stringify(data, null, 2));
    const mainFace = data.face.predictions[0];
    const raw = data.face.predictions[0].emotions;
    const e = normalizeEmotions(raw);
    const metrics = computeMetrics(e);

    console.log(metrics);

    // optional: close after first response
    ws.close();
});

ws.on("error", (err) => {
    console.error("WebSocket error:", err);
});

function computeMetrics(e) {
  return {
    tension: avg(e.anxiety, e.distress, e.fear),
    focus: Math.round(e.concentration * 100),
    engagement: avg(e.interest, e.excitement),
    confidence: avg(e.determination, e.pride, e.calmness),
    fatigue: avg(e.tiredness, e.boredom)
  };
}

function avg(...vals) {
  const valid = vals.filter(v => v !== undefined);
  return Math.round(
    (valid.reduce((a,b)=>a+b,0) / valid.length) * 100
  );
}
function normalizeEmotions(arr) {
  const obj = {};
  arr.forEach(e => {
    obj[e.name.toLowerCase()] = e.score;
  });
  return obj;
}
