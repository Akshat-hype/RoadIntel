import cv2
import base64
import time
import threading
import requests
import numpy as np
import os
from datetime import datetime, timezone
from io import BytesIO
from PIL import Image
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import torch
from ultralyticsplus import YOLO

# ======================================================
# 🔁 VIDEO SOURCE TOGGLE
# ======================================================

USE_LIVE_STREAM = True

PI_STREAM_URL = "http://10.195.7.182:8080/video"
VIDEO_PATH = "testvid.mp4"

# ======================================================
# 🔗 BACKEND ENDPOINT (YOUR BACKEND ✅)
# ======================================================

API_ENDPOINT = "http://127.0.0.1:5000/api/pothole"

# ======================================================
# CONFIG
# ======================================================

SAVE_DIR = "received_potholes"
CONF_THRESHOLD = 0.25
IOU_THRESHOLD = 0.45

SEND_INTERVAL = 2
FRAME_SKIP = 2
RESIZE_WIDTH = 640

CROP_SIZE = 224
JPEG_QUALITY = 60

ROAD_LEVEL_CM = 30

os.makedirs(SAVE_DIR, exist_ok=True)

# ======================================================
# FASTAPI SERVER (FOR ESP + MONITORING)
# ======================================================

app = FastAPI()

latest_event = None

severity_count = {"low": 0, "medium": 0, "high": 0}

esp_data = {"distance_cm": None, "depth_cm": None}

# ======================================================
# DATA MODELS
# ======================================================

class PotholeData(BaseModel):
    severity: str
    timestamp: str
    image: str

# ======================================================
# API ENDPOINTS
# ======================================================

@app.post("/data")
def receive_pothole(data: PotholeData):
    global latest_event

    img_bytes = base64.b64decode(data.image)
    img = Image.open(BytesIO(img_bytes))

    ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S_%f")
    img.save(os.path.join(SAVE_DIR, f"{data.severity}_{ts}.jpg"))

    severity_count[data.severity] += 1

    latest_event = {
        "severity": data.severity,
        "severity_counts": severity_count,
        "distance_cm": esp_data["distance_cm"],
        "depth_cm": esp_data["depth_cm"],
        "timestamp": data.timestamp
    }

    print(f"[YOLO] {data.severity.upper()} detected")
    return {"status": "ok"}

@app.post("/esp")
def receive_esp(data: dict):
    distance = data.get("distance_cm")
    if distance is None:
        return {"error": "distance missing"}

    depth = max(0, ROAD_LEVEL_CM - distance)

    esp_data["distance_cm"] = distance
    esp_data["depth_cm"] = depth

    print(f"[ESP] Distance={distance:.1f}cm Depth={depth:.1f}cm")
    return {"status": "received"}

def start_server():
    uvicorn.run(app, host="0.0.0.0", port=8990, log_level="error")

# ======================================================
# YOLO MODEL
# ======================================================

print("[INFO] Loading YOLO model...")
model = YOLO("keremberke/yolov8n-pothole-segmentation")

if torch.cuda.is_available():
    model.to("cuda")
    model.overrides["half"] = True
    print("[INFO] YOLO running on CUDA")
else:
    model.to("cpu")
    print("[INFO] YOLO running on CPU")

model.overrides["conf"] = CONF_THRESHOLD
model.overrides["iou"] = IOU_THRESHOLD

last_sent = 0
frame_count = 0

# ======================================================
# UTILITIES
# ======================================================

def severity_from_mask(mask, frame_area):
    ratio = np.sum(mask > 0) / frame_area
    if ratio < 0.01:
        return "low"
    elif ratio < 0.05:
        return "medium"
    else:
        return "high"

def image_to_base64(img):
    img = cv2.resize(img, (CROP_SIZE, CROP_SIZE))
    ok, buffer = cv2.imencode(".jpg", img,
                              [int(cv2.IMWRITE_JPEG_QUALITY), JPEG_QUALITY])
    return base64.b64encode(buffer).decode("utf-8") if ok else None

def process_frame(frame):
    global last_sent

    results = model.predict(frame, verbose=False)[0]

    if results.masks is None:
        return frame

    masks = results.masks.data.cpu().numpy()
    boxes = results.boxes.xyxy.cpu().numpy()
    frame_area = frame.shape[0] * frame.shape[1]

    for i, mask in enumerate(masks):
        sev = severity_from_mask(mask, frame_area)
        x1, y1, x2, y2 = boxes[i].astype(int)

        crop = frame[y1:y2, x1:x2]
        if crop.size == 0:
            continue

        color = (0,255,0) if sev=="low" else (0,255,255) if sev=="medium" else (0,0,255)
        cv2.rectangle(frame, (x1,y1), (x2,y2), color, 2)
        cv2.putText(frame, sev.upper(), (x1, y1-8),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

        if time.time() - last_sent > SEND_INTERVAL:
            payload = {
                "severity": sev,
                "distance_cm": esp_data["distance_cm"],
                "depth_cm": esp_data["depth_cm"],
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            try:
                requests.post(API_ENDPOINT, json=payload, timeout=1)
                print(f"[BACKEND] Sent → {payload}")
                last_sent = time.time()
            except Exception as e:
                print("Backend error:", e)

    return frame

# ======================================================
# MAIN
# ======================================================

if __name__ == "__main__":

    print("[*] Starting system...")

    threading.Thread(target=start_server, daemon=True).start()
    time.sleep(1)

    cap = cv2.VideoCapture(
        PI_STREAM_URL if USE_LIVE_STREAM else VIDEO_PATH,
        cv2.CAP_FFMPEG if USE_LIVE_STREAM else 0
    )

    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    time.sleep(2)

    if not cap.isOpened():
        print("❌ Video source error")
        exit(1)

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        frame_count += 1
        h, w = frame.shape[:2]
        frame = cv2.resize(frame, (RESIZE_WIDTH, int(h * RESIZE_WIDTH / w)))

        if frame_count % FRAME_SKIP == 0:
            frame = process_frame(frame)

        info = f"L:{severity_count['low']} M:{severity_count['medium']} H:{severity_count['high']}"
        cv2.putText(frame, info, (10,30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255,255,0), 2)

        if esp_data["depth_cm"] is not None:
            cv2.putText(frame, f"Depth: {esp_data['depth_cm']:.1f}cm",
                        (10,65), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,255), 2)

        cv2.imshow("Pothole Detection System", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()