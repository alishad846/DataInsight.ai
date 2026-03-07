# Model Evaluation – Day 6

## Baseline Model
1. Architecture: 1 Hidden Layer 
2. Epochs: 50 ( 34 rows 50 times to learn)
3. Test MAE: 2537.93

## Improved Model

### What Was Changed
1. Added an extra hidden layer
2. Increased number of neurons
3. Applied feature scaling using StandardScaler
4. Increased training epochs to 100

### Why These Changes Were Made
1. Adding another hidden layer allows the model to learn more complex patterns.
2. Increasing neurons improves the model’s learning capacity.
3. Feature scaling helps neural networks train more efficiently and converge faster.
4. Increasing epochs gives the model more time to learn from the data.

## Performance Comparison
Baseline MAE: 2537.93
Improved MAE: 2531.06
The improved model reduced the prediction error slightly.

## Observations
1. Training loss decreased steadily across epochs.
2. Validation loss remained slightly higher than training loss.
3. No strong signs of overfitting were observed.
4. Improvement is limited due to small dataset size (34 rows).

## Conclusion
The improved model performs slightly better than the baseline model. 
However, the improvement is small because the dataset is very small. 
Larger datasets may lead to better performance gains.