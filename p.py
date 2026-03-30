import cv2

def main():
    # Initialize the webcam
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Error: Could not open video stream.")
        return

    print("Operating 4 separate windows. Press 'q' in any window to exit.")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # 1. Process the frames
        # Window 1: Original Color
        q1_original = frame

        # Window 2: Grayscale
        q2_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Window 3: Gaussian Blur
        q3_blur = cv2.GaussianBlur(frame, (25, 25), 0)

        # Window 4: Canny Edge Detection
        q4_edges = cv2.Canny(frame, 100, 200)

        # 2. Display each in its own window
        # Each unique string creates a new window instance
        cv2.imshow('Original Feed', q1_original)
        cv2.imshow('Grayscale Mode', q2_gray)
        cv2.imshow('Blurred Vision', q3_blur)
        cv2.imshow('Edge Detection', q4_edges)

        # 3. Exit logic
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Cleanup
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()