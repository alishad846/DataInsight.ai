import tensorflow as tf 

a = tf.constant([1, 2, 3])  ##Create tensors
b = tf.constant([4, 5, 6])

add = tf.add(a, b)
multiply = tf.multiply(a, b)   ## Basic operations

print("Tensor A:", a)
print("Tensor B:", b)
print("Addition:", add)


"""
What is TensorFlow?
TensorFlow is an open-source machine learning framework developed by Google
used for building and training deep learning models.

Difference between NumPy and TensorFlow:
NumPy is mainly for numerical computing.
TensorFlow is designed for machine learning and supports GPU acceleration.

Why TensorFlow is used in ML systems?
It helps build scalable, production-ready deep learning systems.

"""