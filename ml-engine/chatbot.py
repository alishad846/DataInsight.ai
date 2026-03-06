import os
import json
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="AI Application Backend")

# =========================================
# CONFIG
# =========================================

BASE_DIR = os.getcwd()
DATA_DIR = os.path.join(BASE_DIR, "data")
ML_REPORT_PATH = os.path.join(DATA_DIR, "ml_report.json")

os.makedirs(DATA_DIR, exist_ok=True)

# =========================================
# REQUEST MODEL
# =========================================

class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None


# =========================================
# SYSTEM STATUS CHECK
# =========================================

def check_ml_status():
    if os.path.exists(ML_REPORT_PATH):
        return {
            "ml_pipeline_ready": True,
            "model_loaded": True
        }
    return {
        "ml_pipeline_ready": False,
        "model_loaded": False
    }


def check_llm_status():
    return True  # Replace with real LLM health check later


# =========================================
# INTENT DETECTION
# =========================================

def detect_intent(message: str):
    q = message.lower()

    greetings = ["hi", "hello", "how are you", "hey"]
    ml_keywords = [
        "accuracy", "precision", "recall",
        "f1", "model", "prediction",
        "confidence", "feature",
        "dataset", "overfitting"
    ]

    if any(word in q for word in greetings):
        return "general"

    if any(word in q for word in ml_keywords):
        return "ml"

    return "general"


# =========================================
# GENERAL AI REPLY (Mocked)
# =========================================

def generate_general_reply(message: str):
    return {
        "status": "success",
        "type": "general",
        "message": "Hello! I'm your AI assistant. Ask me about general topics or ML insights."
    }


# =========================================
# LOAD ML REPORT
# =========================================

def load_ml_report():
    if not os.path.exists(ML_REPORT_PATH):
        return None

    with open(ML_REPORT_PATH, "r") as f:
        return json.load(f)


# =========================================
# ML PIPELINE SIMULATION
# =========================================

def simulate_ml_run():
    dummy_report = {
        "model_name": "RandomForest",
        "accuracy": 0.91,
        "precision": 0.89,
        "recall": 0.88,
        "f1_score": 0.885,
        "feature_importance": {
            "Sales": 0.42,
            "Region": 0.21,
            "Category": 0.18,
            "Discount": 0.09
        },
        "class_distribution": {
            "Low Risk": 120,
            "High Risk": 45
        },
        "latest_prediction": "High Risk",
        "confidence": 0.87
    }

    with open(ML_REPORT_PATH, "w") as f:
        json.dump(dummy_report, f, indent=4)


# =========================================
# ML RESPONSE ENGINE
# =========================================

def generate_ml_reply(message: str, report: dict):
    q = message.lower()

    if "accuracy" in q:
        return f"Model accuracy is {report['accuracy']:.2f}"

    if "precision" in q:
        return f"Model precision is {report['precision']:.2f}"

    if "recall" in q:
        return f"Model recall is {report['recall']:.2f}"

    if "f1" in q:
        return f"Model F1 score is {report['f1_score']:.2f}"

    if "prediction" in q:
        return f"Latest prediction is {report['latest_prediction']}"

    if "confidence" in q:
        return f"Prediction confidence is {report['confidence']:.2f}"

    if "feature" in q:
        features = report.get("feature_importance", {})
        top_feature = max(features, key=features.get)
        return f"Top important feature is {top_feature} with score {features[top_feature]:.2f}"

    if "overfitting" in q:
        gap = report["accuracy"] - report["f1_score"]
        if gap > 0.1:
            return "Model shows signs of overfitting."
        return "No significant overfitting detected."

    return "Unsupported ML query."


# =========================================
# AI ROUTER
# =========================================

def route_message(message: str):
    intent = detect_intent(message)
    ml_status = check_ml_status()

    # GENERAL CONVERSATION
    if intent == "general":
        return generate_general_reply(message)

    # ML REQUEST
    if intent == "ml":

        if not ml_status["ml_pipeline_ready"]:
            return {
                "status": "blocked",
                "type": "ml",
                "message": "ML pipeline not executed. Run ML before asking ML-related questions."
            }

        if not ml_status["model_loaded"]:
            return {
                "status": "blocked",
                "type": "ml",
                "message": "Model not loaded."
            }

        report = load_ml_report()

        if not report:
            return {
                "status": "error",
                "type": "ml",
                "message": "ML report unavailable."
            }

        reply = generate_ml_reply(message, report)

        return {
            "status": "success",
            "type": "ml",
            "message": reply
        }

    return {
        "status": "error",
        "type": "system",
        "message": "Unable to process request."
    }


# =========================================
# ROUTES
# =========================================

@app.get("/system-status")
def system_status():
    ml_status = check_ml_status()

    return {
        "backend": True,
        "ml_pipeline_ready": ml_status["ml_pipeline_ready"],
        "model_loaded": ml_status["model_loaded"],
        "llm_available": check_llm_status()
    }


@app.post("/chat")
def chat(request: ChatRequest):
    return route_message(request.message)


@app.post("/run-ml")
def run_ml():
    simulate_ml_run()
    return {
        "status": "started",
        "message": "ML pipeline executed successfully."
    }


@app.get("/ml-report")
def ml_report():
    report = load_ml_report()
    if not report:
        return {
            "status": "error",
            "message": "No ML report available."
        }
    return report
