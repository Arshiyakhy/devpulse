import zipfile
import os
import sys

source_dir = "devpulse-deploy"
output_zip = "devpulse-api-py.zip"

if os.path.exists(output_zip):
    os.remove(output_zip)

with zipfile.ZipFile(output_zip, "w", zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(source_dir):
        for file in files:
            filepath = os.path.join(root, file)
            # Use forward slashes and strip the source_dir prefix so paths
            # are relative and Unix-style inside the archive.
            arcname = os.path.relpath(
                filepath, source_dir).replace(os.sep, "/")
            zf.write(filepath, arcname)

print(f"Created {output_zip}")
