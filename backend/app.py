"""
PlastiVision AI — Flask Application Entry Point
================================================
Run:
    cd backend
    python app.py

The server will start on http://localhost:5000
Flask routes:
  GET  /                      → root info
  GET  /api/health            → model status
  POST /api/predict           → image classification
  GET  /api/dashboard         → analytics data
  GET  /api/model-performance → evaluation metrics
"""
import os
import sys

from flask import Flask, jsonify
from flask_cors import CORS

# Ensure backend/ is importable from project root too
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import FLASK_HOST, FLASK_PORT, FLASK_DEBUG
from api.predict import predict_bp, init_model

app = Flask(__name__)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow all origins so both Vite proxy and direct Axios calls work
CORS(app, resources={r"/*": {"origins": "*"}})

# ── Register blueprints ───────────────────────────────────────────────────────
# Prefix /api so routes match the frontend Axios calls exactly:
#   POST http://127.0.0.1:5000/api/predict
#   GET  http://127.0.0.1:5000/api/health
#   GET  http://127.0.0.1:5000/api/dashboard
#   GET  http://127.0.0.1:5000/api/model-performance
app.register_blueprint(predict_bp, url_prefix="/api")

# ── Root info ─────────────────────────────────────────────────────────────────
@app.route("/", methods=["GET"])
def index():
    return jsonify({"service": "PlastiVision AI Backend", "version": "1.0.0"}), 200



if __name__ == "__main__":
    print("[PlastiVision] Starting Flask local server...")
    init_model()
    print(f"[PlastiVision] Server ready at http://{FLASK_HOST}:{FLASK_PORT}")
    app.run(
        host=FLASK_HOST,
        port=FLASK_PORT,
        debug=FLASK_DEBUG,
        use_reloader=False,    # Disable reloader so model loads only once
    )

