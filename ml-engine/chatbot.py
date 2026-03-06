import sys
import os
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REPORT_PATH = os.path.join(BASE_DIR, "reports", "final_report_v1.md")


def load_report():
    if not os.path.exists(REPORT_PATH):
        return None

    with open(REPORT_PATH, "r", encoding="utf-8") as f:
        return f.read()


def extract_section(report_text, section_name):
    lines = report_text.split("\n")
    section_content = []
    capture = False

    for line in lines:
        if section_name.lower() in line.lower():
            capture = True
            continue

        if capture:
            if line.startswith("## "):  # next section starts
                break
            section_content.append(line.strip())

    return " ".join(section_content).strip()


def answer_from_report(question, report_text):
    q = question.lower()
    lines = report_text.split("\n")

    ## METRICS 
    if any(word in q for word in ["rmse", "error"]):
        for line in lines:
            if "rmse" in line.lower():
                return line.strip()

    if any(word in q for word in ["r2", "r²", "accuracy", "accurate", "performance"]):
        for line in lines:
            if "r²" in line.lower() or "r2" in line.lower():
                return line.strip()

    ## LIMITATIONS 
    if any(word in q for word in ["limitation", "weakness"]):
        content = extract_section(report_text, "Limitations")
        return content if content else "No limitations found in report."

    ## RECOMMENDATIONS
    if any(word in q for word in ["recommendation", "suggestion"]):
        content = extract_section(report_text, "Recommendations")
        return content if content else "No recommendations found in report."

    ## DATASET INFO
    if "rows" in q:
        for line in lines:
            if "total rows" in line.lower():
                return line.strip()

    if "columns" in q:
        for line in lines:
            if "total columns" in line.lower():
                return line.strip()

    return "This information is not available in the report."


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No question provided"}))
        return

    question = sys.argv[1]

    report_text = load_report()

    if not report_text:
        print(json.dumps({"error": "Report not found"}))
        return

    answer = answer_from_report(question, report_text)

    print(json.dumps({
        "question": question,
        "answer": answer
    }))


if __name__ == "__main__":
    main()