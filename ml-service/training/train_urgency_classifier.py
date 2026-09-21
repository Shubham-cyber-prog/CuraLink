"""
Train Symptom Urgency Text Classifier
TF-IDF Vectorization + Model Comparison (Logistic Regression vs. Multinomial Naive Bayes)
Selects and persists the best performing model for LOW, MEDIUM, and HIGH clinical urgency classification.
"""
import os
import sys
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
)
import joblib

CLASSES = ["LOW", "MEDIUM", "HIGH"]

def train_and_evaluate():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(current_dir, "..", "models")
    os.makedirs(models_dir, exist_ok=True)

    dataset_path = os.path.join(current_dir, "urgency_dataset.csv")
    df = pd.read_csv(dataset_path)

    print(f"Loaded {len(df)} symptom records from {dataset_path}", flush=True)
    print(f"Class distribution:\n{df['urgency_label'].value_counts()}", flush=True)

    X_texts = df["symptom_text"].values
    y = df["urgency_label"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X_texts, y, test_size=0.20, random_state=42, stratify=y
    )

    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        sublinear_tf=True,
        min_df=1,
        max_features=2000,
        stop_words="english",
    )

    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    print(f"\nVocabulary size: {len(vectorizer.vocabulary_)} features", flush=True)

    # 1. Evaluate Logistic Regression
    lr = LogisticRegression(max_iter=1000, random_state=42, C=2.0)
    lr.fit(X_train_vec, y_train)
    lr_pred = lr.predict(X_test_vec)
    lr_acc = accuracy_score(y_test, lr_pred)
    lr_f1 = f1_score(y_test, lr_pred, average="weighted")

    # 2. Evaluate Multinomial Naive Bayes
    nb = MultinomialNB(alpha=0.3)
    nb.fit(X_train_vec, y_train)
    nb_pred = nb.predict(X_test_vec)
    nb_acc = accuracy_score(y_test, nb_pred)
    nb_f1 = f1_score(y_test, nb_pred, average="weighted")

    print("\n" + "=" * 60, flush=True)
    print("  MODEL COMPARISON (TF-IDF + CLASSIFIER on 20% Test Set)", flush=True)
    print("=" * 60, flush=True)
    print(f"  Logistic Regression : Accuracy = {lr_acc:.4f} ({lr_acc*100:.1f}%), Weighted F1 = {lr_f1:.4f}", flush=True)
    print(f"  Multinomial NB      : Accuracy = {nb_acc:.4f} ({nb_acc*100:.1f}%), Weighted F1 = {nb_f1:.4f}", flush=True)

    # Choose the superior model
    if lr_f1 >= nb_f1:
        best_model = lr
        best_name = "Logistic Regression"
        best_pred = lr_pred
        best_acc = lr_acc
        best_f1 = lr_f1
    else:
        best_model = nb
        best_name = "Multinomial Naive Bayes"
        best_pred = nb_pred
        best_acc = nb_acc
        best_f1 = nb_f1

    print(f"\n[WINNER] Selected Top Performer: {best_name}", flush=True)
    print("\nDetailed Classification Report on Test Set:")
    report = classification_report(y_test, best_pred, target_names=CLASSES, digits=4)
    print(report, flush=True)

    cm = confusion_matrix(y_test, best_pred, labels=CLASSES)
    print("Confusion Matrix (Rows: True, Cols: Pred):")
    print(f"          LOW  MED HIGH")
    for idx, cname in enumerate(CLASSES):
        print(f"  {cname:6s}: {cm[idx][0]:4d} {cm[idx][1]:4d} {cm[idx][2]:4d}", flush=True)

    # Test sample clinical queries
    test_cases = [
        "I have a mild headache since yesterday",
        "I have had a fever of 101F for 3 days",
        "High fever of 103.5F with rigors, bloody urine and severe back pain",
    ]
    print("\nSanity Check Sample Predictions:", flush=True)
    for text in test_cases:
        vec = vectorizer.transform([text])
        pred_label = best_model.predict(vec)[0]
        probs = best_model.predict_proba(vec)[0]
        prob_dict = {c: round(float(p), 3) for c, p in zip(best_model.classes_, probs)}
        print(f"  Query: \"{text[:50]}...\"", flush=True)
        print(f"  -> Predicted: {pred_label} (Confidence: {max(probs)*100:.1f}%, Probs: {prob_dict})\n", flush=True)

    # Save artifacts
    model_path = os.path.join(models_dir, "urgency_model.joblib")
    vectorizer_path = os.path.join(models_dir, "urgency_vectorizer.joblib")
    metadata_path = os.path.join(models_dir, "urgency_metadata.joblib")

    joblib.dump(best_model, model_path)
    joblib.dump(vectorizer, vectorizer_path)
    joblib.dump({
        "model_type": best_name,
        "classes": list(best_model.classes_),
        "metrics": {
            "accuracy": float(best_acc),
            "f1_weighted": float(best_f1),
            "lr_acc": float(lr_acc),
            "nb_acc": float(nb_acc),
        },
        "vocabulary_size": len(vectorizer.vocabulary_),
    }, metadata_path)

    print(f"Saved model to: {model_path}", flush=True)
    print(f"Saved vectorizer to: {vectorizer_path}", flush=True)
    print(f"Saved metadata to: {metadata_path}", flush=True)
    return best_acc, best_f1

if __name__ == "__main__":
    train_and_evaluate()
