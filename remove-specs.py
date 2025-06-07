import os

def remove_matching_files(root_dir: str, substring: str):
    """
    Walks through root_dir and deletes any file whose name contains substring.
    """
    for dirpath, dirnames, filenames in os.walk(root_dir):
        for filename in filenames:
            if substring in filename:
                full_path = os.path.join(dirpath, filename)
                print(f"Deleting {full_path}")
                os.remove(full_path)

if __name__ == "__main__":
    # Example: delete all files containing "temp" under ./my_project
    remove_matching_files("./", "spec.ts")
