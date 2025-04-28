## Training Fair Models That Affect Their Data

The way models classically work is you have training data, you train your model
on said data, then you deploy the model into the real world. The assumption is whatever data
you use to train your data will be an accurate representation of what the model will see in the real world (i.e., identically distributed). What happens if this isn't the case? Worse, what happens if the action of deploying the model is explicitly what causes the real world to be different from its training data? How do we get around this? How can we train our
models to be more efficient in these situations? 

This problem becomes even more critical when we consider fairness. Many models are trained to perform well on average cases, which can lead them to ignore or underperform on minority groups within the data. These biases don't just affect model performance; they can be actively reinforced when the model's decisions influence future data. For example, a loan approval model that performs worse for minority groups might reject more applications from these groups unjustly, leading to worse financial outcomes and reinforcing the very disparities present in the training data.

My current research looks to solve this problem. Here's the journey I'm going to take you on,

1. Performative Prediction 
    - When models change their data
2. Distributionally Robust Optimization
    - Making models robust to changes
3. Combining the two
    - Training fair models that affect their data


### 1. Performative Prediction
Okay first, what is performative prediction. As we are all aware, machine learning (ML) models are being used more widely than ever for decisions in almost all areas of life. Whether it's in analyzing medical images<sup>[1]</sup>, fraud-detection<sup>[2]</sup>, or credit risk<sup>[2]</sup>, machine learning is taking more and more precedence in our lives. As these models start making decisions on increasingly more important data, and larger institutions start using them, we face the very real problem of the models making decisions that influence the outcome they are trying to predict. This is called *performative prediction*.

For example, lets look at fraud detection. Let's assume we are performing binary classification on the following data, 



### References

**[1]** Alowais, S. A., et al. (2023). Revolutionizing healthcare: the role of artificial intelligence in clinical practice. BMC Medical Education, 23(1), 689. <a href="https://doi.org/10.1186/s12909-023-04698-z">https://doi.org/10.1186/s12909-023-04698-z</a>

**[2]** Vidovic, L., & Yue, L. (2020). Machine Learning and Credit Risk Modelling. S&P Global Market Intelligence. White Paper.
 