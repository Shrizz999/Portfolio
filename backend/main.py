import os
import cv2
import json
import base64
import time
import math
import random
import numpy as np
import mediapipe as mp
import google.generativeai as genai
from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import ml_routes

# Load the hidden .env file (Does nothing in production on Render, which is perfect)
load_dotenv()

# Initialize FastAPI App
app = FastAPI(title="Portfolio ML Engine")
app.include_router(ml_routes.router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- SECURE AI AGENT SETUP ---
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("FATAL ERROR: GOOGLE_API_KEY is missing from environment variables.")

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash') 

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
async def chat_with_agent(request: ChatRequest):
    try:
        response = model.generate_content(request.message)
        return {"reply": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================
# --- COMPUTER VISION MODULES ---
# ==========================================

class MediaPipeEyeFatigueDetector:
    def __init__(self, ear_threshold=0.25, blink_frames=3, drowsy_frames=30):
        self.EAR_THRESHOLD = ear_threshold
        self.BLINK_FRAMES = blink_frames
        self.DROWSY_FRAMES = drowsy_frames
        
        self.blink_counter = 0
        self.total_blinks = 0
        self.drowsy_counter = 0
        self.blink_times = []

        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

        self.LEFT_EYE = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]
        self.RIGHT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
        self.LEFT_EYE_KEY = [362, 385, 387, 263, 373, 380]  
        self.RIGHT_EYE_KEY = [33, 160, 158, 133, 153, 144]  

    def calculate_ear(self, landmarks, eye_points):
        def get_distance(p1, p2):
            return math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2)
        eye_landmarks = [landmarks[i] for i in eye_points]
        vertical1 = get_distance(eye_landmarks[1], eye_landmarks[5])
        vertical2 = get_distance(eye_landmarks[2], eye_landmarks[4])
        horizontal = get_distance(eye_landmarks[0], eye_landmarks[3])
        if horizontal == 0: return 0
        return (vertical1 + vertical2) / (2.0 * horizontal)

    def calculate_blink_rate(self):
        if len(self.blink_times) < 2: return 0
        time_span = self.blink_times[-1] - self.blink_times[0]
        if time_span == 0: return 0
        return (len(self.blink_times) / time_span) * 60

    def draw_eye_landmarks(self, frame, landmarks, eye_points):
        h, w, _ = frame.shape
        points = []
        for idx in eye_points:
            x = int(landmarks.landmark[idx].x * w)
            y = int(landmarks.landmark[idx].y * h)
            points.append([x, y])
        points = np.array(points, np.int32)
        cv2.polylines(frame, [points], True, (0, 255, 0), 1)

    def process_frame(self, frame):
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_frame)
        drowsy = False
        ear = 0

        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                left_ear = self.calculate_ear(face_landmarks.landmark, self.LEFT_EYE_KEY)
                right_ear = self.calculate_ear(face_landmarks.landmark, self.RIGHT_EYE_KEY)
                ear = (left_ear + right_ear) / 2.0

                self.draw_eye_landmarks(frame, face_landmarks, self.LEFT_EYE)
                self.draw_eye_landmarks(frame, face_landmarks, self.RIGHT_EYE)

                if ear < self.EAR_THRESHOLD:
                    self.blink_counter += 1
                    self.drowsy_counter += 1
                else:
                    if self.blink_counter >= self.BLINK_FRAMES:
                        self.total_blinks += 1
                        self.blink_times.append(time.time())
                        current_time = time.time()
                        self.blink_times = [t for t in self.blink_times if current_time - t <= 60]
                    self.blink_counter = 0
                    self.drowsy_counter = 0

                if self.drowsy_counter >= self.DROWSY_FRAMES:
                    drowsy = True
                    cv2.putText(frame, "DROWSINESS ALERT!", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)

        cv2.rectangle(frame, (10, 50), (300, 180), (0, 0, 0), -1)
        cv2.rectangle(frame, (10, 50), (300, 180), (255, 255, 255), 2)
        cv2.putText(frame, f"Blinks: {self.total_blinks}", (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        cv2.putText(frame, f"EAR: {ear:.3f}", (20, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        cv2.putText(frame, f"Rate: {self.calculate_blink_rate():.1f}/min", (20, 140), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        status_text, status_color = ("FATIGUE!", (0, 0, 255)) if drowsy else ("ALERT", (0, 255, 0))
        cv2.putText(frame, status_text, (20, 170), cv2.FONT_HERSHEY_SIMPLEX, 0.7, status_color, 2)
        
        return frame

class HandPuzzleGame:
    def __init__(self, frame_w=640, frame_h=480):
        self.mp_hands = mp.solutions.hands
        self.mp_drawing = mp.solutions.drawing_utils
        self.hands = self.mp_hands.Hands(min_detection_confidence=0.7, min_tracking_confidence=0.7)
        self.PINCH_THRESHOLD = 40
        self.box_size = 120 
        grid_w = self.box_size * 3
        grid_h = self.box_size * 3
        self.start_x = (frame_w - grid_w) // 2
        self.start_y = (frame_h - grid_h) // 2
        self.grabbed_piece = None
        self.game_won = False
        self.pieces = []
        
        base_dir = os.path.dirname(os.path.abspath(__file__))
        pieces_dir = os.path.join(base_dir, "puzzle_pieces")
        
        for row in range(3):
            for col in range(3):
                idx = row * 3 + col
                target = {"x": self.start_x + col * self.box_size, "y": self.start_y + row * self.box_size}
                
                path = os.path.join(pieces_dir, f"piece{idx+1}.png")
                img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
                
                if img is None:
                    img = np.zeros((self.box_size, self.box_size, 4), dtype=np.uint8)
                    color = (random.randint(100,255), random.randint(100,255), random.randint(100,255), 255)
                    img[:] = color
                    cv2.putText(img, str(idx+1), (self.box_size//2 - 15, self.box_size//2 + 15), 
                                cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 0, 255), 3)
                else:
                    img = cv2.resize(img, (self.box_size, self.box_size))
                    
                self.pieces.append({
                    "x": random.randint(20, 200),
                    "y": random.randint(20, 200),
                    "img": img,
                    "target": target,
                    "locked": False,
                    "grabbed": False
                })

    def overlay_image(self, frame, img, x, y):
        h, w = img.shape[:2]
        if x >= frame.shape[1] or y >= frame.shape[0] or x + w <= 0 or y + h <= 0: return
        x1, y1 = max(x, 0), max(y, 0)
        x2, y2 = min(x + w, frame.shape[1]), min(y + h, frame.shape[0])
        img_x1, img_y1 = x1 - x, y1 - y
        img_x2, img_y2 = img_x1 + (x2 - x1), img_y1 + (y2 - y1)
        overlay = img[img_y1:img_y2, img_x1:img_x2]
        if overlay.shape[2] < 4: return
        b, g, r, a = cv2.split(overlay)
        alpha = a / 255.0
        for c, color in enumerate([b, g, r]):
            frame[y1:y2, x1:x2, c] = (alpha * color + (1 - alpha) * frame[y1:y2, x1:x2, c])

    def process_frame(self, frame):
        h, w, _ = frame.shape
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = self.hands.process(rgb)

        if result.multi_hand_landmarks:
            hand_landmarks = result.multi_hand_landmarks[0]
            self.mp_drawing.draw_landmarks(frame, hand_landmarks, self.mp_hands.HAND_CONNECTIONS)
            index_x = int(hand_landmarks.landmark[8].x * w)
            index_y = int(hand_landmarks.landmark[8].y * h)
            thumb_x = int(hand_landmarks.landmark[4].x * w)
            thumb_y = int(hand_landmarks.landmark[4].y * h)
            cv2.circle(frame, (index_x, index_y), 10, (0, 255, 255), -1)
            cv2.circle(frame, (thumb_x, thumb_y), 10, (255, 255, 0), -1)
            
            pinch_dist = math.hypot(index_x - thumb_x, index_y - thumb_y)

            if pinch_dist < self.PINCH_THRESHOLD:
                if self.grabbed_piece is None:
                    for piece in reversed(self.pieces):
                        if piece["locked"]: continue
                        ph, pw = piece["img"].shape[:2]
                        if piece["x"] < index_x < piece["x"] + pw and piece["y"] < index_y < piece["y"] + ph:
                            self.grabbed_piece = piece
                            piece["grabbed"] = True
                            break
                if self.grabbed_piece:
                    ph, pw = self.grabbed_piece["img"].shape[:2]
                    self.grabbed_piece["x"] = index_x - pw // 2
                    self.grabbed_piece["y"] = index_y - ph // 2
            else:
                if self.grabbed_piece:
                    tx, ty = self.grabbed_piece["target"]["x"], self.grabbed_piece["target"]["y"]
                    if abs(self.grabbed_piece["x"] - tx) < 50 and abs(self.grabbed_piece["y"] - ty) < 50:
                        self.grabbed_piece["x"] = tx
                        self.grabbed_piece["y"] = ty
                        self.grabbed_piece["locked"] = True  
                    self.grabbed_piece["grabbed"] = False
                    self.grabbed_piece = None

        for piece in self.pieces:
            tx, ty = piece["target"]["x"], piece["target"]["y"]
            color = (0, 255, 0) if piece["locked"] else (255, 255, 255)  
            cv2.rectangle(frame, (tx, ty), (tx + self.box_size, ty + self.box_size), color, 2)
            self.overlay_image(frame, piece["img"], piece["x"], piece["y"])
            
        win = all(piece["locked"] for piece in self.pieces)
        if win:
            cv2.putText(frame, "Puzzle Completed!", (50, 80), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 255), 3)

        return frame

# ==========================================
# --- WEBSOCKET ROUTER ---
# ==========================================

@app.websocket("/ws/opencv")
async def cv_stream(websocket: WebSocket):
    await websocket.accept()
    
    fatigue_detector = MediaPipeEyeFatigueDetector()
    puzzle_game = HandPuzzleGame()
    
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            mode = payload.get("mode", "canny")
            encoded_image = payload.get("frame")
            
            nparr = np.frombuffer(base64.b64decode(encoded_image), np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if frame is None: continue

            frame = cv2.flip(frame, 1)

            if mode == "fatigue":
                processed_frame = fatigue_detector.process_frame(frame)
            elif mode == "puzzle":
                processed_frame = puzzle_game.process_frame(frame)
            else:
                processed_frame = cv2.Canny(frame, 100, 200)
                processed_frame = cv2.cvtColor(processed_frame, cv2.COLOR_GRAY2BGR)
                cv2.putText(processed_frame, "Canny Edge Active", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

            _, buffer = cv2.imencode('.jpg', processed_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            processed_base64 = base64.b64encode(buffer).decode('utf-8')
            await websocket.send_text(f"data:image/jpeg;base64,{processed_base64}")
            
    except Exception as e:
        print(f"WebSocket closed: {e}")
    finally:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)