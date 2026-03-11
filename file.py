import shutil
from pathlib import Path

import kagglehub
import numpy as np


DATASET_HANDLE = "sidd108/jewelry-detection-dataset"
WORKSPACE_DIR = Path(__file__).resolve().parent
DOWNLOAD_ROOT = WORKSPACE_DIR / "dataset" / "_kaggle_cache"
TARGET_DIR = WORKSPACE_DIR / "dataset" / "necklace_images"
IMAGE_PATHS_FILE = WORKSPACE_DIR / "image_paths.npy"


def build_source_index(source_root: Path) -> dict[str, Path]:
	"""Map filename -> full path for fast lookup while copying required images."""
	index: dict[str, Path] = {}
	for path in source_root.rglob("*"):
		if not path.is_file():
			continue
		suffix = path.suffix.lower()
		if suffix not in {".jpg", ".jpeg", ".png", ".webp"}:
			continue
		# Keep the first occurrence for stable behavior.
		index.setdefault(path.name, path)
	return index


def load_required_filenames(image_paths_file: Path) -> list[str]:
	image_paths = np.load(image_paths_file, allow_pickle=True)
	return [Path(str(p).replace("\\", "/")).name for p in image_paths]


def main() -> None:
	DOWNLOAD_ROOT.mkdir(parents=True, exist_ok=True)
	TARGET_DIR.mkdir(parents=True, exist_ok=True)

	print("Downloading dataset from Kaggle (force_download=True)...")
	downloaded_path = kagglehub.dataset_download(
		DATASET_HANDLE,
		force_download=True,
		output_dir=str(DOWNLOAD_ROOT),
	)

	source_root = Path(downloaded_path)
	print(f"Downloaded dataset path: {source_root}")

	if not IMAGE_PATHS_FILE.exists():
		raise FileNotFoundError(f"Missing required file: {IMAGE_PATHS_FILE}")

	source_index = build_source_index(source_root)
	required_filenames = load_required_filenames(IMAGE_PATHS_FILE)

	copied = 0
	missing = []
	for filename in required_filenames:
		source = source_index.get(filename)
		if source is None:
			missing.append(filename)
			continue

		destination = TARGET_DIR / filename
		if not destination.exists():
			shutil.copy2(source, destination)
			copied += 1

	print(f"Required images: {len(required_filenames)}")
	print(f"Copied new images: {copied}")
	print(f"Missing images: {len(missing)}")
	if missing:
		print("First 20 missing filenames:")
		for name in missing[:20]:
			print(f" - {name}")


if __name__ == "__main__":
	main()