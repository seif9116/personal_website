import imageio.v2 as imageio
from PIL import Image
import os

# Directory containing the frames
frames_dir = "static/plots/performative_prediction"

# Output GIF path
gif_path = os.path.join(frames_dir, "performative_prediction.gif")

# Get all frame filenames and sort them
frame_files = [f for f in os.listdir(frames_dir) if f.startswith("frame_") and f.endswith(".png")]
frame_files.sort()

# Full paths to frames
frame_paths = [os.path.join(frames_dir, f) for f in frame_files]

print(f"Found {len(frame_paths)} frames:")
for path in frame_paths:
    print(f"  - {path}")

# Read all frames
frames = []
for path in frame_paths:
    frames.append(Image.open(path))

print("Creating GIF...")
# Save as GIF
frames[0].save(
    gif_path,
    save_all=True,
    append_images=frames[1:],
    duration=1000,  # Duration per frame in milliseconds
    loop=0  # 0 means loop indefinitely
)

print(f"GIF saved to {gif_path}")

# Also create a combined image showing all frames side by side
import matplotlib.pyplot as plt
import numpy as np

print("Creating combined image...")
fig, axes = plt.subplots(1, len(frames), figsize=(5*len(frames), 5))

for i, (ax, path) in enumerate(zip(axes, frame_paths)):
    img = plt.imread(path)
    ax.imshow(img)
    ax.set_title(f"Step {i}")
    ax.axis('off')

plt.tight_layout()
static_filename = os.path.join(frames_dir, "performative_prediction_steps.png")
plt.savefig(static_filename, dpi=300, bbox_inches='tight')
print(f"Combined image saved to {static_filename}")