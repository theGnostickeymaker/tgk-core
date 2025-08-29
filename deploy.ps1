param(
  [string]$Message = "TGK Phase 2 deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)

Write-Host "🔧 Pre-flight checks..." -ForegroundColor Cyan
if (-not (Test-Path ".git")) { Write-Error "Not a git repo (no .git folder)."; exit 1 }
if (-not (Get-Command "npx" -ErrorAction SilentlyContinue)) { Write-Error "npx not found. Install Node.js."; exit 1 }

# Optional: guard against committing local secrets
if (Test-Path ".env") {
  $gi = (Test-Path ".gitignore") ? (Get-Content ".gitignore") : @()
  if ($gi -notcontains ".env") {
    Write-Warning "'.env' is present but not in .gitignore. Add it to avoid pushing secrets."
  }
}

Write-Host "🧹 Cleaning old build..." -ForegroundColor Yellow
if (Test-Path "_site") { Remove-Item -Recurse -Force "_site" }

Write-Host "🏗️  Building Eleventy site..." -ForegroundColor Yellow
npx @11ty/eleventy
if ($LASTEXITCODE -ne 0) { Write-Error "Eleventy build failed."; exit 1 }

Write-Host "🔍 Git status (pre-commit):" -ForegroundColor Cyan
git status -s

# If nothing changed, bail early
$changes = git status --porcelain
if ([string]::IsNullOrWhiteSpace($changes)) {
  Write-Host "✅ No changes to commit. Build OK. Nothing to deploy." -ForegroundColor Green
  exit 0
}

Write-Host "➕ Staging changes..." -ForegroundColor Yellow
git add -A

Write-Host "💬 Committing..." -ForegroundColor Yellow
git commit -m "$Message" | Out-Host

# Ensure we’re on main (or whatever default) and pull/rebase to avoid non-fast-forward
$currentBranch = (git rev-parse --abbrev-ref HEAD).Trim()
if ([string]::IsNullOrWhiteSpace($currentBranch)) { Write-Error "Cannot detect current branch."; exit 1 }

Write-Host "⬇️  Syncing remote ($currentBranch)..." -ForegroundColor Yellow
git pull --rebase origin $currentBranch | Out-Host
if ($LASTEXITCODE -ne 0) {
  Write-Warning "Pull --rebase had conflicts. Resolve them, then re-run deploy.ps1."
  exit 1
}

Write-Host "⬆️  Pushing to origin/$currentBranch..." -ForegroundColor Yellow
git push origin $currentBranch | Out-Host
if ($LASTEXITCODE -ne 0) { Write-Error "Git push failed."; exit 1 }

Write-Host "🚀 Deploy triggered (Netlify will auto-build from Git)." -ForegroundColor Green
Write-Host "🖥️  Tip: keep Netlify tab open to watch logs."
