Write-Host "⚡ Cleaning old build..."
if (Test-Path _site) { Remove-Item -Recurse -Force _site }

Write-Host "⚡ Rebuilding with Eleventy..."
npx @11ty/eleventy

Write-Host "✅ Done. Fresh build ready in ./_site"
