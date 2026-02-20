import * as faceapi from "face-api.js";

let labeledDescriptors = [];

export async function loadModels() {
  const MODEL_URL = "/models";

  console.log("🔵 Loading face-api models...");

  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

  console.log("✅ Models loaded successfully");
}

export async function loadKnownFaces() {
  console.log("🔵 Loading known faces (2-person test mode)...");

  const labels = ["person1", "person2", "person3"]; // 👈 only these two

  labeledDescriptors = await Promise.all(
    labels.map(async (label) => {
      try {
        console.log(`➡️ Processing ${label}`);

        const img = await faceapi.fetchImage(`/known/${label}.jpg`);

        const detection = await faceapi
          .detectSingleFace(
            img,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 416,
              scoreThreshold: 0.5,
            }),
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection) {
          console.warn(`❌ No face detected in ${label}`);
          return null;
        }

        console.log(
          `✅ Face detected in ${label} | Descriptor length:`,
          detection.descriptor.length,
        );

        return new faceapi.LabeledFaceDescriptors(label, [
          detection.descriptor,
        ]);
      } catch (err) {
        console.error(`🔥 Error processing ${label}:`, err);
        return null;
      }
    }),
  );

  labeledDescriptors = labeledDescriptors.filter(Boolean);

  console.log("🟢 Total descriptors loaded:", labeledDescriptors.length);
}

export async function matchFaceFromVideo(videoElement) {
  console.log("🔍 Attempting match...");

  if (!labeledDescriptors.length) return null;

  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.45);
  const votes = [];

  for (let i = 0; i < 3; i++) {
    // 👈 reduce to 3
    const detection = await faceapi
      .detectSingleFace(
        videoElement,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 160,
          scoreThreshold: 0.6,
        }),
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) continue;

    const result = faceMatcher.findBestMatch(detection.descriptor);

    if (result.label !== "unknown" && result.distance < 0.45) {
      votes.push(result.label);
    }

    await new Promise((r) => setTimeout(r, 80)); // 👈 shorter delay
  }

  if (!votes.length) return null;

  const count = {};
  votes.forEach((v) => {
    count[v] = (count[v] || 0) + 1;
  });

  const best = Object.entries(count).sort((a, b) => b[1] - a[1])[0];

  return best[1] >= 2 ? best[0] : null;
}
