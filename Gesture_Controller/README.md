Gesture Controller(Best for scrolling reels in instagram) — Windows  (MediaPipe 0.10+ compatible)
===========================================================
Requirements:
    pip install mediapipe opencv-python pyautogui numpy

Step 1 — download the hand landmark model (run once):
    python gesture_controller_windows.py --download-model

Step 2 — run:
    python gesture_controller_windows.py

Controls:
    Q  — quit
    P  — pause / resume
    D  — toggle debug overlay

Gestures:
    ☝ 1 Finger Up (Index)      → Discrete Scroll Up (Previous Reel)
    ✌ 2 Fingers Up (Idx+Mid)    → Discrete Scroll Down (Next Reel) + Counter Increases
    🤟 3 Fingers Up (Idx+Mid+Rng) → Left Mouse Click at current cursor position
    🖐 Open palm + swipe          → Alt+Tab
    🤙 Pinky up only              → CLUTCH (freeze tracking)

