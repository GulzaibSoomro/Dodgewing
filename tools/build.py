#!/usr/bin/env python3
"""Compatibility entrypoint for the canonical, offline asset-complete builder."""
from pathlib import Path
import subprocess
subprocess.run(['node', str(Path(__file__).with_name('build.js'))], check=True)
