# ============================
# Python Basics Revision
# ============================

# Variables
name = "Garv"
age = 21

# List
numbers = [1, 2, 3, 4, 5]

# Dictionary
student = {
    "name": "Garv",
    "branch": "CSE",
    "year": 3
}

# Loop
print("Numbers in list:")
for num in numbers:
    print(num)

# Conditional
if age > 18:
    print("Adult")
else:
    print("Minor")

# Function
def greet(name):
    return f"Hello, {name}"

print(greet(name))


# ============================
# Pandas CSV Task
# ============================

import pandas as pd

file_path = "sample.csv"

try:
    df = pd.read_csv(file_path)

    print("\nDataset Shape:", df.shape)
    print("\nColumn Names:", df.columns.tolist())
    print("\nMissing Values:\n", df.isnull().sum())

except FileNotFoundError:
    print("CSV file not found. Please check the file path.")


import tensorflow as tf

# Print TensorFlow version
print("TensorFlow Version:", tf.__version__)

# Create simple tensors
tensor1 = tf.constant([1, 2, 3])
tensor2 = tf.constant([4, 5, 6])

# Perform basic operations
addition = tensor1 + tensor2
multiplication = tensor1 * tensor2

# Print results
print("Tensor 1:", tensor1.numpy())
print("Tensor 2:", tensor2.numpy())
print("Addition:", addition.numpy())
print("Multiplication:", multiplication.numpy())
