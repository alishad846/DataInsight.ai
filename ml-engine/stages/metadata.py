# stages/metadata.py

def generate_metadata(original_df, cleaned_df):
    report = {}

    report["original_shape"] = original_df.shape
    report["cleaned_shape"] = cleaned_df.shape
    report["missing_values"] = original_df.isnull().sum().to_dict()

    return report