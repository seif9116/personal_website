import numpy as np
# Set a fixed seed for reproducibility
np.random.seed(42)
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D # Needed for custom legend
import scipy.special # For logit function
from scipy.optimize import minimize # For finding optimal theta

# Global parameters
theta = np.pi/4  # 45 degrees as default
initial_guess = np.pi/16  # Initial guess at pi/16 radians
# Save the current line of best fit value for reference
BEST_FIT_THETA = 0.7955  # 45.6 degrees (0.7955 rad)
ORIGINAL_LOSS = 0.3611  # Original loss value for reference
DIFFERENTIATE_GROUPS = False  # Set to True to differentiate between groups
SHOW_GROUP_A = True  # Set to True to show Group A
SHOW_GROUP_B = True  # Set to True to show Group B
SHOW_SHIFTED_GROUP_B = False  # Set to True to show the shifted Group B
SHOW_LABEL_0 = True  # Set to True to show blue circles (Label 0)
SHOW_LABEL_1 = True  # Set to True to show red circles (Label 1)
SHOW_INITIAL_GUESS = False  # Set to True to show initial guess line at pi/16
SHOW_LOSS = True  # Set to True to display loss value on plot
SHOW_PERTURBATIONS = False  # Set to True to show perturbations of the initial guess
SHOW_BEST_GUESS = True  # Set to True to show the best guess that minimizes loss

# Global variables for multiple shifted versions of Group B
GENERATE_MULTIPLE_SHIFTS = True  # Set to True to generate multiple shifted versions of Group B
NUM_SHIFTS = 10  # Number of different shifted versions to generate
SHIFT_VARIATION = 0.5  # Controls the diversity of shifts (higher = more diverse)

def generate_circle_data(n_samples, sigma=0.1):
    """
    Generates synthetic binary classification data where points fall roughly on the unit circle.
    Classification is determined by whether points fall above or below a line with angle theta.
    
    Args:
        n_samples (int): Total number of data points to generate.
        sigma (float): Standard deviation of the normal noise added to the unit circle.
        
    Returns:
        pd.DataFrame: DataFrame containing features (x1, x2) and labels (y).
    """
    # Generate random angles uniformly distributed from 0 to 2π
    theta_r = np.random.uniform(0, 2*np.pi, n_samples)
    
    # Generate points on the unit circle
    x1 = np.cos(theta_r)
    x2 = np.sin(theta_r)
    
    # Add random noise
    epsilon = np.random.normal(0, sigma, size=(n_samples, 2))
    
    # Create the data points with noise
    X = np.column_stack([x1, x2]) + epsilon
    
    # Determine labels based on the line with angle theta
    # The line equation is: x2 = tan(theta) * x1
    # Points above the line: x2 > tan(theta) * x1
    slope = np.tan(theta)
    y = (X[:, 1] > slope * X[:, 0]).astype(int)
    
    # Create Pandas DataFrame
    df = pd.DataFrame({
        'x1': X[:, 0],
        'x2': X[:, 1],
        'y': y
    })
    
    return df

def calculate_log_loss(data, theta_val):
    """
    Calculate the log loss (binary cross-entropy) for a given decision boundary angle.
    
    Args:
        data (pd.DataFrame): DataFrame containing features (x1, x2) and labels (y).
        theta_val (float): Angle in radians defining the decision boundary.
        
    Returns:
        float: The log loss value.
    """
    # Get the slope of the line with the given angle
    slope = np.tan(theta_val)
    
    # Calculate the predicted values (1 if above the line, 0 if below)
    # For probabilistic predictions, we need values between 0 and 1
    # We'll use the distance from the decision boundary to create probabilities
    
    # Calculate the distance from each point to the decision boundary
    # Line equation: x2 = slope * x1
    # Distance = |x2 - slope*x1| / sqrt(1 + slope^2)
    distances = (data['x2'] - slope * data['x1']) / np.sqrt(1 + slope**2)
    
    # Convert distances to probabilities using sigmoid function
    # Points above the line (positive distance) get p > 0.5
    # Points below the line (negative distance) get p < 0.5
    probabilities = 1 / (1 + np.exp(-5 * distances))  # Scale factor 5 for sharper transition
    
    # Calculate log loss
    # Avoid log(0) by clipping probabilities
    epsilon = 1e-15
    probabilities = np.clip(probabilities, epsilon, 1 - epsilon)
    
    # Log loss formula: -1/N * Σ[y_i * log(p_i) + (1-y_i) * log(1-p_i)]
    log_loss = -np.mean(
        data['y'] * np.log(probabilities) +
        (1 - data['y']) * np.log(1 - probabilities)
    )
    
    return log_loss

def find_optimal_theta(data):
    """
    Find the optimal theta value that minimizes the log loss.
    
    Args:
        data (pd.DataFrame): DataFrame containing features (x1, x2) and labels (y).
        
    Returns:
        float: The optimal theta value in radians.
    """
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

# --- Example Usage ---
N_SAMPLES_GROUP1 = 250  # First group size
N_SAMPLES_GROUP2 = 125  # Second group size (1/4 of first group)
SIGMA = 0.1

# Generate the first group of data using the function
circle_data_group1 = generate_circle_data(N_SAMPLES_GROUP1, SIGMA)
circle_data_group1['group'] = 'A'  # Add group identifier

# Generate the second group with theta_r in [π/8, 3π/8]
def generate_circle_data_group2(n_samples, sigma=0.1, mean_angle=np.pi/4):
    """
    Generates second group of data points with theta_r normally distributed
    around the specified mean angle and random labels.
    
    Args:
        n_samples (int): Number of samples to generate
        sigma (float): Standard deviation of the noise
        mean_angle (float): Mean angle in radians for the distribution
    """
    # Generate random angles normally distributed around the mean angle
    std_dev = np.pi/16  # A reasonable spread around the mean
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
        'y': y
    })
    
    return df

# Generate the second group (original position)
circle_data_group2 = generate_circle_data_group2(N_SAMPLES_GROUP2, SIGMA)
circle_data_group2['group'] = 'B'  # Add group identifier

# Generate the shifted second group with mean at 3π/16
circle_data_group2_shifted = generate_circle_data_group2(N_SAMPLES_GROUP2, SIGMA, mean_angle=np.pi/16)
circle_data_group2_shifted['group'] = 'B_shifted'  # Add group identifier

def generate_multiple_shifted_group_b(base_group_b, n_shifts=NUM_SHIFTS, sigma=SIGMA, variation=SHIFT_VARIATION):
    """
    Generates multiple variations of shifted Group B points.
    
    Args:
        base_group_b (pd.DataFrame): The original Group B dataframe
        n_shifts (int): Number of different shifted versions to generate
        sigma (float): Standard deviation of the noise
        variation (float): Controls how diverse the shifts are
        
    Returns:
        list: List of dataframes, each containing a shifted version of Group B
    """
    shifted_groups = []
    
    # Generate shifts "all over the place" by using different mean angles
    # Distribute angles across the circle for diversity
    for i in range(n_shifts):
        # Create diverse mean angles between 0 and 2π
        mean_angle = (i / n_shifts) * 2 * np.pi * variation
        
        # Generate a new shifted group
        shifted_group = generate_circle_data_group2(
            n_samples=len(base_group_b),
            sigma=sigma,
            mean_angle=mean_angle
        )
        
        # Add group identifier with index
        shifted_group['group'] = f'B_shifted_{i}'
        
        shifted_groups.append(shifted_group)
    
    return shifted_groups

# Generate multiple shifted versions of Group B if enabled
multiple_shifted_groups = []
if GENERATE_MULTIPLE_SHIFTS:
    multiple_shifted_groups = generate_multiple_shifted_group_b(circle_data_group2)

# Create a modified version of Group B for the new evaluation scenario
# Start with a copy of the original Group B data
circle_data_group2_modified = circle_data_group2.copy()

# Only modify the theta values for label 1 points in Group B
# Subtract 3π/16 from each point's theta value for label 1 points
label_1_mask = circle_data_group2_modified['y'] == 1
if any(label_1_mask):
    # Calculate the original theta values (inverse tangent of x2/x1)
    original_theta = np.arctan2(
        circle_data_group2_modified.loc[label_1_mask, 'x2'],
        circle_data_group2_modified.loc[label_1_mask, 'x1']
    )
    
    # Subtract 3π/16 from the theta values
    shift_amount = 3 * np.pi / 16
    new_theta = original_theta - shift_amount
    
    # Convert back to Cartesian coordinates (preserving the radius)
    radius = np.sqrt(
        circle_data_group2_modified.loc[label_1_mask, 'x1']**2 +
        circle_data_group2_modified.loc[label_1_mask, 'x2']**2
    )
    
    # Update the coordinates
    circle_data_group2_modified.loc[label_1_mask, 'x1'] = radius * np.cos(new_theta)
    circle_data_group2_modified.loc[label_1_mask, 'x2'] = radius * np.sin(new_theta)

# Mark this as the modified group
circle_data_group2_modified['group'] = 'B_modified'

# Combine groups for the new evaluation scenario
circle_data = pd.concat([circle_data_group1, circle_data_group2_modified], ignore_index=True)

# Calculate loss using the original best fit value on the modified data
modified_loss = calculate_log_loss(circle_data, BEST_FIT_THETA)
print(f"\nOriginal loss with best fit (θ={BEST_FIT_THETA:.4f} rad): {ORIGINAL_LOSS:.4f}")
print(f"New loss with modified Group B label 1 points: {modified_loss:.4f}")
print(f"Difference in loss: {modified_loss - ORIGINAL_LOSS:.4f}")

# --- Display Sample Output ---
print("Generated Data Head:")
print(circle_data.head())
print(f"\nTotal samples generated: {len(circle_data)}")
print("\nValue Counts for Labels (y):")
print(circle_data['y'].value_counts(normalize=True))

# --- Visualize the Data using Matplotlib ---
fig, ax = plt.subplots(figsize=(10, 8))

# Define colors based on which groups are shown and differentiation setting
# Check if only one group is shown (XOR)
only_one_group = (SHOW_GROUP_A and not SHOW_GROUP_B) or (SHOW_GROUP_B and not SHOW_GROUP_A)

if DIFFERENTIATE_GROUPS and not only_one_group:
    # Different colors for each group and label
    color_map = {
        # Original colors for Group A
        ('A', 0): 'skyblue',
        ('A', 1): 'firebrick',
        # New colors for Group B
        ('B', 0): 'limegreen',
        ('B', 1): 'darkgreen',
        # Colors for shifted Group B (green)
        ('B_shifted', 0): 'limegreen',
        ('B_shifted', 1): 'darkgreen'
    }
else:
    # Same colors regardless of group, except for modified Group B label 1 points
    color_map = {
        ('A', 0): 'skyblue',
        ('A', 1): 'firebrick',
        ('B', 0): 'skyblue',
        ('B', 1): 'firebrick',
        ('B_shifted', 0): 'limegreen',
        ('B_shifted', 1): 'darkgreen',
        ('B_modified', 0): 'skyblue',
        ('B_modified', 1): 'green'  # Changed to green as requested
    }

# Use a consistent marker
marker = 'o'

# Scatter plot points by group and label
for (group_name, label_val), group_df in circle_data.groupby(['group', 'y']):
    # Skip groups that are not shown
    if (group_name == 'A' and not SHOW_GROUP_A) or \
       (group_name == 'B' and not SHOW_GROUP_B) or \
       (group_name == 'B_shifted' and not SHOW_SHIFTED_GROUP_B):
        continue
    
    # Skip labels that are not shown
    if (label_val == 0 and not SHOW_LABEL_0) or (label_val == 1 and not SHOW_LABEL_1):
        continue
        
    color = color_map[(group_name, label_val)]
    ax.scatter(group_df['x1'], group_df['x2'],
               c=color,        # Use the color from the map
               marker=marker,  # Use consistent marker
               s=50, alpha=0.7) # Adjust size and transparency

# Add titles and labels
# Use matplotlib's built-in math rendering
if SHOW_INITIAL_GUESS:
    ax.set_title('Binary Classification with Initial Guess')
else:
    ax.set_title('Binary Classification Data')
#if DIFFERENTIATE_GROUPS:
#    ax.set_title(r'Binary Classification ($\theta=\pi/4$ radians)')
#else:
#    ax.set_title(r'Circle Classification Data without Group Differentiation ($\theta=\pi/4$ radians)')
#ax.set_xlabel('Feature x1')
#ax.set_ylabel('Feature x2')

# Add grid
ax.grid(True, linestyle='--', alpha=0.6)

# Plot the decision boundary line
# Line with angle theta passing through origin
x_vals = np.array([-1.5, 1.5])
#y_vals = np.tan(theta) * x_vals
#ax.plot(x_vals, y_vals, color='black', linestyle='--', label='Decision Boundary')

# Plot the best guess line if enabled
if SHOW_BEST_GUESS:
    # Use the predefined best fit theta instead of finding it
    best_theta = BEST_FIT_THETA
    best_loss = modified_loss
    
    # Plot the best guess line with a more subdued color
    best_y_vals = np.tan(best_theta) * x_vals
    ax.plot(x_vals, best_y_vals, color='#336699', linestyle='-', linewidth=2, label='Best Guess')
    
    # Add the loss value as text near the line if SHOW_LOSS is enabled
    if SHOW_LOSS:
        # Find a good position for the text (near the right end of the line)
        text_x = 1.0  # X coordinate for text
        text_y = np.tan(best_theta) * text_x  # Y coordinate on the line
        
        # Add some offset to place text above the line
        text_y_offset = 0.1
        
        # Display the loss value with less transparency and a matching edge color
        ax.text(text_x, text_y + text_y_offset,
                f'Best θ: {best_theta:.4f} rad ({best_theta*180/np.pi:.1f}°)\nOriginal Loss: {ORIGINAL_LOSS:.4f}\nNew Loss: {best_loss:.4f}\nDiff: {best_loss - ORIGINAL_LOSS:.4f}',
                fontsize=9, color='#336699', ha='right', va='bottom',
                bbox=dict(facecolor='white', alpha=0.95, edgecolor='#336699', pad=3))
    
    # Update the title to reflect the best guess
    ax.set_title('Binary Classification with Best Guess')
# Plot the initial guess line if enabled
elif SHOW_INITIAL_GUESS:
    # Calculate log loss for the initial guess
    initial_loss = calculate_log_loss(circle_data, initial_guess)
    
    # Plot the initial guess line
    initial_y_vals = np.tan(initial_guess) * x_vals
    ax.plot(x_vals, initial_y_vals, color='gray', linestyle='-', linewidth=2, label='Initial Guess')
    
    # Add the loss value as text near the line if SHOW_LOSS is enabled
    if SHOW_LOSS:
        # Find a good position for the text (near the right end of the line)
        text_x = 1.0  # X coordinate for text
        text_y = np.tan(initial_guess) * text_x  # Y coordinate on the line
        
        # Add some offset to place text above the line
        text_y_offset = 0.1
        
        # Display the loss value with less transparency and a gray edge
        ax.text(text_x, text_y + text_y_offset, f'Log Loss: {initial_loss:.4f}',
                fontsize=9, color='gray', ha='right', va='bottom',
                bbox=dict(facecolor='white', alpha=0.95, edgecolor='gray', pad=3))
    
    # Plot perturbations of the initial guess if enabled
    if SHOW_PERTURBATIONS:
        # Define perturbation amount
        perturbation = np.pi/32
        
        # Upper perturbation (initial_guess + perturbation)
        upper_guess = initial_guess + perturbation
        upper_loss = calculate_log_loss(circle_data, upper_guess)
        upper_y_vals = np.tan(upper_guess) * x_vals
        ax.plot(x_vals, upper_y_vals, color='lightgray', linestyle='--', linewidth=1.5, label='Upper Perturbation')
        
        # Add loss value for upper perturbation
        if SHOW_LOSS:
            upper_text_y = np.tan(upper_guess) * text_x
            ax.text(text_x, upper_text_y + text_y_offset, f'Log Loss: {upper_loss:.4f}',
                    fontsize=9, color='gray', ha='right', va='bottom',
                    bbox=dict(facecolor='white', alpha=0.95, edgecolor='gray', pad=3))
        
        # Lower perturbation (initial_guess - perturbation)
        lower_guess = initial_guess - perturbation
        lower_loss = calculate_log_loss(circle_data, lower_guess)
        lower_y_vals = np.tan(lower_guess) * x_vals
        ax.plot(x_vals, lower_y_vals, color='lightgray', linestyle='--', linewidth=1.5, label='Lower Perturbation')
        
        # Add loss value for lower perturbation
        if SHOW_LOSS:
            lower_text_y = np.tan(lower_guess) * text_x
            ax.text(text_x, lower_text_y + text_y_offset, f'Log Loss: {lower_loss:.4f}',
                    fontsize=9, color='gray', ha='right', va='bottom',
                    bbox=dict(facecolor='white', alpha=0.95, edgecolor='gray', pad=3))

# Plot the unit circle for reference
circle = plt.Circle((0, 0), 1, fill=False, color='gray', linestyle='-', linewidth=1)
#ax.add_patch(circle)

# Set equal aspect ratio to make the circle look circular
ax.set_aspect('equal')

# Set axis limits
ax.set_xlim(-1.5, 1.5)
ax.set_ylim(-1.5, 1.5)

# Create a custom legend manually for clarity
legend_elements = []

# Add data points to legend based on which groups and labels are shown
if SHOW_GROUP_A and (SHOW_GROUP_B or SHOW_SHIFTED_GROUP_B) and DIFFERENTIATE_GROUPS:
    # Full legend with group differentiation
    if SHOW_LABEL_0:
        legend_elements.extend([
            Line2D([0], [0], marker=marker, color='w', label='Group A, Label 0', markerfacecolor=color_map[('A', 0)], markersize=8)
        ])
        if SHOW_GROUP_B:
            legend_elements.append(Line2D([0], [0], marker=marker, color='w', label='Group B, Label 0', markerfacecolor=color_map[('B', 0)], markersize=8))
        if SHOW_SHIFTED_GROUP_B:
            legend_elements.append(Line2D([0], [0], marker=marker, color='w', label='Group B (Shifted), Label 0', markerfacecolor=color_map[('B_shifted', 0)], markersize=8))
    if SHOW_LABEL_1:
        legend_elements.extend([
            Line2D([0], [0], marker=marker, color='w', label='Group A, Label 1', markerfacecolor=color_map[('A', 1)], markersize=8)
        ])
        if SHOW_GROUP_B:
            legend_elements.append(Line2D([0], [0], marker=marker, color='w', label='Group B, Label 1', markerfacecolor=color_map[('B', 1)], markersize=8))
        if SHOW_SHIFTED_GROUP_B:
            legend_elements.append(Line2D([0], [0], marker=marker, color='w', label='Group B (Shifted), Label 1', markerfacecolor=color_map[('B_shifted', 1)], markersize=8))
elif SHOW_GROUP_A and not SHOW_GROUP_B:
    # Only Group A
    if SHOW_LABEL_0:
        legend_elements.append(Line2D([0], [0], marker=marker, color='w', label='Group A, Label 0', markerfacecolor='skyblue', markersize=8))
    if SHOW_LABEL_1:
        legend_elements.append(Line2D([0], [0], marker=marker, color='w', label='Group A, Label 1', markerfacecolor='firebrick', markersize=8))
elif SHOW_GROUP_B and not SHOW_GROUP_A:
    # Only Group B
    if SHOW_LABEL_0:
        legend_elements.append(Line2D([0], [0], marker=marker, color='w', label='Group B, Label 0', markerfacecolor='skyblue', markersize=8))
    if SHOW_LABEL_1:
        legend_elements.append(Line2D([0], [0], marker=marker, color='w', label='Group B, Label 1', markerfacecolor='firebrick', markersize=8))
elif SHOW_GROUP_A and (SHOW_GROUP_B or SHOW_SHIFTED_GROUP_B):
    # Groups without differentiation between A and B, but B_shifted is different
    if SHOW_LABEL_0:
        if SHOW_GROUP_A or SHOW_GROUP_B:
            legend_elements.append(Line2D([0], [0], marker=marker, color='w', label='Label 0', markerfacecolor='skyblue', markersize=8))
        if SHOW_SHIFTED_GROUP_B:
            legend_elements.append(Line2D([0], [0], marker=marker, color='w', label='Label 0 (Shifted)', markerfacecolor='limegreen', markersize=8))
    if SHOW_LABEL_1:
        if SHOW_GROUP_A or SHOW_GROUP_B:
            legend_elements.append(Line2D([0], [0], marker=marker, color='w', label='Label 1', markerfacecolor='firebrick', markersize=8))
        if SHOW_SHIFTED_GROUP_B:
            legend_elements.append(Line2D([0], [0], marker=marker, color='w', label='Label 1 (Shifted)', markerfacecolor='darkgreen', markersize=8))

# Add commented out elements
#Line2D([0], [0], color='black', lw=2, linestyle='--', label='Decision Boundary (θ=π/4)'),
#Line2D([0], [0], color='gray', lw=1, linestyle='-', label='Unit Circle')
    
    # Add best guess to legend if enabled
    if SHOW_BEST_GUESS:
        legend_elements.append(Line2D([0], [0], color='#336699', lw=2, linestyle='-', label='Best Guess'))
    # Add initial guess to legend if enabled
    elif SHOW_INITIAL_GUESS:
        legend_elements.append(Line2D([0], [0], color='gray', lw=2, linestyle='-', label='Initial Guess'))
        
        # Add perturbations to legend if enabled
        if SHOW_PERTURBATIONS:
            legend_elements.append(Line2D([0], [0], color='lightgray', lw=1.5, linestyle='--', label='Perturbations'))
ax.legend(handles=legend_elements, title='Legend', loc='best')

# Save the plot to a file
# Build filename based on which features are enabled
filename_parts = []

# Add group information to filename
if SHOW_GROUP_A and (SHOW_GROUP_B or SHOW_SHIFTED_GROUP_B):
    if DIFFERENTIATE_GROUPS:
        filename_parts.append("with_differentiated_groups")
    else:
        if SHOW_SHIFTED_GROUP_B:
            filename_parts.append("with_shifted_group_B")
        else:
            filename_parts.append("with_both_groups_modified_B")
elif SHOW_GROUP_A:
    filename_parts.append("with_group_A_only")
elif SHOW_GROUP_B:
    filename_parts.append("with_group_B_only")

# Add label information to filename
if SHOW_LABEL_0 and not SHOW_LABEL_1:
    filename_parts.append("blue_only")
elif SHOW_LABEL_1 and not SHOW_LABEL_0:
    filename_parts.append("red_only")

# Add decision boundary information to filename
if SHOW_BEST_GUESS:
    filename_parts.append("best_guess")
    if SHOW_LOSS:
        filename_parts.append("loss")
elif SHOW_INITIAL_GUESS:
    filename_parts.append("initial_guess")
    if SHOW_PERTURBATIONS:
        filename_parts.append("perturbations")
    if SHOW_LOSS:
        filename_parts.append("loss")

# Construct the final filename
if filename_parts:
    filename = f"static/plots/binary_classification_{'_'.join(filename_parts)}.png"
else:
    filename = "static/plots/binary_classification.png"

plt.savefig(filename, dpi=300, bbox_inches='tight')
print(f"Plot saved to {filename}")

# Show the plot
plt.show()

# Create plots for each shifted Group B if enabled
if GENERATE_MULTIPLE_SHIFTS and multiple_shifted_groups:
    import os
    
    # Create subdirectory for shifted plots if it doesn't exist
    shifted_plots_dir = "static/plots/shifted_group_b"
    os.makedirs(shifted_plots_dir, exist_ok=True)
    
    print(f"\nGenerating {len(multiple_shifted_groups)} shifted Group B plots...")
    
    # For each shifted group, create a separate plot
    for i, shifted_group in enumerate(multiple_shifted_groups):
        # Create a new figure for this shifted group
        fig, ax = plt.subplots(figsize=(10, 8))
        
        # Plot the original Group A points for reference
        if SHOW_GROUP_A:
            for label_val, group_df in circle_data_group1.groupby('y'):
                if (label_val == 0 and SHOW_LABEL_0) or (label_val == 1 and SHOW_LABEL_1):
                    color = color_map[('A', label_val)]
                    ax.scatter(group_df['x1'], group_df['x2'],
                              c=color, marker='o', s=50, alpha=0.7)
        
        # Plot the shifted Group B points in green
        for label_val, group_df in shifted_group.groupby('y'):
            if (label_val == 0 and SHOW_LABEL_0) or (label_val == 1 and SHOW_LABEL_1):
                # Use green colors for shifted points
                color = 'limegreen' if label_val == 0 else 'darkgreen'
                ax.scatter(group_df['x1'], group_df['x2'],
                          c=color, marker='o', s=50, alpha=0.7)
        
        # Add titles and labels
        shift_id = shifted_group['group'].iloc[0].split('_')[-1]
        ax.set_title(f'Binary Classification with Shifted Group B (Variation {shift_id})')
        
        # Add grid and set equal aspect ratio
        ax.grid(True, linestyle='--', alpha=0.6)
        ax.set_aspect('equal')
        
        # Set axis limits
        ax.set_xlim(-1.5, 1.5)
        ax.set_ylim(-1.5, 1.5)
        
        # Create a custom legend
        legend_elements = [
            Line2D([0], [0], marker='o', color='w', label='Group A, Label 0',
                   markerfacecolor='skyblue', markersize=8),
            Line2D([0], [0], marker='o', color='w', label='Group A, Label 1',
                   markerfacecolor='firebrick', markersize=8),
            Line2D([0], [0], marker='o', color='w', label='Shifted Group B, Label 0',
                   markerfacecolor='limegreen', markersize=8),
            Line2D([0], [0], marker='o', color='w', label='Shifted Group B, Label 1',
                   markerfacecolor='darkgreen', markersize=8)
        ]
        
        # Add best guess line if enabled
        if SHOW_BEST_GUESS:
            best_y_vals = np.tan(BEST_FIT_THETA) * x_vals
            ax.plot(x_vals, best_y_vals, color='#336699', linestyle='-', linewidth=2, label='Best Guess')
            legend_elements.append(Line2D([0], [0], color='#336699', lw=2, linestyle='-', label='Best Guess'))
        
        ax.legend(handles=legend_elements, title='Legend', loc='best')
        
        # Save the plot to the shifted plots directory
        shifted_filename = f"{shifted_plots_dir}/shifted_group_b_variation_{shift_id}.png"
        plt.savefig(shifted_filename, dpi=300, bbox_inches='tight')
        print(f"Shifted plot saved to {shifted_filename}")
        
        # Close the figure to free memory
        plt.close(fig)
    
    print(f"All shifted Group B plots saved to {shifted_plots_dir}/")