param(
  [string]$Message = "Update paper notes"
)

$ErrorActionPreference = "Stop"

git add notes source note README.md index.html .github scripts .gitignore .nojekyll

$staged = git diff --cached --name-only
if (-not $staged) {
  Write-Host "No note site changes to publish."
  exit 0
}

git commit -m $Message
git push origin main
