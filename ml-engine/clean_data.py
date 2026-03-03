import pandas as pd
import sys
import os
import json

def clean_data(file_path):
    df = pd.read_csv(file_path)

    report = {}
    report["original_shape"] = df.shape

    # remove duplicate rows
    df = df.drop_duplicates()

    # missing values report
    report["missing_values"] = df.isnull().sum().to_dict()

    # drop columns with >50% missing
    threshold = len(df) * 0.5
    df = df.dropna(thresh=threshold, axis=1)

    # fill numeric nulls with mean
    for col in df.select_dtypes(include=["int64", "float64"]).columns:
        df[col] = df[col].fillna(df[col].mean())

    # fill categorical nulls with mode
    for col in df.select_dtypes(include=["object"]).columns:
        if not df[col].mode().empty:
            df[col] = df[col].fillna(df[col].mode()[0])

    report["cleaned_shape"] = df.shape

    return df, report