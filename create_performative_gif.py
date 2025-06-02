import numpy as np
# Set a fixed seed for reproducibility
np.random.seed(42)
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D
import os
from PIL import Image
import imageio.v2 as imageio
from scipy.optimize import minimize

# Create directories
performative_dir = "static/plots/performative_prediction"
os.makedirs(performative_dir, exist_ok=True)

# Parameters
NUM_ITERATIONS = 6  # Number of iterations in the model-data adaptation cycle
N_SAMPLES_GROUP1 = 250  # First group size
N_SAMPLES_GROUP2 = 125  # Second group size
SIGMA = 0.1  # Noise level

# Define more dramatic shift patterns to cover the full circle (0-2π)
SHIFT_PATTERNS = [
    {'angle': np.pi/3, 'direction': -1},    # Large shift counterclockwise
    {'angle': np.pi/2, 'direction': 1},     # 90 degrees clockwise
    {'angle': 2*np.pi/3, 'direction': -1},  # 120 degrees counterclockwise
    {'angle': np.pi/2, 'direction': 1},     # 90 degrees clockwise
    {'angle': np.pi/3, 'direction': -1},    # 60 degrees counterclockwise
    {'angle': np.pi/2, 'direction': 1},     # 90 degrees clockwise
]

# Function to generate circle data for Group A
def generate_circle_data_group_a(n_samples, sigma=0.1):
    # Generate random angles uniformly distributed from 0 to 2π
    theta_r = np.random.uniform(0, 2*np.pi, n_samples)
    
    # Generate points on the unit circle
    x1 = np.cos(theta_r)
    x2 = np.sin(theta_r)
    
    # Add random noise
    epsilon = np.random.normal(0, sigma, size=(n_samples, 2))
    
    # Create the data points with noise
    X = np.column_stack([x1, x2]) + epsilon
    
    # Determine labels based on a line with angle theta = pi/4
    slope = np.tan(np.pi/4)
    y = (X[:, 1] > slope * X[:, 0]).astype(int)
    
    # Create Pandas DataFrame
    df = pd.DataFrame({
        'x1': X[:, 0],
        'x2': X[:, 1],
        'y': y,
        'group': 'A'
    })
    
    return df

# Function to generate circle data for Group B
def generate_circle_data_group_b(n_samples, sigma=0.1, mean_angle=np.pi/4):
    # Generate random angles with wider distribution around the mean angle
    # Increase standard deviation to allow for more spread
    std_dev = np.pi/8  # Wider spread around the mean
    theta_r = np.random.normal(mean_angle, std_dev, n_samples)
    
    # Generate points on the unit circle
    x1 = np.cos(theta_r)
    x2 = np.sin(theta_r)
    
    # Add random noise
    epsilon = np.random.normal(0, sigma, size=(n_samples, 2))
    
    # Create the data points with noise
    X = np.column_stack([x1, x2]) + epsilon
    
    # Random labels (not based on decision boundary)
    y = np.random.randint(0, 2, size=n_samples)
    
    # Create Pandas DataFrame
    df = pd.DataFrame({
        'x1': X[:, 0],
        'x2': X[:, 1],
        'y': y,
        'group': 'B'
    })
    
    return df

# Function to calculate log loss
def calculate_log_loss(data, theta_val):
    # Get the slope of the line with the given angle
    slope = np.tan(theta_val)
    
    # Calculate the distance from each point to the decision boundary
    distances = (data['x2'] - slope * data['x1']) / np.sqrt(1 + slope**2)
    
    # Convert distances to probabilities using sigmoid function
    probabilities = 1 / (1 + np.exp(-5 * distances))
    
    # Calculate log loss
    epsilon = 1e-15
    probabilities = np.clip(probabilities, epsilon, 1 - epsilon)
    
    log_loss = -np.mean(
        data['y'] * np.log(probabilities) +
        (1 - data['y']) * np.log(1 - probabilities)
    )
    
    return log_loss

# Function to find optimal theta
def find_optimal_theta(data):
    # Define the objective function to minimize (log loss)
    def objective(theta_val):
        return calculate_log_loss(data, theta_val[0])
    
    # Initial guess
    initial_theta = np.pi/16
    
    # Bounds for theta (0 to pi/2)
    bounds = [(0, np.pi/2)]
    
    # Minimize the objective function
    result = minimize(objective, [initial_theta], bounds=bounds, method='L-BFGS-B')
    
    # Return the optimal theta value
    return result.x[0]

# Generate initial data
group_a_data = generate_circle_data_group_a(N_SAMPLES_GROUP1, SIGMA)
group_b_data = generate_circle_data_group_b(N_SAMPLES_GROUP2, SIGMA)

# Define color map for visualization
color_map = {
    ('A', 0): 'skyblue',
    ('A', 1): 'firebrick',
    ('B', 0): 'limegreen',  # Green for Group B
    ('B', 1): 'darkgreen'   # Dark green for Group B
}

# Initialize lists to store data for each iteration
all_data = []
all_models = []
all_losses = []

# Start with the original data
current_data = pd.concat([group_a_data, group_b_data], ignore_index=True)
all_data.append(current_data.copy())

# Find the initial optimal model
current_theta = find_optimal_theta(current_data)
all_models.append(current_theta)

# Calculate initial loss
current_loss = calculate_log_loss(current_data, current_theta)
all_losses.append(current_loss)

print(f"Initial model: θ = {current_theta:.4f} rad, Loss = {current_loss:.4f}")

# Perform iterations of model-data adaptation
for i in range(NUM_ITERATIONS):
    print(f"Iteration {i+1}/{NUM_ITERATIONS}")
    
    # 1. Extract Group B data from current data
    group_b_data = current_data[current_data['group'] == 'B'].copy()
    
    # 2. Shift Group B data in response to the current model using the predefined patterns
    # This creates more random, non-converging shifts
    shift_pattern = SHIFT_PATTERNS[i % len(SHIFT_PATTERNS)]
    shift_amount = shift_pattern['angle'] * shift_pattern['direction']
    
    # Calculate the original theta values (inverse tangent of x2/x1)
    original_theta = np.arctan2(
        group_b_data['x2'],
        group_b_data['x1']
    )
    
    # Apply the shift
    new_theta = original_theta + shift_amount
    
    # Convert back to Cartesian coordinates (preserving the radius)
    radius = np.sqrt(
        group_b_data['x1']**2 +
        group_b_data['x2']**2
    )
    
    # Update the coordinates for all points in Group B
    group_b_data['x1'] = radius * np.cos(new_theta)
    group_b_data['x2'] = radius * np.sin(new_theta)
    
    print(f"  Shifted Group B by {shift_amount:.4f} rad")
    
    # 3. Combine Group A with shifted Group B
    group_a_data = current_data[current_data['group'] == 'A'].copy()
    current_data = pd.concat([group_a_data, group_b_data], ignore_index=True)
    all_data.append(current_data.copy())
    
    # 4. Find the new optimal model for the shifted data
    current_theta = find_optimal_theta(current_data)
    all_models.append(current_theta)
    
    # 5. Calculate new loss
    current_loss = calculate_log_loss(current_data, current_theta)
    all_losses.append(current_loss)
    
    print(f"  New model: θ = {current_theta:.4f} rad, Loss = {current_loss:.4f}")

# Create frames for the GIF
frame_filenames = []

for i, (data, model, loss) in enumerate(zip(all_data, all_models, all_losses)):
    # Create a new figure with fixed dimensions
    fig, ax = plt.subplots(figsize=(10, 8))
    
    # Plot the data points by group and label
    for (group_name, label_val), group_df in data.groupby(['group', 'y']):
        color = color_map[(group_name, label_val)]
        ax.scatter(group_df['x1'], group_df['x2'],
                  c=color, marker='o', s=50, alpha=0.7)
    
    # Plot the model (decision boundary)
    x_vals = np.array([-1.5, 1.5])
    y_vals = np.tan(model) * x_vals
    ax.plot(x_vals, y_vals, color='#336699', linestyle='-', linewidth=2)
    
    # Add iteration information and loss
    iteration_text = "Initial State" if i == 0 else f"Iteration {i}"
    ax.set_title(f'Performative Prediction: {iteration_text}')
    
    # Add loss information in a fixed position to ensure consistent frame sizes
    # Use a fixed position in the top-right corner instead of relative to the model line
    ax.text(1.3, 1.3,
            f'Model θ: {model:.4f} rad ({model*180/np.pi:.1f}°)\nLoss: {loss:.4f}',
            fontsize=9, color='#336699', ha='right', va='top',
            bbox=dict(facecolor='white', alpha=0.95, edgecolor='#336699', pad=3))
    
    # Add explanation text based on iteration
    if i == 0:
        explanation = "Initial model fit to data"
    elif i % 2 == 1:
        explanation = "Group B (green) shifted in response to model"
    else:
        explanation = "Model adjusted to shifted data"
    
    # Fixed position for explanation text to ensure consistency
    ax.text(-1.4, -1.3, explanation, fontsize=12, color='black',
            bbox=dict(facecolor='white', alpha=0.8, edgecolor='gray', pad=5))
    
    # Add grid and set equal aspect ratio
    ax.grid(True, linestyle='--', alpha=0.6)
    ax.set_aspect('equal')
    
    # Set fixed axis limits to ensure consistent frame sizes
    ax.set_xlim(-1.5, 1.5)
    ax.set_ylim(-1.5, 1.5)
    
    # Remove axis ticks for cleaner visualization
    ax.set_xticks([])
    ax.set_yticks([])
    
    # Create a custom legend
    legend_elements = [
        Line2D([0], [0], marker='o', color='w', label='Group A, Label 0',
               markerfacecolor='skyblue', markersize=8),
        Line2D([0], [0], marker='o', color='w', label='Group A, Label 1',
               markerfacecolor='firebrick', markersize=8),
        Line2D([0], [0], marker='o', color='w', label='Group B, Label 0',
               markerfacecolor='limegreen', markersize=8),
        Line2D([0], [0], marker='o', color='w', label='Group B, Label 1',
               markerfacecolor='darkgreen', markersize=8),
        Line2D([0], [0], color='#336699', lw=2, linestyle='-', label='Model Decision Boundary')
    ]
    
    ax.legend(handles=legend_elements, title='Legend', loc='best')
    
    # Save the frame
    frame_filename = f"{performative_dir}/frame_{i:02d}.png"
    plt.savefig(frame_filename, dpi=300, bbox_inches='tight')
    frame_filenames.append(frame_filename)
    print(f"Frame saved to {frame_filename}")
    
    # Close the figure to free memory
    plt.close(fig)

# Create the GIF
gif_filename = f"{performative_dir}/performative_prediction.gif"

# Read all frames
frames = []
for filename in frame_filenames:
    frames.append(Image.open(filename))

# Save as GIF with slightly faster animation
frames[0].save(
    gif_filename,
    save_all=True,
    append_images=frames[1:],
    duration=800,  # Duration per frame in milliseconds (slightly faster)
    loop=0  # 0 means loop indefinitely
)

print(f"GIF saved to {gif_filename}")

# Create a static image showing all frames side by side for the blog
# Use a fixed height-to-width ratio for better presentation
fig, axes = plt.subplots(1, len(frames), figsize=(4*len(frames), 4))

for i, (ax, filename) in enumerate(zip(axes, frame_filenames)):
    img = plt.imread(filename)
    ax.imshow(img)
    ax.set_title(f"Step {i}")
    ax.axis('off')

plt.tight_layout()
static_filename = f"{performative_dir}/performative_prediction_steps.png"
plt.savefig(static_filename, dpi=300, bbox_inches='tight')
print(f"Combined image saved to {static_filename}")
plt.close(fig)

print("Done!")