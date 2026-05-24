# Keyboard Event Listener (Educational Reference)

This repository contains a simple Python script demonstrating how to capture and log keyboard inputs to a local file using the `pynput` library. 

This project is intended **strictly for educational purposes, authorization testing, and self-monitoring demonstrations**.

---

## ⚠️ Disclaimer

> **FOR EDUCATIONAL PURPOSES ONLY.** > This software is provided for educational and research purposes to understand input handling, asynchronous event listeners, and local file I/O operations in Python. 
> 
> Unauthorized monitoring of user keystrokes without explicit consent is illegal and a violation of privacy laws in most jurisdictions. The author assumes no liability for misuse, damage, or legal consequences resulting from the use or modification of this code. Always ensure you have explicit, written permission before running input-tracking scripts on any machine.

---

## 🛠️ Features

- **Asynchronous Listening**: Uses a background thread via `pynput.keyboard.Listener` to monitor system-wide keyboard events without blocking execution.
- **Character Filtering**: Safely extracts standard alphanumeric characters (`key.char`) while handling specialized formatting for control keys (e.g., Space, Enter, Shift).
- **Persistent Storage**: Appends data sequentially to a local text file (`a.txt`), preventing existing logs from being overwritten.

---

## 📋 Prerequisites

To run this script, you must have Python 3.x installed along with the `pynput` package.

### Installation

Install the required library using `pip`:

```bash
pip install pynput