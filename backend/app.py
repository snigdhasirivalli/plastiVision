"""
PlastiVision AI — Flask Application Entry Point
================================================
Run:
    cd backend
    python app.py

The server will start on http://localhost:5000
The React frontend proxies /api/* → http://localhost:5000/*
"""
import os
import sys

from flask import Flask
from flask_cors import CORS

# Ensure backend/ is importable from project root too
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import FLASK_HOST, FLASK_PORT, FLASK_DEBUG
from api.predict import predict_bp, init_model

app = Flask(__name__)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow the React dev server (port 5173) and any origin in production.
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173",
                                          "http://127.0.0.1:5173",
                                          "http://localhost:3000"]}})

# ── Register blueprints ───────────────────────────────────────────────────────
# All routes prefixed with nothing (Vite proxy rewrites /api → /)
app.register_blueprint(predict_bp)

# ── Root health check ─────────────────────────────────────────────────────────
@app.route("/", methods=["GET"])
def index():
    return {"service": "PlastiVision AI Backend", "version": "1.0.0"}, 200

# ── Load model on startup ─────────────────────────────────────────────────────
print("[PlastiVision] Starting Flask server...")
print("[PlastiVision] Loading ViT model...")
init_model()
print(f"[PlastiVision] Server ready at http://{FLASK_HOST}:{FLASK_PORT}")


if __name__ == "__main__":
    app.run(
        host=FLASK_HOST,
        port=FLASK_PORT,
        debug=FLASK_DEBUG,
        use_reloader=False,    # Disable reloader so model loads only once
    )
