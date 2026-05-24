
import sys
import os
import urllib.request
import time
import cv2
import numpy as np
import pyautogui

# ── new mediapipe tasks API ───────────────────────────────────────────────────
import mediapipe as mp
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision as mp_vision
from mediapipe.tasks.python.vision import HandLandmarker, HandLandmarkerOptions, RunningMode
from mediapipe.tasks.python.core import base_options as mp_base

# ── model path ────────────────────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "hand_landmarker.task")
MODEL_URL  = (
    "https://storage.googleapis.com/mediapipe-models/"
    "hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
)

def download_model():
    if os.path.exists(MODEL_PATH) and os.path.getsize(MODEL_PATH) > 1000:
        print(f"Model already present: {MODEL_PATH}")
        return
    print(f"Downloading hand landmarker model (~8 MB)...")
    urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
    print(f"Saved to {MODEL_PATH}")

# ── pyautogui safety ─────────────────────────────────────────────────────────
pyautogui.FAILSAFE = True
pyautogui.PAUSE    = 0.01

# ── landmark indices ──────────────────────────────────────────────────────────
WRIST      = 0
THUMB_TIP  = 4
INDEX_MCP  = 5
INDEX_TIP  = 8
MIDDLE_MCP = 9
MIDDLE_TIP = 12
RING_MCP   = 13
RING_TIP   = 16
PINKY_MCP  = 17
PINKY_TIP  = 20

# ── tuning ────────────────────────────────────────────────────────────────────
SWIPE_THRESHOLD    = 0.25
SWIPE_COOLDOWN     = 1.2
SCROLL_COOLDOWN    = 3.0  
CLICK_COOLDOWN     = 1.5  # Prevents spam clicking while holding 3 fingers up

# ── helpers ───────────────────────────────────────────────────────────────────
def finger_extended(tip, mcp):
    return tip.y < mcp.y

def draw_landmarks(frame, hand_landmarks):
    """Draw landmark dots and connections without mp.solutions."""
    h, w = frame.shape[:2]
    connections = [
        (0,1),(1,2),(2,3),(3,4),           # thumb
        (0,5),(5,6),(6,7),(7,8),           # index
        (0,9),(9,10),(10,11),(11,12),      # middle
        (0,13),(13,14),(14,15),(15,16),    # ring
        (0,17),(17,18),(18,19),(19,20),    # pinky
        (5,9),(9,13),(13,17),              # palm
    ]
    pts = [(int(lm.x * w), int(lm.y * h)) for lm in hand_landmarks]
    for a, b in connections:
        cv2.line(frame, pts[a], pts[b], (80, 200, 120), 1)
    for x, y in pts:
        cv2.circle(frame, (x, y), 4, (255, 255, 255), -1)
        cv2.circle(frame, (x, y), 4, (80, 200, 120), 1)


# ── main controller ───────────────────────────────────────────────────────────
class GestureController:
    def __init__(self):
        if not os.path.exists(MODEL_PATH) or os.path.getsize(MODEL_PATH) < 1000:
            raise FileNotFoundError(
                f"Model not found at {MODEL_PATH}\n"
                "Run:  python gesture_controller_windows.py --download-model"
            )

        self.paused = False
        self.debug  = True

        self.last_swipe_x     = None
        self.last_swipe_time  = 0
        self.last_scroll_time = 0
        self.last_click_time  = 0
        self.reel_count       = 0

        self._latest_result    = None
        self._latest_timestamp = 0

        opts = HandLandmarkerOptions(
            base_options=mp_base.BaseOptions(model_asset_path=MODEL_PATH),
            running_mode=RunningMode.LIVE_STREAM,
            num_hands=1,
            min_hand_detection_confidence=0.7,
            min_hand_presence_confidence=0.7,
            min_tracking_confidence=0.6,
            result_callback=self._on_result,
        )
        self.landmarker = HandLandmarker.create_from_options(opts)

    def _on_result(self, result, output_image, timestamp_ms):
        self._latest_result    = result
        self._latest_timestamp = timestamp_ms

    def handle_discrete_scroll(self, direction):
        now = time.time()
        if now - self.last_scroll_time < SCROLL_COOLDOWN:
            return
            
        if direction == "DOWN":
            pyautogui.press('down')  
            self.reel_count += 1  
            print(f"Action: Next Reel ↓ | Total Reels Watched: {self.reel_count}")
        elif direction == "UP":
            pyautogui.press('up')    
            print("Action: Previous Reel ↑")
            
        self.last_scroll_time = now

    def handle_click(self):
        now = time.time()
        if now - self.last_click_time < CLICK_COOLDOWN:
            return
        pyautogui.click()
        print("Action: Mouse Left Clicked 🖱️")
        self.last_click_time = now

    def handle_swipe(self, lm):
        now = time.time()
        if now - self.last_swipe_time < SWIPE_COOLDOWN:
            return
        palm_x = lm[WRIST].x
        if self.last_swipe_x is None:
            self.last_swipe_x = palm_x
            return
        if abs(palm_x - self.last_swipe_x) > SWIPE_THRESHOLD:
            pyautogui.hotkey('alt', 'tab')
            self.last_swipe_time = now
        self.last_swipe_x = palm_x

    def _process_landmarks(self, frame, lm):
        if self.debug:
            draw_landmarks(frame, lm)

        idx_up   = finger_extended(lm[INDEX_TIP],  lm[INDEX_MCP])
        mid_up   = finger_extended(lm[MIDDLE_TIP], lm[MIDDLE_MCP])
        ring_up  = finger_extended(lm[RING_TIP],   lm[RING_MCP])
        pinky_up = finger_extended(lm[PINKY_TIP],  lm[PINKY_MCP])

        cv2.putText(frame, f"Reels Watched: {self.reel_count}", (420, 20), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        # 1. CLUTCH MODE (Only Pinky up)
        if pinky_up and not idx_up and not mid_up and not ring_up:
            cv2.putText(frame, "CLUTCH (tracking off)", (10, 45),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 80, 255), 1)
            self.last_swipe_x = None
            return

        # 2. APP SWITCHER MODE (Full open palm)
        if idx_up and mid_up and ring_up and pinky_up:
            self.handle_swipe(lm)
            cv2.putText(frame, "PALM — Alt+Tab", (10, 45),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 180, 0), 1)
            return

        # 3. MOUSE CLICK (Exactly 3 fingers up: Index, Middle, Ring)
        if idx_up and mid_up and ring_up and not pinky_up:
            self.handle_click()
            cv2.putText(frame, "3 FINGERS UP — Click 🖱️", (10, 45),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 255), 2)
            self.last_swipe_x = None
            return

        # 4. SCROLL DOWN (Exactly 2 fingers up: Index and Middle)
        if idx_up and mid_up and not ring_up and not pinky_up:
            self.handle_discrete_scroll("DOWN")
            cv2.putText(frame, "2 FINGERS UP — Scroll Down ↓", (10, 45),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
            self.last_swipe_x = None
            return

        # 5. SCROLL UP (Exactly 1 finger up: Index only)
        if idx_up and not mid_up and not ring_up and not pinky_up:
            self.handle_discrete_scroll("UP")
            cv2.putText(frame, "1 FINGER UP — Scroll Up ↑", (10, 45),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
            self.last_swipe_x = None
            return
            
        self.last_swipe_x = None

    def run(self):
        cap = cv2.VideoCapture(0)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH,  640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        print("Gesture Controller (Windows) started. Q=quit  P=pause  D=debug")

        frame_ts = 0  

        while True:
            ok, frame = cap.read()
            if not ok:
                break

            frame    = cv2.flip(frame, 1)
            frame_ts += 33   

            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('p'):
                self.paused = not self.paused
            elif key == ord('d'):
                self.debug = not self.debug

            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_img = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
            self.landmarker.detect_async(mp_img, frame_ts)

            status = "PAUSED" if self.paused else "ACTIVE"
            cv2.putText(frame, f"[{status}]  P=pause  D=debug  Q=quit",
                        (10, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                        (0, 200, 100) if not self.paused else (0, 80, 200), 1)

            result = self._latest_result
            if result and result.hand_landmarks and not self.paused:
                lm = result.hand_landmarks[0]
                self._process_landmarks(frame, lm)

            cv2.imshow("Gesture Controller — Windows (Q to quit)", frame)

        cap.release()
        cv2.destroyAllWindows()
        self.landmarker.close()


if __name__ == "__main__":
    if "--download-model" in sys.argv:
        download_model()
    else:
        GestureController().run()
