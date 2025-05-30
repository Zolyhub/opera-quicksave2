import os

def ensure_dirs(target_folder):
    os.makedirs(target_folder, exist_ok=True)

def save_file(target_folder, filename, content_bytes):
    ensure_dirs(target_folder)
    with open(os.path.join(target_folder, filename), "wb") as f:
        f.write(content_bytes)
# További bővítés: quicksave panel action-ök feldolgozása!
